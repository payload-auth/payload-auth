import { baModelFieldKeys, baModelKey } from '@/better-auth/plugin/constants'
import { set } from '@/better-auth/plugin/utils/set'
import { CollectionSchemaMap } from '../../helpers/get-collection-schema-map'
import { getSchemaCollectionSlug, getSchemaFieldName } from '../build-collections/utils/collection-schema'

export function configureTwoFactorPlugin(plugin: any, collectionSchemaMap: CollectionSchemaMap): void {
  const model = baModelKey.twoFactor
  set(plugin, `schema.${model}.modelName`, getSchemaCollectionSlug(collectionSchemaMap, model))
  set(plugin, `schema.${model}.fields.userId.fieldName`, getSchemaFieldName(collectionSchemaMap, model, baModelFieldKeys.twoFactor.userId))
}
