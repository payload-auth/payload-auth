import type { BetterAuthPluginOptions } from '@/better-auth/plugin/types'

export function configureAdminPlugin(plugin: any, options: BetterAuthPluginOptions) {
  plugin.defaultRole = options.users?.defaultRole ?? 'user'
  plugin.adminRoles = options.users?.adminRoles ?? ['admin']
}
