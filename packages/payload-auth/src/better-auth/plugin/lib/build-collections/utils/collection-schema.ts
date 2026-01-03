import { type CollectionConfig, flattenAllFields } from "payload";
import type {
  BetterAuthFullSchema,
  ModelKey
} from "@/better-auth/generated-types";
import type {
  BetterAuthSchemas,
  BuiltBetterAuthSchema
} from "@/better-auth/types";

export function getSchemaCollectionSlug(
  resolvedSchemas: BetterAuthSchemas,
  model: ModelKey
): string {
  return resolvedSchemas?.[model]?.modelName ?? model;
}

export function getSchemaFieldName<M extends ModelKey>(
  resolvedSchemas: BetterAuthSchemas,
  model: M,
  fieldKey: Extract<keyof BetterAuthFullSchema[M], string>
): string {
  return resolvedSchemas?.[model]?.fields?.[fieldKey]?.fieldName ?? fieldKey;
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

export function assertAllSchemaFields(
  collection: CollectionConfig,
  schema: BuiltBetterAuthSchema
): void {
  const schemaFieldKeys = Object.keys(schema.fields);
  const collectionConfigBetterAuthKeys = new Set(
    flattenAllFields(collection)
      .map((field) => field.custom?.betterAuthFieldKey)
      .filter((key): key is string => typeof key === "string")
  );

  const missingFields = schemaFieldKeys.filter(
    (key) => !collectionConfigBetterAuthKeys.has(key)
  );
  if (missingFields.length === 0) return;

  throw new Error(
    `Missing required custom.betterAuthFieldKeys in collection "${collection.slug}": ${missingFields.join(", ")}`
  );
}
