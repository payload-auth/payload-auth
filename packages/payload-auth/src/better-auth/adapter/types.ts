import type { BasePayload } from 'payload'
import type { AdapterInstance } from 'better-auth'

export type PayloadAdapterOptions = {
  enableDebugLogs?: boolean
}

export type PayloadAdapter = (
  payloadClient: BasePayload | Promise<BasePayload> | (() => Promise<BasePayload>),
  config?: PayloadAdapterOptions,
) => AdapterInstance
