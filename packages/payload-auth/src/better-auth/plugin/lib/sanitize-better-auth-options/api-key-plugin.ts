import { betterAuthPluginSlugs } from '../config'

export function configureApiKeyPlugin(plugin: any) {
  plugin.schema = plugin.schema || {}
  plugin.schema.apikey = {
    ...(plugin.schema.apikey || {}),
    modelName: betterAuthPluginSlugs.apiKeys,
    fields: {
      ...(plugin.schema.apikey?.fields || {}),
      userId: {
        ...(plugin.schema.apikey?.fields?.userId || {}),
        fieldName: 'user',
      },
    },
  }
}
