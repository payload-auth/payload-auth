import type { AdapterInstance } from 'better-auth';
import type { BasePayload } from 'payload';
export type PayloadAdapterParams = {
    payloadClient: BasePayload | Promise<BasePayload> | (() => Promise<BasePayload>);
    enableDebugLogs?: boolean;
    idType: 'number' | 'text';
};
export type PayloadAdapter = (options: PayloadAdapterParams) => AdapterInstance;
//# sourceMappingURL=types.d.ts.map