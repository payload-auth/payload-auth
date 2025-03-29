import type { BasePayload, SanitizedConfig } from 'payload'
import { BetterAuthReturn, TPlugins } from '../types'
import { getPayload } from 'payload'
export async function getPayloadAuth<P extends TPlugins>(
  config: Promise<SanitizedConfig> | SanitizedConfig,
): Promise<BasePayload & { betterAuth: BetterAuthReturn<P> }> {
  const payload = (await getPayload({ config })) as BasePayload & {
    betterAuth: BetterAuthReturn<P>
  }
  return payload
}
