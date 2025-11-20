import configPromise from '@payload-config'
import { getPayloadAuth } from 'payload-auth/better-auth'
import { ConstructedBetterAuthPluginOptions } from './auth/options'

export const getPayload = async () => getPayloadAuth<ConstructedBetterAuthPluginOptions>(configPromise)
