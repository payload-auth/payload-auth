import { ModelKey } from '@/better-auth/generated-types'
import { getAuthTables, type FieldAttribute } from 'better-auth/db'
import { baModelFieldKeysToFieldNames } from '../constants'
import type { BetterAuthPluginOptions, BetterAuthSchemas } from '../types'
import { getDeafultCollectionSlug } from './get-collection-slug'

/**
 * Generates a BetterAuth schema but replaces every `modelName` with the slug
 * returned by `getDeafultCollectionSlug`. It also guarantees that:
 *  • Every field has a `fieldName` (existing → default mapping → key).
 *  • Every `references.model` points to the resolved modelName.
 */
export function getResolvedBetterAuthSchema(pluginOptions: BetterAuthPluginOptions): BetterAuthSchemas {
  const betterAuthOptions = pluginOptions.betterAuthOptions ?? {}
  const tables = getAuthTables(betterAuthOptions)

  const schema: Partial<BetterAuthSchemas> = {}

  for (const modelKey of Object.keys(tables) as ModelKey[]) {
    const table = tables[modelKey]

    // Resolve the canonical collection slug / model name for this key
    const resolvedModelName = getDeafultCollectionSlug({ modelKey, pluginOptions })

    const defaultFieldMap = (baModelFieldKeysToFieldNames as Record<string, Record<string, string>>)[modelKey] ?? {}

    const actualFields: Record<string, FieldAttribute> = {}

    Object.entries(table.fields).forEach(([fieldKey, fieldValue]) => {
      // Build the field ensuring a fieldName exists
      const newField: FieldAttribute = {
        ...fieldValue,
        fieldName: defaultFieldMap[fieldKey] ?? fieldKey
      }

      // Rewrite references to use the resolved modelName for the target table
      if (fieldValue.references) {
        const refModelKey = fieldValue.references.model as string
        const resolvedRefModelName = getDeafultCollectionSlug({ modelKey: refModelKey, pluginOptions })
        newField.references = {
          ...fieldValue.references,
          model: resolvedRefModelName,
          field: fieldValue.references.field
        }
      }

      actualFields[fieldKey] = newField
    })

    if (schema[modelKey]) {
      schema[modelKey].fields = {
        ...schema[modelKey].fields,
        ...actualFields
      }
      continue
    }

    schema[modelKey] = {
      modelName: resolvedModelName,
      fields: actualFields,
      order: table.order || Infinity
    }
  }

  return schema as BetterAuthSchemas
}
