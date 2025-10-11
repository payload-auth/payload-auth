import { baModelFieldKeys, baModelKey } from '@/better-auth/plugin/constants'
import type { BetterAuthSchemas } from '@/better-auth/types'
import { set } from '../../utils/set'
import { getSchemaCollectionSlug, getSchemaFieldName } from '../build-collections/utils/collection-schema'

export function configureApiKeyPlugin(plugin: any, resolvedSchemas: BetterAuthSchemas): void {
  const model = baModelKey.apikey
  set(plugin, `schema.${model}.modelName`, getSchemaCollectionSlug(resolvedSchemas, model))
  set(plugin, `schema.${model}.fields.userId.fieldName`, getSchemaFieldName(resolvedSchemas, model, baModelFieldKeys.apikey.userId))
}
