import { baModelFieldKeys, baModelKey } from '@/better-auth/plugin/constants'
import { CollectionSchemaMap } from '../../helpers/get-collection-schema-map'
import { getSchemaCollectionSlug, getSchemaFieldName } from '../build-collections/utils/collection-schema'
import { set } from '../../utils/set'

export function configurePasskeyPlugin(plugin: any, collectionSchemaMap: CollectionSchemaMap): void {
  const model = baModelKey.passkey
  set(plugin, `schema.${model}.modelName`, getSchemaCollectionSlug(collectionSchemaMap, model))
  set(plugin, `schema.${model}.fields.userId.fieldName`, getSchemaFieldName(collectionSchemaMap, model, baModelFieldKeys.passkey.userId))
}
