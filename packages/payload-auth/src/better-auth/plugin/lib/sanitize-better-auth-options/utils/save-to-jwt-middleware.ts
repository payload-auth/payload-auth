import { prepareSessionData } from '@/better-auth/plugin/helpers/prepare-session-data'
import { createAuthMiddleware } from 'better-auth/api'
import { setSessionCookie } from 'better-auth/cookies'

import { baModelKey } from '@/better-auth/plugin/constants'
import type { BetterAuthSchemas, SanitizedBetterAuthOptions } from '@/better-auth/plugin/types'
import type { Config, Payload } from 'payload'

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
  config,
  resolvedSchemas
}: {
  sanitizedOptions: SanitizedBetterAuthOptions
  config: Payload['config'] | Config | Promise<Payload['config'] | Config>
  resolvedSchemas: BetterAuthSchemas
}) {
  if (typeof sanitizedOptions.hooks !== 'object') sanitizedOptions.hooks = {}
  const originalAfter = sanitizedOptions.hooks.after
  sanitizedOptions.hooks.after = createAuthMiddleware(async (ctx) => {
    const newSession = ctx.context.newSession
    if (newSession) {
      const awaitedPayloadConfig = await config
      const usersCollection = awaitedPayloadConfig?.collections?.find((c) => c.slug === resolvedSchemas[baModelKey.user].modelName)
      const sessionsCollection = awaitedPayloadConfig?.collections?.find((c) => c.slug === resolvedSchemas[baModelKey.session].modelName)
      if (!usersCollection || !sessionsCollection) return null
      const filteredSessionData = await prepareSessionData({
        sessionData: newSession,
        usersCollection: usersCollection,
        sessionsCollection: sessionsCollection
      })

      if (filteredSessionData) {
        await setSessionCookie(ctx, filteredSessionData)
        // Set back all the data internally as we only want the cookie to update.
        // This allows plugins like two factor plugin to get enabledTwoFactor,
        // while not exposing it in cookie cache data.
        ctx.context.setNewSession(newSession)
      }
    }

    if (typeof originalAfter === 'function') {
      originalAfter(ctx)
    }
  })
}
