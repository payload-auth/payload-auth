import { betterAuth } from 'better-auth'
import type { BasePayload } from 'payload'
import { payloadAdapter } from 'payload-auth/better-auth/adapter'
import type { BetterAuthFunctionOptions, BetterAuthPluginOptions, BetterAuthReturn } from '../types'

export function initBetterAuth<O extends BetterAuthPluginOptions>({
  payload,
  idType,
  options: { enableDebugLogs = false, ...restOptions }
}: {
  payload: BasePayload
  idType: 'number' | 'text'
  options: BetterAuthFunctionOptions<O>
}): BetterAuthReturn<O> {
  return betterAuth({
    ...restOptions,
    database: payloadAdapter({
      payloadClient: payload,
      adapterConfig: {
        enableDebugLogs,
        idType
      }
    })
  }) as unknown as BetterAuthReturn<O>
}
