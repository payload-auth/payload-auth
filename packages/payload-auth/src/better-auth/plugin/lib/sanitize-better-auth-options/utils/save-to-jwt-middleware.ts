import { setCookieCache } from 'better-auth/cookies'
import { createAuthMiddleware } from 'better-auth/api'
import { prepareSessionData } from '@/better-auth/plugin/helpers/prepare-session-data'

import type { Config, Payload } from 'payload'
import type { SanitizedBetterAuthOptions, BetterAuthPluginOptions } from '@/better-auth/plugin/types'
import { getAuthTables } from 'better-auth/db'

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
  payloadConfig,
  pluginOptions
}: {
  sanitizedOptions: SanitizedBetterAuthOptions
  payloadConfig: Payload['config'] | Config | Promise<Payload['config'] | Config>
  pluginOptions: BetterAuthPluginOptions
}) {
  if (typeof sanitizedOptions.hooks !== 'object') sanitizedOptions.hooks = {}

  const originalAfter = sanitizedOptions.hooks.after
  sanitizedOptions.hooks.after = createAuthMiddleware(async (ctx) => {
    const newSession = ctx.context?.session ?? ctx.context?.newSession
    if (!newSession) return

    const filteredSessionData = await prepareSessionData({
      newSession,
      payloadConfig,
      collectionSlugs: {
        userCollectionSlug: pluginOptions.users?.slug ?? 'users',
        sessionCollectionSlug: pluginOptions.sessions?.slug ?? 'sessions'
      }
    })

    if (filteredSessionData) {
      await setCookieCache(ctx, filteredSessionData as any)
    }
    if (typeof originalAfter === 'function') {
      return originalAfter(ctx)
    }
    return
  })
}
