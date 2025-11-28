import type { ModelKey, BetterAuthFullSchema } from '@/better-auth/generated-types';
import type { BuiltBetterAuthSchema, BetterAuthSchemas } from '@/better-auth/types';
import { type CollectionConfig } from 'payload';
export declare function getSchemaCollectionSlug(resolvedSchemas: BetterAuthSchemas, model: ModelKey): string;
export declare function getSchemaFieldName<M extends ModelKey>(resolvedSchemas: BetterAuthSchemas, model: M, fieldKey: Extract<keyof BetterAuthFullSchema[M], string>): string;
/**
 * Asserts that all field keys that exist in the schema exist in the collection
 *
 * It checks based on the custom.betterAuthFieldKey property.
 *
 * @param collection - The collection object
 * @param schema - The schema object containing field definitions
 * @throws {Error} If any required field is missing from the schema
 */
export declare function assertAllSchemaFields(collection: CollectionConfig, schema: BuiltBetterAuthSchema): void;
//# sourceMappingURL=collection-schema.d.ts.map