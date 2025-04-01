import type { Config } from 'payload'
import type { BetterAuthPluginOptions } from './types'
import { sanitizeBetterAuthOptions } from './lib/sanitize-better-auth-options'
import { getRequiredCollectionSlugs } from './lib/get-required-collection-slugs'
import { buildCollections } from './lib/build-collections'
import { initBetterAuth } from './lib/init-better-auth'

export * from './types'
export * from './helpers'
export { sanitizeBetterAuthOptions } from './lib/sanitize-better-auth-options'
export { getPayloadAuth } from './lib/get-payload-auth'

export function betterAuthPlugin(pluginOptions: BetterAuthPluginOptions) {
  return (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config
    }
    config.custom = {
      ...config.custom,
      hasBetterAuthPlugin: true,
    }

    const betterAuthOptions = sanitizeBetterAuthOptions({
      config,
      options: pluginOptions,
    })

    // Determine which collections to add based on the options and plugins
    const requiredCollectionSlugs = getRequiredCollectionSlugs({
      logTables: pluginOptions.debug?.logTables ?? false,
      pluginOptions,
      sanitizedBAOptions: betterAuthOptions,
    })

    if (!config.collections) {
      config.collections = []
    }

    // Update with the required collections + existing collections
    config.collections = buildCollections({
      incomingCollections: config.collections ?? [],
      requiredCollectionSlugs,
      pluginOptions,
      sanitizedBAOptions: betterAuthOptions,
    })

    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      try {
        // Execute any existing onInit functions first
        if (incomingOnInit) {
          await incomingOnInit(payload)
        }

        // Initialize and set the betterAuth instance
        const auth = initBetterAuth<NonNullable<typeof betterAuthOptions.plugins>>({
          payload,
          options: {
            ...betterAuthOptions,
            enableDebugLogs: pluginOptions.debug?.enableDebugLogs ?? false,
            plugins: [...(betterAuthOptions.plugins ?? [])],
          },
        })

        // Type-safe extension of payload with betterAuth
        Object.defineProperty(payload, 'betterAuth', {
          value: auth,
          writable: false,
          configurable: false,
        })
      } catch (error) {
        console.error('Failed to initialize BetterAuth:', error)
        throw error
      }
    }
    return config
  }
}
