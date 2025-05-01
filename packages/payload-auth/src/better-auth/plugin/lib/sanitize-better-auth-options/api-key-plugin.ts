import { baModelFieldKeys, baModelKey } from '@/better-auth/plugin/constants'
import { CollectionSchemaMap } from '../../helpers/get-collection-schema-map'
import { set } from '../../utils/set'
import { getSchemaCollectionSlug, getSchemaFieldName } from '../build-collections/utils/collection-schema'

export function configureApiKeyPlugin(plugin: any, collectionSchemaMap: CollectionSchemaMap): void {
  const model = baModelKey.apikey
  set(plugin, `schema.${model}.modelName`, getSchemaCollectionSlug(collectionSchemaMap, model))
  set(
    plugin,
    `schema.${model}.fields.userId.fieldName`,
    getSchemaFieldName(collectionSchemaMap, model, baModelFieldKeys.apikey.userId)
  )
}
