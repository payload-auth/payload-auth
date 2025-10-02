import type { BetterAuthPluginOptions, BetterAuthSchemas, SanitizedBetterAuthOptions } from '@/better-auth/plugin/types';
import type { Config, Payload } from 'payload';
/**
 * Sanitizes the BetterAuth options
 */
export declare function sanitizeBetterAuthOptions({ config, pluginOptions, resolvedSchemas }: {
    config: Payload['config'] | Config | Promise<Payload['config'] | Config>;
    pluginOptions: BetterAuthPluginOptions;
    resolvedSchemas: BetterAuthSchemas;
}): SanitizedBetterAuthOptions;
//# sourceMappingURL=index.d.ts.map