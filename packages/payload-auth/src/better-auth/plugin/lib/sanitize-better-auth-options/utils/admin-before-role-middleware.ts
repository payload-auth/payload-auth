import { createAuthMiddleware, getSessionFromCtx } from 'better-auth/api'
import type { SanitizedBetterAuthOptions } from '@/better-auth/plugin/types'

/**
 * Sets up a middleware that converts session.user.role from an array to a single string seperated by commas. only for /admin routes
 */
export function adminBeforeRoleMiddleware({ sanitizedOptions }: { sanitizedOptions: SanitizedBetterAuthOptions }) {
  if (typeof sanitizedOptions.hooks !== 'object') sanitizedOptions.hooks = {}
  const originalBefore = sanitizedOptions.hooks.before
  sanitizedOptions.hooks.before = createAuthMiddleware(async (ctx) => {
    if (ctx.path.startsWith('/admin')) {
      await getSessionFromCtx(ctx)
      if (ctx.context.session && ctx.context.session.user && Array.isArray(ctx.context.session.user.role)) {
        ctx.context.session!.user.role = ctx.context.session.user.role.join(',')
      }
    }
    if (typeof originalBefore === 'function') {
      originalBefore(ctx)
    }
  })
}
