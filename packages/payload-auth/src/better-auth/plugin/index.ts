import type { BetterAuthOptions } from 'better-auth/types'
import { getPayload, SanitizedConfig, type Config } from 'payload'
import { payloadAdapter } from 'payload-auth/better-auth/adapter'
import { PayloadAdapterParams } from '../types'
import { getDefaultBetterAuthSchema } from './helpers/get-better-auth-schema'
import { syncResolvedSchemaWithCollectionMap } from './helpers/sync-resolved-schema-with-collection-map'
import { applyDisabledDefaultAuthConfig } from './lib/apply-disabled-default-auth-config'
import { buildCollections } from './lib/build-collections/index'
import { initBetterAuth } from './lib/init-better-auth'
import { sanitizeBetterAuthOptions } from './lib/sanitize-better-auth-options/index'
import { setLoginMethods } from './lib/set-login-methods'
import type { BetterAuthPluginOptions } from './types'

export * from './helpers/index'
export { getPayloadAuth } from './lib/get-payload-auth'
export { sanitizeBetterAuthOptions } from './lib/sanitize-better-auth-options/index'
export * from './types'

function buildBetterAuthData({
  payloadConfig,
  pluginOptions
}: {
  payloadConfig: SanitizedConfig
  pluginOptions: BetterAuthPluginOptions
}) {
  pluginOptions = setLoginMethods({ pluginOptions })

  const defaultBetterAuthSchemas = getDefaultBetterAuthSchema(pluginOptions)

  const collectionMap = buildCollections({
    resolvedSchemas: defaultBetterAuthSchemas,
    incomingCollections: payloadConfig.collections ?? [],
    pluginOptions
  })

  const resolvedBetterAuthSchemas = syncResolvedSchemaWithCollectionMap(defaultBetterAuthSchemas, collectionMap)

  const sanitizedBetterAuthOptions = sanitizeBetterAuthOptions({
    config: payloadConfig,
    pluginOptions,
    resolvedSchemas: resolvedBetterAuthSchemas
  })

  pluginOptions.betterAuthOptions = sanitizedBetterAuthOptions

  return {
    pluginOptions,
    collectionMap,
    resolvedBetterAuthSchemas,
    sanitizedBetterAuthOptions
  }
}

export function betterAuthPlugin(pluginOptions: BetterAuthPluginOptions) {
  return (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config
    }

    config.custom = {
      ...config.custom,
      hasBetterAuthPlugin: true
    }

    const { collectionMap, resolvedBetterAuthSchemas, sanitizedBetterAuthOptions } = buildBetterAuthData({
      payloadConfig: config as SanitizedConfig,
      pluginOptions
    })

    // ---------------------- Finalize config -----------------
    if (pluginOptions.disableDefaultPayloadAuth) {
      applyDisabledDefaultAuthConfig({
        config,
        pluginOptions,
        collectionMap,
        resolvedBetterAuthSchemas
      })
    }

    config.collections = config.collections ?? []
    config.collections = Object.values(collectionMap)

    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      try {
        // Execute any existing onInit functions first
        if (incomingOnInit) {
          await incomingOnInit(payload)
        }

        // Initialize and set the betterAuth instance
        const auth = initBetterAuth<NonNullable<typeof sanitizedBetterAuthOptions.plugins>>({
          payload,
          idType: payload.db.defaultIDType,
          options: {
            ...sanitizedBetterAuthOptions,
            enableDebugLogs: pluginOptions.debug?.enableDebugLogs ?? false,
            plugins: [...(sanitizedBetterAuthOptions.plugins ?? [])]
          }
        })

        // Type-safe extension of payload with betterAuth
        Object.defineProperty(payload, 'betterAuth', {
          value: auth,
          writable: false,
          configurable: false
        })
      } catch (error) {
        console.error('Failed to initialize BetterAuth:', error)
        throw error
      }
    }
    return config
  }
}

export function withPayloadAuth({
  payloadConfig,
  betterAuthConfig: pluginOptions,
  adapterOptions
}: {
  payloadConfig: SanitizedConfig
  betterAuthConfig: BetterAuthPluginOptions
  adapterOptions: Pick<PayloadAdapterParams, 'idType'> & Partial<Pick<PayloadAdapterParams, 'payloadClient'>>
}): BetterAuthOptions {

  if (pluginOptions.disabled) {
    return pluginOptions.betterAuthOptions as BetterAuthOptions
  }

  const { sanitizedBetterAuthOptions } = buildBetterAuthData({
    payloadConfig,
    pluginOptions: structuredClone(pluginOptions)
  })

  const optionsWithAdapter: BetterAuthOptions = {
    ...sanitizedBetterAuthOptions,
    database: payloadAdapter({
      payloadClient: adapterOptions?.payloadClient ?? (async () => await getPayload({ config: payloadConfig })),
      idType: adapterOptions.idType
    })
  }

  return optionsWithAdapter
}
