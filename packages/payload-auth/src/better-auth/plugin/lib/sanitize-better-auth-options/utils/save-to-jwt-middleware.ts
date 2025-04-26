import { prepareSessionData } from '@/better-auth/plugin/helpers/prepare-session-data'
import { createAuthMiddleware } from 'better-auth/api'
import { setSessionCookie } from 'better-auth/cookies'

import type { SanitizedBetterAuthOptions } from '@/better-auth/plugin/types'
import type { CollectionConfig } from 'payload'
/**
 * Sets up a middleware that enforces the saveToJwt configuration when setting session data.
 * This ensures that only fields specified in saveToJwt are included in the cookie cache
 * for both user and session objects.
 *
 * The middleware runs after authentication and filters the session data based on
 * the collection configurations before storing it in the cookie cache.
 */
export function saveToJwtMiddleware({
  sanitizedOptions,
  collectionMap
}: {
  sanitizedOptions: SanitizedBetterAuthOptions
  collectionMap: Record<string, CollectionConfig>
}) {
  if (typeof sanitizedOptions.hooks !== 'object') sanitizedOptions.hooks = {}
  const originalAfter = sanitizedOptions.hooks.after
  sanitizedOptions.hooks.after = createAuthMiddleware(async (ctx) => {
    const newSession = ctx.context.newSession
    if (newSession) {
      const filteredSessionData = await prepareSessionData({
        sessionData: newSession,
        collectionMap
      })

      if (filteredSessionData) {
        await setSessionCookie(ctx, filteredSessionData)
      }
    }

    if (typeof originalAfter === 'function') {
      return originalAfter(ctx)
    }

    return
  })
}
