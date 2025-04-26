import type { BetterAuthPluginOptions } from '@/better-auth/plugin/types'
import { defaults } from '../../constants'

export function configureAdminPlugin(plugin: any, options: BetterAuthPluginOptions): void {
  plugin.defaultRole = options.users?.defaultRole ?? defaults.userRole
  plugin.adminRoles = options.users?.adminRoles ?? [defaults.adminRole]
}
