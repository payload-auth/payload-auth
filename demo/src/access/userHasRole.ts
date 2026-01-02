import type { User } from '@/lib/auth/types'
import { RoleArray } from 'payload-auth/better-auth'
export type UserRole = { role?: RoleArray<string[]> | string | null }
export const userHasRole = (user: UserRole | null | undefined, roles: NonNullable<User['role']>) => {
  if (!user || !user.role) {
    return false
  }

  // Handle both RoleArray and string types
  const roleArray = Array.isArray(user.role) ? user.role : [user.role]
  return roleArray.some((role) => (roles as string[]).includes(role))
}
