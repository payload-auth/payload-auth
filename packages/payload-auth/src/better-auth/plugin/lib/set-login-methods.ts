import { supportedBAPluginIds } from '../constants'
import { checkPluginExists } from '../helpers/check-plugin-exists'
import { BetterAuthPluginOptions, LoginMethod } from '../types'

export function setLoginMethods({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }) {
  const betterAuthOptions = pluginOptions.betterAuthOptions ?? {}
  if (pluginOptions?.admin?.loginMethods) return pluginOptions // If user defined, exit early
  const loginMethods = Object.keys(betterAuthOptions?.socialProviders ?? {})
  if (!!betterAuthOptions?.emailAndPassword || betterAuthOptions?.emailAndPassword?.enabled) loginMethods.push('emailPassword')
  if (checkPluginExists(betterAuthOptions, supportedBAPluginIds.passkey)) loginMethods.push('passkey')
  pluginOptions.admin = pluginOptions.admin ?? {}
  pluginOptions.admin.loginMethods = loginMethods as LoginMethod[]
  return pluginOptions
}
