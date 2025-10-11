import { defaults } from '../../constants'
import type { BetterAuthPluginOptions } from '../../types'

export function configureAdminPlugin(plugin: any, options: BetterAuthPluginOptions): void {
  plugin.defaultRole = options.users?.defaultRole ?? defaults.userRole
  plugin.adminRoles = options.users?.adminRoles ?? [defaults.adminRole]
}
