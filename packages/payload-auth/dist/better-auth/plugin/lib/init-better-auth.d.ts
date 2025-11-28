import type { BasePayload } from 'payload';
import type { BetterAuthFunctionOptions, BetterAuthPluginOptions, BetterAuthReturn } from '../types';
export declare function initBetterAuth<O extends BetterAuthPluginOptions>({ payload, idType, options: { enableDebugLogs, ...restOptions } }: {
    payload: BasePayload;
    idType: 'number' | 'text';
    options: BetterAuthFunctionOptions<O>;
}): BetterAuthReturn<O>;
//# sourceMappingURL=init-better-auth.d.ts.map