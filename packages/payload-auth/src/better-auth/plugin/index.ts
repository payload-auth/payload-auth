import type { Config } from "payload";
import type { BetterAuthPluginOptions } from "./types.js";
import { sanitizeBetterAuthOptions } from "./lib/sanitize-better-auth-options/index.js";
import { getRequiredCollectionSlugs } from "./lib/get-required-collection-slugs.js";
import { buildCollections } from "./lib/build-collections/index.js";
import { initBetterAuth } from "./lib/init-better-auth.js";
import { getSetAdminRoleEndpoint } from "./payload/endpoints/set-admin-role";
import { getAllRoleOptions } from "./helpers/get-all-roles";
import { getGenerateInviteUrlEndpoint } from "./payload/endpoints/generate-invite-url";
import { getSignupEndpoint } from "./payload/endpoints/signup.js";
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

    const allRoleOptions = getAllRoleOptions(pluginOptions);
    const baseUrl =
      betterAuthOptions.baseURL ??
      process.env.NEXT_PUBLIC_URL ??
      "http://localhost:3000";

    config.endpoints = [
      ...(config.endpoints ?? []),
      getSetAdminRoleEndpoint(
        pluginOptions,
        pluginOptions.users?.slug ?? "users"
      ),
      getGenerateInviteUrlEndpoint({
        roles: allRoleOptions,
        baseUrl,
        pluginOptions,
      }),
      getSignupEndpoint(pluginOptions, betterAuthOptions),
    ];

    // Set custom admin components if disableDefaultPayloadAuth is true
    if (pluginOptions.disableDefaultPayloadAuth) {

      const routes = {
        forgot: "/forgot",
        reset: "/reset",
        login: "/login",
      }

      config.admin = {
        ...config.admin,
        components: {
          ...config.admin?.components,
          afterLogin: [
            {
              path: "payload-auth/better-auth/plugin/rsc#RSCRedirect",
              serverProps: {
                redirectTo: `${config.routes?.admin || "/admin"}${routes.login}`,
              }
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
              path: routes.login,
              Component: {
                path: "payload-auth/better-auth/plugin/rsc#Login",
                serverProps: {
                  pluginOptions: pluginOptions,
                  betterAuthOptions: betterAuthOptions
                },
              },
            },
            logout: {
              path: "/logout",
              Component: {
                path: "payload-auth/better-auth/plugin/rsc#Logout",
              },
            },
            createFirstAdmin: {
              path: "/create-first-admin",
              Component: {
                path: "payload-auth/better-auth/plugin/rsc#CreateFirstAdmin",
                serverProps: {
                  pluginOptions: pluginOptions,
                  betterAuthOptions: betterAuthOptions,
                },
              },
            },
            forgot: {
              path: routes.forgot,
              Component: {
                path: "payload-auth/better-auth/plugin/rsc#Forgot",
              },
            },
            signup: {
              path: "/admin-invite",
              Component: {
                path: "payload-auth/better-auth/plugin/rsc#AdminInvite",
                serverProps: {
                  pluginOptions: pluginOptions,
                  betterAuthOptions: betterAuthOptions,
                },
              },
            },
            inactivity: {
              path: "/inactivity",
              Component: {
                path: "payload-auth/better-auth/plugin/rsc#Inactivity",
              },
            },
            resetPassword: {
              path: routes.reset,
              Component: {
                path: "payload-auth/better-auth/plugin/rsc#ResetPassword",
              },
            },
            verifyEmail: {
              path: "/verify-email",
              Component: {
                path: "payload-auth/better-auth/plugin/rsc#VerifyEmail",
              },
            },
          },
        },
        routes: {
          ...config.admin?.routes,
          login: "/login-redirect",
          forgot: undefined, // Deactivate default forgot route
          reset: undefined, // Deactivate default reset route
          logout: "/logout",
          inactivity: "/inactivity",
        },
        // Add admin routes to the custom object
        // We need this to create links in the admin views.
        custom: {
          ...config.admin?.custom,
          betterAuth: {
            ...config.admin?.custom?.betterAuth,
            adminRoutes: {
              ...routes,
              ...(config.admin?.custom?.betterAuth?.adminRoutes || {}),
            }
          }
        }
      }
    }

    // Determine which collections to add based on the options and plugins
    const requiredCollectionSlugs = getRequiredCollectionSlugs({
      logTables: pluginOptions.debug?.logTables ?? false,
      pluginOptions,
      sanitizedBAOptions: betterAuthOptions,
    });

    if (!config.collections) {
      config.collections = [];
    }

    // Update with the required collections + existing collections
    config.collections = buildCollections({
      incomingCollections: config.collections ?? [],
      requiredCollectionSlugs,
      pluginOptions,
      sanitizedBAOptions: betterAuthOptions,
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
