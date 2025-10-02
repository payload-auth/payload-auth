import type { BasePayload, SanitizedConfig } from 'payload';
import type { BetterAuthReturn, TPlugins } from '../types';
export declare function getPayloadAuth<P extends TPlugins>(config: Promise<SanitizedConfig> | SanitizedConfig): Promise<BasePayload & {
    betterAuth: BetterAuthReturn<P>;
}>;
//# sourceMappingURL=get-payload-auth.d.ts.map