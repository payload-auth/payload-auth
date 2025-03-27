import configPromise from '@payload-config'
import type { BetterAuthPlugins } from '@/lib/auth/types'
import { getPayloadWithAuth } from '@payload-auth/better-auth-plugin'

export const getPayload = async () => getPayloadWithAuth<BetterAuthPlugins>(configPromise)
