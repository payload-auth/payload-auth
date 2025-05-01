import type { SanitizedBetterAuthOptions } from '@/better-auth/plugin/types'
import { createAuthMiddleware } from 'better-auth/api'

/**
 * Mofies options object and adds a middleware to check for admin invite for sign up
 */
export const useAdminInviteAfterEmailSignUpMiddleware = async ({
  options,
  adminInvitationCollectionSlug,
  userCollectionSlug
}: {
  options: SanitizedBetterAuthOptions
  adminInvitationCollectionSlug: string
  userCollectionSlug: string
}) => {
  options.hooks = options.hooks || {}
  const originalAfter = options.hooks.after
  options.hooks.after = createAuthMiddleware(async (ctx) => {
    const adapter = ctx.context.adapter
    const internalAdapter = ctx.context.internalAdapter

    if (ctx.path !== '/sign-up/email') {
      if (typeof originalAfter === 'function') originalAfter(ctx)
      return
    }
    const email = ctx.body.email
    const adminInviteToken = ctx?.query?.adminInviteToken ?? ctx.body.adminInviteToken
    const adminInvitation = await adapter.findOne({
      model: adminInvitationCollectionSlug,
      where: [{
        field: 'token',
        value: adminInviteToken,
        operator: 'eq'
      }]
    }) as any
    if(!adminInvitation || !adminInvitation?.role || !email) {
      if (typeof originalAfter === 'function') originalAfter(ctx)
      return
    }

    const newlyCreatedUser = await internalAdapter.findUserByEmail(email)
    if(!newlyCreatedUser) {
      if (typeof originalAfter === 'function') originalAfter(ctx)
      return
    }

    await adapter.update({
      model: userCollectionSlug,
      where: [{
        field: 'id',
        value: newlyCreatedUser.user.id,
        operator: 'eq'
      }],
      update: {
        role: adminInvitation?.role
      }
    })

    await adapter.delete({
      model: adminInvitationCollectionSlug,
      where: [{
        field: 'id',
        value: adminInvitation.id,
        operator: 'eq'
      }]
    })
    
    if (typeof originalAfter === 'function') originalAfter(ctx)
  })
}
