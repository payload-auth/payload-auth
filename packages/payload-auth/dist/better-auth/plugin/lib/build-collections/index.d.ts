import type { CollectionConfig } from 'payload';
import type { BetterAuthPluginOptions, BetterAuthSchemas } from '../../types';
/**
 * Builds the required collections based on the BetterAuth options and plugins
 */
export declare function buildCollections({ incomingCollections, pluginOptions, resolvedSchemas }: {
    incomingCollections: CollectionConfig[];
    pluginOptions: BetterAuthPluginOptions;
    resolvedSchemas: BetterAuthSchemas;
}): Record<string, CollectionConfig>;
//# sourceMappingURL=index.d.ts.map