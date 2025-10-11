import { betterAuth } from 'better-auth'
import type { BasePayload } from 'payload'
import { payloadAdapter } from 'payload-auth/better-auth/adapter'
import type { BetterAuthFunctionOptions, BetterAuthReturn, TPlugins } from '../types'

export function initBetterAuth<P extends TPlugins>({
  payload,
  idType,
  options: { enableDebugLogs = false, ...restOptions }
}: {
  payload: BasePayload
  idType: 'number' | 'text'
  options: BetterAuthFunctionOptions<P>
}): BetterAuthReturn<P> {
  return betterAuth({
    ...restOptions,
    database: payloadAdapter({
      payloadClient: payload,
      adapterConfig: {
        enableDebugLogs,
        idType
      }
    })
  }) as unknown as BetterAuthReturn<P>
}
