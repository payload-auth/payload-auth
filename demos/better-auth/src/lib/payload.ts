import configPromise from '@payload-config'
import { getPayloadAuth } from 'payload-auth'
import type { BetterAuthPlugins } from './auth/options'

export const getPayload = async () => getPayloadAuth<BetterAuthPlugins>(configPromise)
