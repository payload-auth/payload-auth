import type { CollectionConfig, Config } from "payload";
import {
  adminRoutes,
  baModelKey,
  baseSlugs,
  supportedBAPluginIds
} from "../constants";
import { checkPluginExists } from "../helpers/check-plugin-exists";
import type { BetterAuthSchemas, PayloadAuthOptions } from "../types";
import { stripSecretsFromPluginOptions } from "./strip-secrets";

/**
 * Applies Better Auth admin UI overrides to the Payload config.
 * Replaces default Payload login/signup/password views with Better Auth equivalents.
 * Mutates the provided Payload config in-place.
 */
export function applyBetterAuthAdminConfig({
  config,
  pluginOptions,
  collectionMap,
  resolvedBetterAuthSchemas
}: {
  config: Config;
  pluginOptions: PayloadAuthOptions;
  collectionMap: Record<string, CollectionConfig>;
  resolvedBetterAuthSchemas: BetterAuthSchemas;
}): void {
  // serverProps get serialized into the admin client config and embedded in
  // the RSC payload of the HTML response, so anything passed here is public.
  // Strip secret and socialProviders[*].clientSecret before handing them off.
  const safePluginOptions = stripSecretsFromPluginOptions(pluginOptions);

  config.admin = {
    ...config.admin,
    components: {
      ...config.admin?.components,
      afterLogin: [
        {
          path: "payload-auth/better-auth/plugin/rsc#RSCRedirect",
          serverProps: {
            pluginOptions: safePluginOptions,
            redirectTo: `${config.routes?.admin === undefined ? "/admin" : config.routes.admin.replace(/\/+$/, "")}${adminRoutes.adminLogin}`
          }
        },
        ...(config.admin?.components?.afterLogin || [])
      ],
      logout: {
        Button: {
          path: "payload-auth/better-auth/plugin/client#LogoutButton"
        }
      },
      views: {
        ...config.admin?.components?.views,
        adminLogin: {
          path: adminRoutes.adminLogin,
          Component: {
            path: "payload-auth/better-auth/plugin/rsc#AdminLogin",
            serverProps: {
              pluginOptions: safePluginOptions,
              adminInvitationsSlug:
                collectionMap[baseSlugs.adminInvitations].slug
            }
          }
        },
        adminSignup: {
          path: adminRoutes.adminSignup,
          Component: {
            path: "payload-auth/better-auth/plugin/rsc#AdminSignup",
            serverProps: {
              pluginOptions: safePluginOptions,
              adminInvitationsSlug:
                collectionMap[baseSlugs.adminInvitations].slug
            }
          }
        },
        forgotPassword: {
          path: adminRoutes.forgotPassword,
          Component: {
            path: "payload-auth/better-auth/plugin/rsc#ForgotPassword",
            serverProps: {
              pluginOptions: safePluginOptions
            }
          }
        },
        resetPassword: {
          path: adminRoutes.resetPassword,
          Component: {
            path: "payload-auth/better-auth/plugin/rsc#ResetPassword",
            serverProps: {
              pluginOptions: safePluginOptions
            }
          }
        },
        ...(checkPluginExists(
          pluginOptions.betterAuthOptions ?? {},
          supportedBAPluginIds.twoFactor
        ) && {
          twoFactorVerify: {
            path: adminRoutes.twoFactorVerify,
            Component: {
              path: "payload-auth/better-auth/plugin/rsc#TwoFactorVerify",
              serverProps: {
                pluginOptions: safePluginOptions,
                verificationsSlug:
                  resolvedBetterAuthSchemas[baModelKey.verification].modelName
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
  };
}
