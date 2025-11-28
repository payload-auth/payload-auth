import type { BetterAuthPluginOptions, BetterAuthSchemas } from '../types';
import type { Config, CollectionConfig } from 'payload';
/**
 * Applies all admin-related overrides when `disableDefaultPayloadAuth` is `true`.
 * Mutates the provided Payload config in-place.
 */
export declare function applyDisabledDefaultAuthConfig({ config, pluginOptions, collectionMap, resolvedBetterAuthSchemas }: {
    config: Config;
    pluginOptions: BetterAuthPluginOptions;
    collectionMap: Record<string, CollectionConfig>;
    resolvedBetterAuthSchemas: BetterAuthSchemas;
}): void;
//# sourceMappingURL=apply-disabled-default-auth-config.d.ts.map