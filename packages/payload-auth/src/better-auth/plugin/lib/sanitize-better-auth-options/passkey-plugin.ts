import { betterAuthPluginSlugs } from '@/better-auth/plugin/constants'

export function configurePasskeyPlugin(plugin: any) {
  plugin.schema = plugin?.schema ?? {}
  plugin.schema.passkey = {
    ...(plugin?.schema?.passkey ?? {}),
    modelName: betterAuthPluginSlugs.passkeys,
    fields: {
      ...(plugin?.schema?.passkey?.fields ?? {}),
      userId: {
        ...(plugin?.schema?.passkey?.fields?.userId ?? {}),
        fieldName: 'user'
      }
    }
  }
}
