import { baModelFieldKeys, baModelKey } from '@/better-auth/plugin/constants'
import { getSchemaCollectionSlug, getSchemaFieldName } from '../build-collections/utils/collection-schema'
import { set } from '../../utils/set'
import type { BetterAuthSchemas } from '@/better-auth/types'

export function configurePasskeyPlugin(plugin: any, resolvedSchemas: BetterAuthSchemas): void {
  const model = baModelKey.passkey
  set(plugin, `schema.${model}.modelName`, getSchemaCollectionSlug(resolvedSchemas, model))
  set(plugin, `schema.${model}.fields.userId.fieldName`, getSchemaFieldName(resolvedSchemas, model, baModelFieldKeys.passkey.userId))
}
