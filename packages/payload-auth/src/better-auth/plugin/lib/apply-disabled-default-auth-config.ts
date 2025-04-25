import { adminRoutes, baModelKey, baseSlugs, supportedBAPluginIds } from '../constants'
import { checkPluginExists } from '../helpers/check-plugin-exists'
import type { BetterAuthPluginOptions, BetterAuthSchemas } from '../types'
import type { Config, CollectionConfig } from 'payload'

/**
 * Applies all admin-related overrides when `disableDefaultPayloadAuth` is `true`.
 * Mutates the provided Payload config in-place.
 */
export function applyDisabledDefaultAuthConfig({
  config,
  pluginOptions,
  collectionMap,
  resolvedBetterAuthSchemas
}: {
  config: Config
  pluginOptions: BetterAuthPluginOptions
  collectionMap: Record<string, CollectionConfig>
  resolvedBetterAuthSchemas: BetterAuthSchemas
}): void {
  config.admin = {
    ...config.admin,
    components: {
      ...config.admin?.components,
      afterLogin: [
        {
          path: 'payload-auth/better-auth/plugin/rsc#RSCRedirect',
          serverProps: {
            redirectTo: `${config.routes?.admin === undefined ? '/admin' : config.routes.admin.replace(/\/+$/, '')}${adminRoutes.adminLogin}`
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
              adminInvitationsSlug: collectionMap[baseSlugs.adminInvitations].slug
            }
          }
        },
        adminSignup: {
          path: adminRoutes.adminSignup,
          Component: {
            path: 'payload-auth/better-auth/plugin/rsc#AdminSignup',
            serverProps: {
              pluginOptions: pluginOptions,
              adminInvitationsSlug: collectionMap[baseSlugs.adminInvitations].slug
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
        ...(checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.twoFactor) && {
          twoFactorVerify: {
            path: adminRoutes.twoFactorVerify,
            Component: {
              path: 'payload-auth/better-auth/plugin/rsc#TwoFactorVerify',
              serverProps: {
                pluginOptions: pluginOptions,
                verificationsSlug: resolvedBetterAuthSchemas[baModelKey.verification].modelName
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
