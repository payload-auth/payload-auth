import { betterAuth } from 'better-auth'
import type { BasePayload } from 'payload'
import { payloadAdapter } from 'payload-auth/better-auth/adapter'
import type { BetterAuthFunctionOptions, BetterAuthReturn, TPlugins } from '../types'

export function initBetterAuth<P extends TPlugins>({
  payload,
  options: { enableDebugLogs = false, ...restOptions },
}: {
  payload: BasePayload
  options: BetterAuthFunctionOptions<P>
}): BetterAuthReturn<P> {
  return betterAuth({
    ...restOptions,
    database: payloadAdapter(payload, { enableDebugLogs }),
  }) as unknown as BetterAuthReturn<P>
}
