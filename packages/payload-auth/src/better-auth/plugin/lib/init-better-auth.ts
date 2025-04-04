<<<<<<< HEAD:packages/better-auth/src/plugin/lib/init-better-auth.ts
import { betterAuth } from 'better-auth'
import type { BasePayload } from 'payload'
import { payloadAdapter } from 'payload-auth/better-auth/adapter'
import type { BetterAuthFunctionOptions, BetterAuthReturn, TPlugins } from '../types'
=======
import { betterAuth } from "better-auth"
import { BetterAuthFunctionOptions, BetterAuthReturn, TPlugins } from "../types"
import { BasePayload } from "payload"
import { payloadAdapter } from "../../adapter"
>>>>>>> chore/restructure-demo-templates:packages/payload-auth/src/better-auth/plugin/lib/init-better-auth.ts

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
