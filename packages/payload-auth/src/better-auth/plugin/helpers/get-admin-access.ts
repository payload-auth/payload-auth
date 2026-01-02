import type { PayloadAuthOptions } from '@/better-auth/plugin/types'
import { isAdminWithRoles } from '../lib/build-collections/utils/payload-access'

export function getAdminAccess(pluginOptions: PayloadAuthOptions) {
  const adminRoles = pluginOptions.users?.adminRoles ?? ['admin']
  return {
    create: isAdminWithRoles({
      adminRoles
    }),
    read: isAdminWithRoles({
      adminRoles
    }),
    update: isAdminWithRoles({
      adminRoles
    }),
    delete: isAdminWithRoles({
      adminRoles
    })
  }
}
