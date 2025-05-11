import { ModelKey } from '@/better-auth/generated-types'
import { getAuthTables, type FieldAttribute } from 'better-auth/db'
import { baModelFieldKeysToFieldNames } from '../constants'
import { BetterAuthPluginOptions, BetterAuthSchemas } from '../types'
import { getDefaultCollectionSlug } from './get-collection-slug'

/**
 * A consistent BetterAuth schema generator.
 *
 * Differences from the original `getSchema` implementation in BetterAuth:
 * 1. Keys in the returned object are always the **static table identifiers** coming from
 *    `getAuthTables`, never the possibly-overridden `modelName`.  This guarantees that
 *    subsequent look-ups remain stable even if the user renames collections.
 * 2. Each schema entry now contains an explicit `modelName` property exposing the current
 *    (potentially user-overridden) model name, while `fields` continue to be referenced by
 *    their static BetterAuth field keys.
 * 3. When converting fields, we store them under their original key (`actualFields[key] = field`)
 *    instead of `field.fieldName || key` to avoid accidental renames.
 *
 * @param config - The BetterAuth options fed into `getAuthTables`.
 * @returns A map keyed by static table keys, each value containing `{ modelName, fields, order }`.
 */
export function getDefaultBetterAuthSchema(pluginOptions: BetterAuthPluginOptions): BetterAuthSchemas {
  const betterAuthOptions = pluginOptions.betterAuthOptions ?? {}
  const tables = getAuthTables(betterAuthOptions)

  const schema: Partial<BetterAuthSchemas> = {}

  for (const modelKey of Object.keys(tables) as ModelKey[]) {
    const table = tables[modelKey]

    // Resolve the canonical collection slug / model name for this key
    const resolvedModelName = getDefaultCollectionSlug({ modelKey, pluginOptions })

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
        const resolvedRefModelName = getDefaultCollectionSlug({ modelKey: refModelKey, pluginOptions })
        newField.references = {
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
