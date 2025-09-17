import type { AdapterInstance } from 'better-auth'
import type { BasePayload } from 'payload'

export interface PayloadAdapterParams {
  payloadClient: BasePayload | Promise<BasePayload> | (() => Promise<BasePayload>)
  adapterConfig?: {
    enableDebugLogs?: boolean
    idType: 'number' | 'text'
  }
  enableDebugLogs?: boolean
  idType?: 'number' | 'text'
}

export type PayloadAdapter = (options: PayloadAdapterParams) => AdapterInstance
