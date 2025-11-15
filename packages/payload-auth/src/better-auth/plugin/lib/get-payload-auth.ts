import { getPayload } from 'payload'
import type { BasePayload, SanitizedConfig } from 'payload'
import type { BetterAuthOptions, BetterAuthReturn } from '../types'

export async function getPayloadAuth<O extends BetterAuthOptions>(
  config: Promise<SanitizedConfig> | SanitizedConfig
): Promise<BasePayload & { betterAuth: BetterAuthReturn<O> }> {
  const payload = (await getPayload({ config })) as BasePayload & {
    betterAuth: BetterAuthReturn<O>
  }
  return payload
}
