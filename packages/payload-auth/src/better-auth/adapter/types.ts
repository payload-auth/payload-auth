import { DBAdapterInstance } from '@better-auth/core/db/adapter';
import type { BasePayload } from 'payload'

export type PayloadAdapterParams = {
  payloadClient: BasePayload | Promise<BasePayload> | (() => Promise<BasePayload>);
  adapterConfig: {
    enableDebugLogs?: boolean;
    idType: 'number' | 'text';
  };
}

export type PayloadAdapter = (options: PayloadAdapterParams) => DBAdapterInstance
