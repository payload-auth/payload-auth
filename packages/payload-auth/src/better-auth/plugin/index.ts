import type { Config } from "payload";
import type { BetterAuthPluginOptions } from "./types.js";
import { sanitizeBetterAuthOptions } from "./lib/sanitize-better-auth-options/index.js";
import { getRequiredCollectionSlugs } from "./lib/get-required-collection-slugs.js";
import { buildCollections } from "./lib/build-collections/index.js";
import { initBetterAuth } from "./lib/init-better-auth.js";
import { adminRoutes } from "./lib/constants.js";
export * from "./types.js";
export * from "./helpers/index.js";
export { sanitizeBetterAuthOptions } from "./lib/sanitize-better-auth-options/index.js";
export { getPayloadAuth } from "./lib/get-payload-auth.js";

export function betterAuthPlugin(pluginOptions: BetterAuthPluginOptions) {
  return (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config;
    }

    const betterAuthOptions = sanitizeBetterAuthOptions({
      config,
      options: pluginOptions,
    });

    config.custom = {
      ...config.custom,
      hasBetterAuthPlugin: true,
    };

    // Set custom admin components if disableDefaultPayloadAuth is true
    if (pluginOptions.disableDefaultPayloadAuth) {
      config.admin = {
        ...config.admin,
        components: {
          ...config.admin?.components,
          afterLogin: [
            {
              path: "payload-auth/better-auth/plugin/rsc#RSCRedirect",
              serverProps: {
                redirectTo: `${config.routes?.admin || "/admin"}${adminRoutes.login}`,
              },
            },
            ...(config.admin?.components?.afterLogin || []),
          ],
          logout: {
            Button: {
              path: "payload-auth/better-auth/plugin/client#LogoutButton",
            },
          },
          views: {
            ...config.admin?.components?.views,
            login: {
              path: adminRoutes.login,
              Component: {
                path: "payload-auth/better-auth/plugin/rsc#Login",
                serverProps: {
                  pluginOptions: pluginOptions,
                  betterAuthOptions: betterAuthOptions,
                },
              },
            },
            // logout: {
            //   path: adminRoutes.logout,
            //   Component: {
            //     path: "payload-auth/better-auth/plugin/rsc#Logout",
            //   },
            // },
            createFirstAdmin: {
              path: adminRoutes.createFirstAdmin,
              Component: {
                path: "payload-auth/better-auth/plugin/rsc#CreateFirstAdmin",
                serverProps: {
                  pluginOptions: pluginOptions,
                  betterAuthOptions: betterAuthOptions,
                },
              },
            },
            forgotPassword: {
              path: adminRoutes.forgotPassword,
              Component: {
                path: "payload-auth/better-auth/plugin/rsc#Forgot",
                serverProps: {
                  betterAuthOptions: betterAuthOptions,
                },
              },
            },
            resetPassword: {
              path: adminRoutes.resetPassword,
              Component: {
                path: "payload-auth/better-auth/plugin/rsc#ResetPassword",
              },
            },
            adminInvite: {
              path: adminRoutes.adminInvite,
              Component: {
                path: "payload-auth/better-auth/plugin/rsc#AdminInvite",
                serverProps: {
                  pluginOptions: pluginOptions,
                  betterAuthOptions: betterAuthOptions,
                },
              },
            },
            inactivity: {
              path: adminRoutes.inactivity,
              Component: {
                path: "payload-auth/better-auth/plugin/rsc#Inactivity",
              },
            },
          },
        },
        routes: {
          ...config.admin?.routes,
          login: adminRoutes.loginRedirect,
        },
        // Add admin routes to the custom object
        // We need this to create links in the admin views.
        custom: {
          ...config.admin?.custom,
          betterAuth: {
            ...config.admin?.custom?.betterAuth,
            adminRoutes: {
              ...adminRoutes,
              ...(config.admin?.custom?.betterAuth?.adminRoutes || {}),
            },
          },
        },
      };
    }

    // Determine which collections to add based on the options and plugins
    const requiredCollectionSlugs = getRequiredCollectionSlugs({
      logTables: pluginOptions.debug?.logTables ?? false,
      pluginOptions,
      betterAuthOptions,
    });

    if (!config.collections) {
      config.collections = [];
    }

    // Update with the required collections + existing collections
    config.collections = buildCollections({
      incomingCollections: config.collections ?? [],
      requiredCollectionSlugs,
      pluginOptions,
      betterAuthOptions,
    });

    const incomingOnInit = config.onInit;

    config.onInit = async (payload) => {
      try {
        // Execute any existing onInit functions first
        if (incomingOnInit) {
          await incomingOnInit(payload);
        }

        // Initialize and set the betterAuth instance
        const auth = initBetterAuth<
          NonNullable<typeof betterAuthOptions.plugins>
        >({
          payload,
          idType: payload.db.defaultIDType,
          options: {
            ...betterAuthOptions,
            enableDebugLogs: pluginOptions.debug?.enableDebugLogs ?? false,
            plugins: [...(betterAuthOptions.plugins ?? [])],
          },
        });

        // Type-safe extension of payload with betterAuth
        Object.defineProperty(payload, "betterAuth", {
          value: auth,
          writable: false,
          configurable: false,
        });
      } catch (error) {
        console.error("Failed to initialize BetterAuth:", error);
        throw error;
      }
    };
    return config;
  };
}
