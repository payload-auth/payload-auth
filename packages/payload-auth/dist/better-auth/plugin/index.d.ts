import type { BetterAuthOptions } from 'better-auth/types';
import { SanitizedConfig, type Config } from 'payload';
import type { BetterAuthPluginOptions } from './types';
export * from './helpers/index';
export { getPayloadAuth } from './lib/get-payload-auth';
export { sanitizeBetterAuthOptions } from './lib/sanitize-better-auth-options/index';
export * from './types';
export declare function betterAuthPlugin(pluginOptions: BetterAuthPluginOptions): (config: Config) => Config;
export declare function withPayloadAuth({ payloadConfig }: {
    payloadConfig: SanitizedConfig;
}): BetterAuthOptions;
//# sourceMappingURL=index.d.ts.map