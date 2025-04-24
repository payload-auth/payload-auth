import { supportedBetterAuthPluginIds } from '../constants'
import type { SanitizedBetterAuthOptions } from '../types'

export function checkPasskeyPlugin(options: SanitizedBetterAuthOptions) {
  return options.plugins?.some((plugin) => plugin.id === supportedBetterAuthPluginIds.passkey) || false
}
