import { baModelFieldKeys, baModelKey } from '@/better-auth/plugin/constants'
import { CollectionSchemaMap } from '../../helpers/get-collection-schema-map'

export function configurePasskeyPlugin(plugin: any, collectionSchemaMap: CollectionSchemaMap): void {
  plugin.schema = plugin?.schema ?? {}
  plugin.schema.passkey = {
    ...(plugin?.schema?.passkey ?? {}),
    modelName: collectionSchemaMap[baModelKey.passkey].collectionSlug,
    fields: {
      ...(plugin?.schema?.passkey?.fields ?? {}),
      userId: {
        ...(plugin?.schema?.passkey?.fields?.userId ?? {}),
        fieldName: collectionSchemaMap[baModelKey.passkey].fields[baModelFieldKeys.passkey.userId]
      }
    }
  }
}
