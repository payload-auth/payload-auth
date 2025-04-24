import { betterAuthPluginSlugs, supportedBetterAuthPluginIds } from '../constants'
import type { SanitizedBetterAuthOptions } from '../types'

export function checkUsernamePlugin(options: SanitizedBetterAuthOptions) {
  return options.plugins?.some((plugin) => plugin.id === supportedBetterAuthPluginIds.username) || false
}
