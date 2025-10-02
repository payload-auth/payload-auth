import type { Config } from 'payload';
import type { ClerkPluginOptions } from './types';
export * from './plugin/auth-strategy';
export * from './plugin/collections/users';
export declare function clerkPlugin(pluginOptions?: ClerkPluginOptions): (config: Config) => Config;
//# sourceMappingURL=plugin.d.ts.map