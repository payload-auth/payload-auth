import type { BasePayload, SanitizedConfig } from 'payload';
import type { BetterAuthPluginOptions, BetterAuthReturn } from '../types';
export declare function getPayloadAuth<O extends BetterAuthPluginOptions>(config: Promise<SanitizedConfig> | SanitizedConfig): Promise<BasePayload & {
    betterAuth: BetterAuthReturn<O>;
}>;
//# sourceMappingURL=get-payload-auth.d.ts.map