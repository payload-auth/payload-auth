import { getPayload } from 'payload'
import type { BasePayload, SanitizedConfig } from 'payload'
import type { BetterAuthReturn, TPlugins } from '../types'

export async function getPayloadAuth<P extends TPlugins>(
  config: Promise<SanitizedConfig> | SanitizedConfig
): Promise<BasePayload & { betterAuth: BetterAuthReturn<P> }> {
  const payload = (await getPayload({ config })) as BasePayload & {
    betterAuth: BetterAuthReturn<P>
  }
  return payload
}
