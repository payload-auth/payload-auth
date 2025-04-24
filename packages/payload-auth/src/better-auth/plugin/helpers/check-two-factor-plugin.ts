import { supportedBetterAuthPluginIds } from '../constants'
import type { SanitizedBetterAuthOptions } from '../types'

export function checkTwoFactorPlugin(options: SanitizedBetterAuthOptions) {
  return options.plugins?.some((plugin) => plugin.id === supportedBetterAuthPluginIds.twoFactor) || false
}
