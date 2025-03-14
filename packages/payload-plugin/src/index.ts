import { getPayload } from 'payload'
import type { BasePayload, Config, SanitizedConfig } from 'payload'
import type {
  BetterAuthFunctionOptions,
  BetterAuthReturn,
  PayloadBetterAuthPluginOptions,
  TPlugins,
} from './types.js'
import { sanitizeBetterAuthOptions } from './lib/sanitize-auth-options.js'
import { getRequiredCollectionSlugs } from './lib/get-required-collection-slugs.js'
import { buildCollectionConfigs } from './lib/build-collection-configs.js'
import { payloadAdapter } from '@payload-auth/better-auth-db-adapter'
import { betterAuth } from 'better-auth'

function initBetterAuth<P extends TPlugins>({
  payload,
  options,
}: {
  payload: BasePayload
  options: BetterAuthFunctionOptions<P>
}): BetterAuthReturn<P> {
  const auth = betterAuth({
    ...options,
    database: payloadAdapter(payload, {
      enable_debug_logs: options.enable_debug_logs ?? false,
    }),
  })

  return auth as unknown as BetterAuthReturn<P>
}

export function payloadBetterAuth(pluginOptions: PayloadBetterAuthPluginOptions) {
  return (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config
    }

    if (!config.collections) {
      config.collections = []
    }

    const sanitzedBetterAuthOptions = sanitizeBetterAuthOptions(pluginOptions)

    // Determine which collections to add based on the options and plugins
    const requiredCollectionSlugs = getRequiredCollectionSlugs({
      enable_debug_logs: pluginOptions.enable_debug_logs ?? false,
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

    if (!config.endpoints) {
      config.endpoints = []
    }

    if (!config.admin) {
      config.admin = {}
    }

    if (!config.admin.components) {
      config.admin.components = {}
    }

    if (!config.admin.components.beforeDashboard) {
      config.admin.components.beforeDashboard = []
    }

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
          enable_debug_logs: pluginOptions.enable_debug_logs,
          plugins: [...(sanitzedBetterAuthOptions.plugins ?? [])],
        },
      })

      ;(payload as BasePayload & { betterAuth: typeof auth }).betterAuth = auth
    }
    return config
  }
}

export async function getPayloadWithAuth<P extends TPlugins>(
  config: Promise<SanitizedConfig> | SanitizedConfig,
): Promise<BasePayload & { betterAuth: BetterAuthReturn<P> }> {
  const payload = (await getPayload({ config })) as BasePayload & {
    betterAuth: BetterAuthReturn<P>
  }
  return payload
}
