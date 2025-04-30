import type { CollectionSchemaMap } from "@/better-auth/plugin/helpers/get-collection-schema-map";
import { BuildSchema } from "@/better-auth/types";
import { CollectionConfig, flattenAllFields } from "payload";

export function getSchemaCollectionSlug(collectionSchemaMap: CollectionSchemaMap, model: string): string {
  return collectionSchemaMap?.[model as keyof CollectionSchemaMap]?.collectionSlug ?? model;
}

export function getSchemaFieldName(collectionSchemaMap: CollectionSchemaMap, model: string, fieldName: string): string {
  return collectionSchemaMap?.[model as keyof CollectionSchemaMap]?.fields[fieldName] ?? fieldName;
}

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

