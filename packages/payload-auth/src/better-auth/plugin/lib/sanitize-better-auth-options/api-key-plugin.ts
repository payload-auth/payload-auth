import { baModelFieldKeys, baModelKey } from '@/better-auth/plugin/constants'
import { CollectionSchemaMap } from '../../helpers/get-collection-schema-map'

export function configureApiKeyPlugin(plugin: any, collectionSchemaMap: CollectionSchemaMap): void {
  plugin.schema = plugin?.schema ?? {}
  plugin.schema.apikey = {
    ...(plugin?.schema?.apikey ?? {}),
    modelName: collectionSchemaMap[baModelKey.apikey].collectionSlug,
    fields: {
      ...(plugin?.schema?.apikey?.fields ?? {}),
      userId: {
        ...(plugin?.schema?.apikey?.fields?.userId ?? {}),
        fieldName: collectionSchemaMap[baModelKey.apikey].fields[baModelFieldKeys.apikey.userId]
      }
    }
  }
}
