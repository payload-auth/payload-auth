import { baModelKey, defaults } from '../../constants'
import type { BetterAuthPluginOptions, BetterAuthSchemas } from '@/better-auth/types'
import { set } from '../../utils/set'
import { getSchemaCollectionSlug } from '../build-collections/utils/collection-schema'

export function configureAdminPlugin(plugin: any, options: BetterAuthPluginOptions, resolvedSchemas: BetterAuthSchemas): void {
  plugin.defaultRole = options.users?.defaultRole ?? defaults.userRole
  plugin.adminRoles = options.users?.adminRoles ?? [defaults.adminRole]

  set(
    plugin,
    `schema.${baModelKey.session}.fields.impersonatedBy.references.model`,
    getSchemaCollectionSlug(resolvedSchemas, baModelKey.user)
  )
}
