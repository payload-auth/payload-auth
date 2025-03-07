import type { Config } from 'payload'

import collectionConfigs from './lib/collections/index.js'

export type PayloadBetterAuthConfig = {
  disabled?: boolean
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

    return config
  }
