import type { CollectionConfig } from 'payload';
import type { BetterAuthSchemas } from '../types';
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
export declare function syncResolvedSchemaWithCollectionMap(resolvedSchemas: BetterAuthSchemas, collectionMap: Record<string, CollectionConfig>): BetterAuthSchemas;
//# sourceMappingURL=sync-resolved-schema-with-collection-map.d.ts.map