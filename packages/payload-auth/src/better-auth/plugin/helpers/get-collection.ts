import type { BetterAuthFullSchema, ModelKey } from '@/better-auth/generated-types'
import { flattenAllFields, type Collection, type CollectionConfig } from 'payload'

export function getCollectionByModelKey(collections: Record<string, Collection>, modelKey: ModelKey): CollectionConfig {
  const collection = Object.values(collections).find((c) => {
    return c.config?.custom?.betterAuthModelKey === modelKey
  })

  if (!collection) {
    throw new Error(`Collection with key ${modelKey} not found`)
  }

  return collection.config
}

/**
 * Retrieves the field name from a collection based on the field key
 *
 * This function searches through the fields of a collection to find a field
 * that has a matching custom property betterAuthFieldKey.
 *
 * @param collection - The collection configuration to search through
 * @param model - The model key of the collection (This is really just for type hinting)
 * @param fieldKey - The key of the field to search for
 * @returns The name of the field if found, otherwise the field key itself
 */
export function getCollectionFieldNameByFieldKey<M extends ModelKey>(
  collection: CollectionConfig,
  model: M,
  fieldKey: Extract<keyof BetterAuthFullSchema[M], string>
): string {
  const fields = flattenAllFields({ fields: collection.fields })
  return fields.find((f) => f.custom?.betterAuthFieldKey === fieldKey)?.name ?? fieldKey
}
