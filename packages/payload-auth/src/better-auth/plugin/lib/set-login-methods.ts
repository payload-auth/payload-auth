import { BetterAuthPluginOptions, LoginMethod } from "../types";

export function setLoginMethods({
  pluginOptions
}: {
  pluginOptions: BetterAuthPluginOptions
}) {
  const betterAuthOptions = pluginOptions.betterAuthOptions

  const hasBetterAuthPlugin = (pluginId: string) => {
    return betterAuthOptions?.plugins?.some((plugin) => plugin.id === pluginId) || false
  }

  if (pluginOptions?.admin?.loginMethods) return pluginOptions // If user defined, exit early

  const loginMethods = Object.keys(betterAuthOptions?.socialProviders ?? {})
  if (!!betterAuthOptions?.emailAndPassword || betterAuthOptions?.emailAndPassword?.enabled) loginMethods.push('emailPassword')
  if (hasBetterAuthPlugin('passkey')) loginMethods.push('passkey')
  pluginOptions.admin = pluginOptions.admin ?? {}
  pluginOptions.admin.loginMethods = loginMethods as LoginMethod[]
  return pluginOptions
}
