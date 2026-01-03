import type { CollectionConfig } from "payload";
import type { ModelKey } from "../../generated-types";
import type { BetterAuthSchemas, FieldWithIds } from "../types";

/**
 * Syncs a BetterAuth `ResolvedSchema` object with the *actual* collection
 * definitions created by this plugin.
 *
 * This must run **after** the first call to `buildCollections`, because only
 * then do we know the user-overridden slugs / field names.  The algorithm is
 * kept deliberately simple:
 *
 *  1. Build a `modelKey → newSlug` map from each collection's
 *     `custom.betterAuthModelKey` property.
 *  2. Update `schema.modelName` for all affected tables.
 *  3. Rewrite `references.model` in *every* table field according to the new
 *     slugs.  We do this in a dedicated pass so referencing tables no longer
 *     depend on the original slugs.
 *  4. Finally, iterate collections once more to apply any *field* renames via
 *     the `custom.betterAuthFieldKey` property.
 */
export function syncResolvedSchemaWithCollectionMap(
  resolvedSchemas: BetterAuthSchemas,
  collectionMap: Record<string, CollectionConfig>
): BetterAuthSchemas {
  const collections = Object.values(collectionMap);

  // Helper to update references across the whole schema
  const updateReferences = (oldSlug: string, newSlug: string): void => {
    for (const schema of Object.values(resolvedSchemas)) {
      for (const fieldAttr of Object.values(schema.fields)) {
        const ref = (fieldAttr as any).references;
        if (ref?.model === oldSlug) {
          ref.model = newSlug;
        }
      }
    }
  };

  for (const [modelKey, schema] of Object.entries(resolvedSchemas) as [
    ModelKey,
    (typeof resolvedSchemas)[ModelKey]
  ][]) {
    // Find the collection corresponding to this BetterAuth model
    const collection = collections.find(
      (c) => (c.custom as any)?.betterAuthModelKey === modelKey
    );
    if (!collection) {
      console.error(`Collection not found for model key: ${modelKey}`);
      continue;
    }

    // ───── Sync slug ─────────────────────────────────────────────────────────
    const oldSlug = schema.modelName;
    const newSlug = collection.slug;

    if (oldSlug !== newSlug) {
      // First, rewrite *all* references that still point to the old slug
      updateReferences(oldSlug, newSlug);

      // Now store the new slug on the schema itself
      schema.modelName = newSlug;
    }

    // ───── Sync field names ───────────────────────────────────────────────────
    const collectionFields: FieldWithIds[] = Array.isArray(collection.fields)
      ? (collection.fields as FieldWithIds[])
      : [];

    for (const [fieldKey, schemaField] of Object.entries(schema.fields)) {
      const matchingField = collectionFields.find(
        (f) => f.custom?.betterAuthFieldKey === fieldKey
      );

      if (!matchingField) {
        console.error(
          `Field not found for key "${fieldKey}" in collection "${collection.slug}"`
        );
        continue;
      }

      const newName = matchingField.name;
      if (newName && schemaField.fieldName !== newName) {
        schemaField.fieldName = newName;
      }
    }
  }

  return resolvedSchemas;
}
