import type { BasePayload } from 'payload';
import type { BetterAuthFunctionOptions, BetterAuthReturn, TPlugins } from '../types';
export declare function initBetterAuth<P extends TPlugins>({ payload, idType, options: { enableDebugLogs, ...restOptions }, }: {
    payload: BasePayload;
    idType: 'number' | 'text';
    options: BetterAuthFunctionOptions<P>;
}): BetterAuthReturn<P>;
//# sourceMappingURL=init-better-auth.d.ts.map