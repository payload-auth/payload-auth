import { betterAuthPluginSlugs } from "../config";

type ApiKeyPluginConfig = {
  plugin: any;
};

export function configureApiKeyPlugin({ plugin }: ApiKeyPluginConfig) {
  plugin.schema = plugin.schema || {};
  plugin.schema.apikey = {
    ...(plugin.schema.apikey || {}),
    modelName: betterAuthPluginSlugs.apiKeys,
    fields: {
      ...(plugin.schema.apikey?.fields || {}),
      userId: {
        ...(plugin.schema.apikey?.fields?.userId || {}),
        fieldName: "user",
      },
    },
  };
}
