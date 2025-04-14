import { betterAuthPluginSlugs } from "../constants";

export function configureOidcPlugin(plugin: any) {
  plugin.schema = plugin?.schema ?? {};

  // Initialize missing schema objects
  ["oauthApplication", "oauthAccessToken", "oauthConsent"].forEach((key) => {
    if (!plugin.schema[key]) plugin.schema[key] = {};
  });

  plugin.schema = {
    ...plugin?.schema,
    oauthApplication: {
      ...plugin?.schema?.oauthApplication,
      modelName: betterAuthPluginSlugs.oauthApplications,
      fields: {
        ...(plugin?.schema?.oauthApplication?.fields ?? {}),
        userId: {
          ...(plugin?.schema?.oauthApplication?.fields?.userId ?? {}),
          fieldName: "user",
        },
      },
    },
    oauthAccessToken: {
      ...plugin?.schema?.oauthAccessToken,
      modelName: betterAuthPluginSlugs.oauthAccessTokens,
      fields: {
        ...(plugin?.schema?.oauthAccessToken?.fields ?? {}),
        userId: {
          ...(plugin?.schema?.oauthAccessToken?.fields?.userId ?? {}),
          fieldName: "user",
        },
        clientId: {
          ...(plugin?.schema?.oauthAccessToken?.fields?.clientId ?? {}),
          fieldName: "client",
        },
      },
    },
    oauthConsent: {
      ...plugin?.schema?.oauthConsent,
      modelName: betterAuthPluginSlugs.oauthConsents,
      fields: {
        ...(plugin?.schema?.oauthConsent?.fields ?? {}),
        userId: {
          ...(plugin?.schema?.oauthConsent?.fields?.userId ?? {}),
          fieldName: "user",
        },
        clientId: {
          ...(plugin?.schema?.oauthConsent?.fields?.clientId ?? {}),
          fieldName: "client",
        },
      },
    },
  };
}
