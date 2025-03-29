import { betterAuth } from "better-auth"
import { BetterAuthFunctionOptions, BetterAuthReturn, TPlugins } from "../types"
import { BasePayload } from "payload"
import { payloadAdapter } from "payload-auth/better-auth/adapter"

export function initBetterAuth<P extends TPlugins>({
  payload,
  options,
}: {
  payload: BasePayload
  options: BetterAuthFunctionOptions<P>
}): BetterAuthReturn<P> {
  const auth = betterAuth({
    ...options,
    database: payloadAdapter(payload, {
      enableDebugLogs: options.enableDebugLogs ?? false,
    }),
  })

  return auth as unknown as BetterAuthReturn<P>
}
