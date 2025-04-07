import type { Config } from 'payload'
import type { BetterAuthPluginOptions } from './types.js'
import { sanitizeBetterAuthOptions } from './lib/sanitize-better-auth-options/index.js'
import { getRequiredCollectionSlugs } from './lib/get-required-collection-slugs.js'
import { buildCollections } from './lib/build-collections/index.js'
import { initBetterAuth } from './lib/init-better-auth.js'

export * from './types.js'
export * from './helpers/index.js'
export { sanitizeBetterAuthOptions } from './lib/sanitize-better-auth-options/index.js'
export { getPayloadAuth } from './lib/get-payload-auth.js'

export function betterAuthPlugin(pluginOptions: BetterAuthPluginOptions) {
  return (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config
    }

    const betterAuthOptions = sanitizeBetterAuthOptions({
      config,
      options: pluginOptions,
    })

    config.custom = {
      ...config.custom,
      hasBetterAuthPlugin: true,
    }

    // Set custom admin components if disableDefaultPayloadAuth is true
    if (pluginOptions.disableDefaultPayloadAuth) {
      config.admin = {
        ...config.admin,
        components: {
          ...config.admin?.components,
          afterLogin: [
            {
              path: 'payload-auth/better-auth/plugin/rsc#LoginRedirect',
            },
            ...(config.admin?.components?.afterLogin || []),
          ],
          views: {
            ...config.admin?.components?.views,
            login: {
              path: '/login',
              Component: {
                path: 'payload-auth/better-auth/plugin/rsc#Login',
                serverProps: {
                  defaultAdminRole: pluginOptions.users?.adminRoles?.[0],
                  pluginOptions: pluginOptions,
                  betterAuthOptions: betterAuthOptions,
                },
              },
            },
            createFirstAdmin: {
              path: '/create-first-admin',
              Component: {
                path: 'payload-auth/better-auth/plugin/rsc#CreateFirstAdmin',
                serverProps: {
                  defaultAdminRole: pluginOptions.users?.adminRoles?.[0],
                  pluginOptions: pluginOptions,
                  betterAuthOptions: betterAuthOptions,
                },
              },
            },
          },
        },
        routes: {
          ...config.admin?.routes,
          login: '/login-redirect',
        },
      }
    }

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
