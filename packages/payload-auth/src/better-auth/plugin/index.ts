import type { Config } from 'payload'
import { adminRoutes, baModelKey, baModelKeyToSlug, baseSlugs, supportedBAPluginIds } from './constants'
import { checkPluginExists } from './helpers/check-plugin-exists'
import { getMappedCollection } from './helpers/get-collection'
import { buildCollectionMap } from './lib/build-collections/index'
import { initBetterAuth } from './lib/init-better-auth'
import { sanitizeBetterAuthOptions } from './lib/sanitize-better-auth-options/index'
import { setLoginMethods } from './lib/set-login-methods'
import type { BetterAuthPluginOptions } from './types'
import { getCollectionSlug } from './helpers/get-collection-slug'

export * from './helpers/index'
export { getPayloadAuth } from './lib/get-payload-auth'
export { sanitizeBetterAuthOptions } from './lib/sanitize-better-auth-options/index'
export * from './types'

export function betterAuthPlugin(pluginOptions: BetterAuthPluginOptions) {
  return (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config
    }

    config.custom = {
      ...config.custom,
      hasBetterAuthPlugin: true
    }

    pluginOptions = setLoginMethods({ pluginOptions })

    // Build the collection map
    const collectionMap = buildCollectionMap({
      incomingCollections: config.collections ?? [],
      pluginOptions
    })

    const betterAuthOptions = sanitizeBetterAuthOptions({
      collectionMap,
      pluginOptions
    })
    pluginOptions.betterAuthOptions = betterAuthOptions

    // Set custom admin components if disableDefaultPayloadAuth is true
    if (pluginOptions.disableDefaultPayloadAuth) {
      config.admin = {
        ...config.admin,
        components: {
          ...config.admin?.components,
          afterLogin: [
            {
              path: 'payload-auth/better-auth/plugin/rsc#RSCRedirect',
              serverProps: {
                redirectTo: `${config.routes?.admin === undefined ? '/admin' : config.routes.admin}${adminRoutes.adminLogin}`
              }
            },
            ...(config.admin?.components?.afterLogin || [])
          ],
          logout: {
            Button: {
              path: 'payload-auth/better-auth/plugin/client#LogoutButton'
            }
          },
          views: {
            ...config.admin?.components?.views,
            adminLogin: {
              path: adminRoutes.adminLogin,
              Component: {
                path: 'payload-auth/better-auth/plugin/rsc#AdminLogin',
                serverProps: {
                  pluginOptions: pluginOptions,
                  adminInvitationsSlug: getCollectionSlug({ modelKey: baseSlugs.adminInvitations, pluginOptions })
                }
              }
            },
            adminSignup: {
              path: adminRoutes.adminSignup,
              Component: {
                path: 'payload-auth/better-auth/plugin/rsc#AdminSignup',
                serverProps: {
                  pluginOptions: pluginOptions,
                  adminInvitationsSlug: getCollectionSlug({ modelKey: baseSlugs.adminInvitations, pluginOptions })
                }
              }
            },
            forgotPassword: {
              path: adminRoutes.forgotPassword,
              Component: {
                path: 'payload-auth/better-auth/plugin/rsc#ForgotPassword'
              }
            },
            resetPassword: {
              path: adminRoutes.resetPassword,
              Component: {
                path: 'payload-auth/better-auth/plugin/rsc#ResetPassword'
              }
            },
            ...(checkPluginExists(betterAuthOptions ?? {}, supportedBAPluginIds.twoFactor) && {
              twoFactorVerify: {
                path: adminRoutes.twoFactorVerify,
                Component: {
                  path: 'payload-auth/better-auth/plugin/rsc#TwoFactorVerify',
                  serverProps: {
                    pluginOptions: pluginOptions,
                    verificationsSlug: getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.verification })?.slug
                  }
                }
              }
            })
          }
        },
        routes: {
          ...config.admin?.routes,
          login: adminRoutes.loginRedirect
        }
      }
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
        const auth = initBetterAuth<NonNullable<typeof betterAuthOptions.plugins>>({
          payload,
          idType: payload.db.defaultIDType,
          options: {
            ...betterAuthOptions,
            enableDebugLogs: pluginOptions.debug?.enableDebugLogs ?? false,
            plugins: [...(betterAuthOptions.plugins ?? [])]
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
