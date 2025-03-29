import configPromise from '@payload-config'
import type { BetterAuthPlugins } from '@/lib/auth/types'
import { getPayloadAuth } from 'payload-auth/better-auth'

export const getPayload = async () => getPayloadAuth<BetterAuthPlugins>(configPromise)
