import type { User } from '@/lib/auth/types'

import { getSession } from '@/lib/auth/context/get-context-props'
import type { AccessArgs } from 'payload'

import { userHasRole } from './userHasRole'

export const hasRole =
  (roles: NonNullable<User['role']>) =>
  async ({ req }: Pick<AccessArgs, 'req'>): Promise<boolean> => {
    const { user } = await getSession()
    if (!user) {
      return false
    }
    return userHasRole(user, roles)
  }
