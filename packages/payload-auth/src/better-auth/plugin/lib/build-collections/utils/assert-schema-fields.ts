import { BuildSchema } from '@/better-auth/plugin/types'

import { flattenAllFields } from 'payload'

import { CollectionConfig } from 'payload'

/**
 * Asserts that all field keys that exist in the schema exist in the collection
 *
 * It checks based on the custom.betterAuthFieldKey property.
 *
 * @param collection - The collection object
 * @param schema - The schema object containing field definitions
 * @throws {Error} If any required field is missing from the schema
 */
export function assertAllSchemaFields(collection: CollectionConfig, schema: BuildSchema) {
  const missingFields: string[] = []
  const schemaFieldKeys = Object.keys(schema.fields)
  const flattenedCollectionFields = flattenAllFields(collection)

  // Check that each schema field key has a corresponding field in the collection
  schemaFieldKeys.forEach((schemaKey) => {
    const fieldExists = flattenedCollectionFields.some((field) => field.custom?.betterAuthFieldKey === schemaKey)

    if (!fieldExists) {
      missingFields.push(schemaKey)
    }
  })

  if (missingFields.length > 0) {
    throw new Error(`Missing required custom.betterAuthFieldKeys in collection: ${collection.slug} [${missingFields.join(', ')}]`)
  }
}
