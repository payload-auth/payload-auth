import { betterAuthPluginSlugs } from '../config'

export function configureSsoPlugin(plugin: any) {
  plugin.schema = plugin.schema || {}
  plugin.schema.sso = {
    ...(plugin.schema.sso || {}),
    modelName: betterAuthPluginSlugs.ssoProviders,
    fields: {
      ...(plugin.schema.sso?.fields || {}),
      userId: {
        ...(plugin.schema.sso?.fields?.userId || {}),
        fieldName: 'user',
      },
    },
  }
}
