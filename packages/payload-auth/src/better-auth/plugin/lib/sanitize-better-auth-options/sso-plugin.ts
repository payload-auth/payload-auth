import { baModelKey, baModelFieldKeys } from '@/better-auth/plugin/constants'
import { CollectionSchemaMap } from '../../helpers/get-collection-schema-map'

export function configureSsoPlugin(plugin: any, collectionSchemaMap: CollectionSchemaMap): void {
  plugin.schema = plugin?.schema ?? {}
  plugin.schema.sso = {
    ...(plugin?.schema?.sso ?? {}),
    modelName: collectionSchemaMap[baModelKey.ssoProvider].collectionSlug,
    fields: {
      ...(plugin?.schema?.sso?.fields ?? {}),
      userId: {
        ...(plugin?.schema?.sso?.fields?.userId ?? {}),
        fieldName: collectionSchemaMap[baModelKey.ssoProvider].fields[baModelFieldKeys.ssoProvider.userId]
      }
    }
  }
}
