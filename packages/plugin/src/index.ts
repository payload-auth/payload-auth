import { getPayload } from 'payload'
import type { BasePayload, Config, SanitizedConfig } from 'payload'
import collectionConfigs from './lib/collections/index.js'
import { BetterAuthOptions, BetterAuthPlugin } from 'better-auth'
import { betterAuth, BetterAuthReturn } from './lib/better-auth.js'

export type PayloadBetterAuthConfig = {
  disabled?: boolean
  betterAuthOptions?: Omit<BetterAuthOptions, 'database'> & {
    enable_debug_logs?: boolean
  }
}

export interface PayloadBetterAuthPlugin {
  (config: Config): Config
  pluginOptions: PayloadBetterAuthConfig
}

export const payloadBetterAuth =
  (pluginOptions: PayloadBetterAuthConfig) =>
  (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config
    }

    if (!config.collections) {
      config.collections = []
    }

    config.collections.push(...collectionConfigs)

    config.onInit = async (payload) => {
      const auth = betterAuth({
        payload,
        options: {
          ...pluginOptions.betterAuthOptions,
          plugins: [...(pluginOptions.betterAuthOptions?.plugins || [])],
        },
      })

      ;(payload as BasePayload & { betterAuth: typeof auth }).betterAuth = auth
    }
    return config
  }

export const getPayloadBetterAuth = async <
  TPlugins extends BetterAuthPlugin[] = BetterAuthPlugin[],
>(
  config: Promise<SanitizedConfig> | SanitizedConfig,
) => {
  const payload = (await getPayload({ config })) as BasePayload & {
    betterAuth: BetterAuthReturn<TPlugins>
  }
  const extendedPayload = payload as BasePayload & {
    betterAuth: BetterAuthReturn<TPlugins>
  }
  extendedPayload.betterAuth = payload.betterAuth as BetterAuthReturn<TPlugins>
  return extendedPayload
}
