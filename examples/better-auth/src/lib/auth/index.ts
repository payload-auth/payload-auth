import { betterAuth } from 'better-auth'
import type { BetterAuthReturn } from 'payload-auth/better-auth'
import { sanitizeBetterAuthOptions } from 'payload-auth/better-auth/plugin'
import type { BetterAuthPlugins } from './types'
import { betterAuthPluginOptions } from './options'
import { payloadAdapter } from 'payload-auth/better-auth'
import { getPayload } from '@/lib/payload'
import config from '@payload-config'

const options = {
  ...betterAuthPluginOptions,
  betterAuthOptions: {
    ...betterAuthPluginOptions.betterAuthOptions,
    database: payloadAdapter(() => getPayload(), { idType: 'number' })
  }
}

export const auth = betterAuth(sanitizeBetterAuthOptions({ config, options })) as BetterAuthReturn<BetterAuthPlugins>
