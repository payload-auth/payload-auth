import type { Config } from "payload";
import type { ClerkPluginOptions } from "./types";
import { withClerkUsersCollection } from "./plugin/collections/users";
import {
  defaultClerkMapping,
  createMappingWithRequiredClerkFields,
} from "./utils/clerk-user";

export * from "./plugin/auth-strategy";
export * from "./plugin/collections/users";

export function clerkPlugin(pluginOptions: ClerkPluginOptions = {}) {
  return (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config;
    }

    const clerkToPayloadMappingFunction = createMappingWithRequiredClerkFields(
      pluginOptions?.users?.clerkToPayloadMapping ?? defaultClerkMapping
    );
    pluginOptions.users = pluginOptions.users ?? {};
    pluginOptions.users.clerkToPayloadMapping = clerkToPayloadMappingFunction;

    config.custom = {
      ...config.custom,
      hasClerkPlugin: true,
      clerkPlugin: {
        clerkToPayloadMapping: clerkToPayloadMappingFunction,
      },
    };

    if (!config.collections) {
      config.collections = [];
    }

    config.admin = {
      ...config.admin,
      components: {
        ...config.admin?.components,
        logout: {
          Button: {
            path: "payload-auth/clerk/admin/ui#LogoutButton",
          }
        },
        afterLogin: [
          {
            path: "payload-auth/clerk/admin/ui#AfterLoginForm",
            clientProps: { redirectOnLoginTo: config?.routes?.admin },
          },
        ],
      },
    };
    const userSlug = pluginOptions.users?.slug ?? "users";

    const existingUserCollection = config.collections.find(
      (collection: any) => collection.slug === userSlug
    );

    if (existingUserCollection) {
      const index = config.collections.findIndex(
        (collection: any) => collection.slug === userSlug
      );
      config.collections[index] = withClerkUsersCollection({
        collection: existingUserCollection,
        options: pluginOptions,
        apiBasePath: config?.routes?.api ?? undefined,
        adminBasePath: config?.routes?.admin ?? undefined,
      });
    } else {
      config.collections.push(
        withClerkUsersCollection({
          options: pluginOptions,
          apiBasePath: config?.routes?.api ?? undefined,
          adminBasePath: config?.routes?.admin ?? undefined,
        })
      );
    }

    return config;
  };
}
