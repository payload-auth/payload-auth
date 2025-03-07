import type { Config } from 'payload'

import collectionConfigs from './lib/collections/index.js'
import { applyDefaultAccess } from './lib/access/default-access.js'

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

    // Apply default access to all collections and globals, so that
    // only admins can access the admin panel.
    return applyDefaultAccess(config)
  }
