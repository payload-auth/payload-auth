import { BetterAuthPluginOptions, BetterAuthSchemas } from '../types';
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
export declare function getDefaultBetterAuthSchema(pluginOptions: BetterAuthPluginOptions): BetterAuthSchemas;
//# sourceMappingURL=get-better-auth-schema.d.ts.map