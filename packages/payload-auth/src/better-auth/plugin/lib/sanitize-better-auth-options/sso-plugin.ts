import { baModelKey, baModelFieldKeys } from '@/better-auth/plugin/constants'
import { CollectionSchemaMap } from '../../helpers/get-collection-schema-map'
import { getSchemaCollectionSlug, getSchemaFieldName } from '../build-collections/utils/collection-schema'
import { set } from '@/better-auth/plugin/utils/set'

export function configureSsoPlugin(plugin: any, collectionSchemaMap: CollectionSchemaMap): void {
  const model = baModelKey.ssoProvider
  set(plugin, `schema.${model}.modelName`, getSchemaCollectionSlug(collectionSchemaMap, model))
  set(plugin, `schema.${model}.fields.userId.fieldName`, getSchemaFieldName(collectionSchemaMap, model, baModelFieldKeys.ssoProvider.userId))
}
