import type { BasePayload, Config } from 'payload'
import type { PayloadBetterAuthPluginOptions } from './types'
import { sanitizeBetterAuthOptions } from './lib/sanitize-auth-options'
import { getRequiredCollectionSlugs } from './lib/get-required-collection-slugs'
import { buildCollectionConfigs } from './lib/build-collection-configs'
import { respectSaveToJwtFieldsMiddleware } from './lib/respect-save-to-jwt-fields-middleware'
import { initBetterAuth } from './lib/init-better-auth'

export * from './types'
export * from './helpers'
export { sanitizeBetterAuthOptions } from './lib/sanitize-auth-options'
export { getPayloadAuth } from './lib/get-payload-auth'

export function betterAuthPlugin(pluginOptions: PayloadBetterAuthPluginOptions) {
  return (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config
    }
    config.custom = {
      ...config.custom,
      hasBetterAuthPlugin: true,
    }

    if (!config.collections) {
      config.collections = []
    }

    let sanitzedBetterAuthOptions = sanitizeBetterAuthOptions(pluginOptions)

    // Determine which collections to add based on the options and plugins
    const requiredCollectionSlugs = getRequiredCollectionSlugs({
      logTables: pluginOptions.logTables ?? false,
      pluginOptions,
      sanitizedBAOptions: sanitzedBetterAuthOptions,
    })

    // Update with the required collections + existing collections
    config.collections = buildCollectionConfigs({
      incomingCollections: config.collections ?? [],
      requiredCollectionSlugs,
      pluginOptions,
      sanitizedBAOptions: sanitzedBetterAuthOptions,
    })

    respectSaveToJwtFieldsMiddleware({
      sanitizedOptions: sanitzedBetterAuthOptions,
      payloadConfig: config,
      pluginOptions,
    })

    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      // Ensure we are executing any existing onInit functions before running our own.
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      // Initialize and set the betterAuth instance
      const auth = initBetterAuth<NonNullable<typeof sanitzedBetterAuthOptions.plugins>>({
        payload,
        options: {
          ...sanitzedBetterAuthOptions,
          enableDebugLogs: pluginOptions.enableDebugLogs,
          plugins: [...(sanitzedBetterAuthOptions.plugins ?? [])],
        },
      })
      ;(payload as BasePayload & { betterAuth: typeof auth }).betterAuth = auth
    }
    return config
  }
}
