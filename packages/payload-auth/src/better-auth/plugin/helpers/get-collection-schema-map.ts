import { baModelFieldKeysToFieldNames, baModelKey } from '../constants'
import { getAuthTables } from 'better-auth/db'
import { BetterAuthOptions } from 'better-auth/types'
import { baModelKeyToSlug } from '../constants'
import { FlattenedField } from 'payload'
import { flattenAllFields } from 'payload/shared'
import { CollectionConfig } from 'payload'
import { getDeafultCollectionSlug } from './get-collection-slug'
import { BetterAuthPluginOptions } from '../types'

export type CollectionSchemaMap = Record<
  keyof typeof baModelKey,
  {
    collectionSlug: string
    fields: Record<string, string>
  }
>

export function getDefaultCollectionSchemaMap(pluginOptions: BetterAuthPluginOptions): CollectionSchemaMap {
  const tables = getAuthTables(pluginOptions.betterAuthOptions ?? {})
  const map = {} as CollectionSchemaMap
  Object.entries(tables).forEach(([key, table]) => {
    const fieldNames = Object.entries(table.fields).map(([k, v]) => k)
    const typedKey = key as keyof typeof baModelKeyToSlug
    const value = {
      collectionSlug: getDeafultCollectionSlug({ modelKey: typedKey, pluginOptions }),
      fields: fieldNames.reduce(
        (acc, field) => {
          if (
            typedKey in baModelFieldKeysToFieldNames &&
            field in baModelFieldKeysToFieldNames[typedKey as keyof typeof baModelFieldKeysToFieldNames]
          ) {
            const fieldMapping = baModelFieldKeysToFieldNames[typedKey as keyof typeof baModelFieldKeysToFieldNames]
            const typedField = field as keyof typeof fieldMapping
            acc[field] = fieldMapping[typedField] || field
          } else {
            acc[field] = field
          }
          return acc
        },
        {} as Record<string, string>
      )
    }

    map[typedKey] = value
  })

  // always add the role field to the user collection if not already present
  if (!map[baModelKey.user].fields.role) {
    map[baModelKey.user].fields.role = baModelFieldKeysToFieldNames.user.role
  }

  return map
}

type CollectionOverride = ((options: { collection: CollectionConfig }) => CollectionConfig) | undefined

type CollectionOverrides = Record<string, CollectionOverride>

/**
 * Builds a collection schema map by analyzing collection overrides and extracting
 * BetterAuth model keys and field mappings
 *
 * @param collectionOverrides - Collection override functions provided in plugin options
 * @returns A collection schema map with default values merged with any overrides
 */
export function buildCollectionSchemaMap(pluginOptions: BetterAuthPluginOptions): CollectionSchemaMap {
  const collectionOverrides = {
    users: pluginOptions.users?.collectionOverrides,
    accounts: pluginOptions.accounts?.collectionOverrides,
    sessions: pluginOptions.sessions?.collectionOverrides,
    verifications: pluginOptions.verifications?.collectionOverrides,
    ...pluginOptions.pluginCollectionOverrides
  }

  const defaultCollectionSchemaMap = getDefaultCollectionSchemaMap(pluginOptions)

  if (!collectionOverrides || Object.keys(collectionOverrides).length === 0) {
    return { ...defaultCollectionSchemaMap }
  }

  const schemaMap = { ...defaultCollectionSchemaMap }

  Object.entries(collectionOverrides).forEach(([collectionSlug, overrideFunction]) => {
    if (!overrideFunction) return

    const modifiedCollection = overrideFunction({
      collection: {
        slug: collectionSlug,
        fields: []
      }
    })
    const modelKey = assertModelKey(modifiedCollection)
    schemaMap[modelKey].collectionSlug = modifiedCollection.slug
    const flattenedFields = flattenAllFields(modifiedCollection)
    if (flattenedFields && Array.isArray(flattenedFields)) {
      flattenedFields.forEach((field: FlattenedField) => {
        // we only want to process fields that have a betterAuthFieldKey
        // because its possible the user has added additional fields
        if (field.custom?.betterAuthFieldKey) {
          const fieldKey = assertFieldKey(field, modelKey, modifiedCollection.slug)
          schemaMap[modelKey].fields[fieldKey] = field.name
        }
      })
    }
  })

  return schemaMap
}

function assertFieldKey(field: FlattenedField, modelKey: keyof typeof baModelKey, collectionSlug: string) {
  const fieldKey = field.custom?.betterAuthFieldKey as string

  // Assert that fieldKey is a valid key in the baModelFieldKeysToFieldNames mapping
  if (!Object.values(baModelFieldKeysToFieldNames).some((fieldMap) => Object.keys(fieldMap).includes(fieldKey))) {
    throw new Error(
      `Invalid custom.betterAuthFieldKey: ${fieldKey} for field ${field.name} in collection ${collectionSlug}, 
        must be one of ${Object.keys(baModelFieldKeysToFieldNames[modelKey as keyof typeof baModelFieldKeysToFieldNames]).join(', ')}`
    )
  }

  return fieldKey
}

/**
 * Asserts that a collection has a valid BetterAuth model key and returns it
 *
 * @param collection - The collection to check for a BetterAuth model key
 * @returns The BetterAuth model key
 * @throws Error if the collection does not have a valid BetterAuth model key
 */
function assertModelKey(collection: CollectionConfig): keyof typeof baModelKey {
  if (!collection.custom?.betterAuthModelKey) {
    throw new Error(`Collection ${collection.slug} is missing a betterAuthModelKey in its custom field`)
  }

  const modelKey = collection.custom.betterAuthModelKey as keyof typeof baModelKey

  if (!Object.values(baModelKey).includes(modelKey as any)) {
    throw new Error(`Collection ${collection.slug} has an invalid betterAuthModelKey: ${modelKey}`)
  }

  return modelKey
}
