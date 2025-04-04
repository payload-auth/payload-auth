import { setCookieCache } from 'better-auth/cookies'
import { createAuthMiddleware } from 'better-auth/api'
import type { SanitizedBetterAuthOptions, PayloadBetterAuthPluginOptions } from '..'
import type { Config, Payload } from 'payload'
import { prepareSessionData } from './prepare-session-data'

/**
 * Sets up a middleware that enforces the saveToJwt configuration when setting session data.
 * This ensures that only fields specified in saveToJwt are included in the cookie cache
 * for both user and session objects.
 *
 * The middleware runs after authentication and filters the session data based on
 * the collection configurations before storing it in the cookie cache.
 */
export function respectSaveToJwtFieldsMiddleware({
  sanitizedOptions,
  payloadConfig,
  pluginOptions,
}: {
  sanitizedOptions: SanitizedBetterAuthOptions
  payloadConfig: Payload['config'] | Config
  pluginOptions: PayloadBetterAuthPluginOptions
}) {
  if (typeof sanitizedOptions.hooks !== 'object') sanitizedOptions.hooks = {}

  sanitizedOptions.hooks.after = createAuthMiddleware(async (ctx) => {
    const newSession = ctx.context?.newSession
    if (!newSession) return

    const filteredSessionData = await prepareSessionData({
      newSession,
      payloadConfig,
      collectionSlugs: {
        userCollectionSlug: pluginOptions.users?.slug ?? 'users',
        sessionCollectionSlug: pluginOptions.sessions?.slug ?? 'sessions',
      },
    })

    if (filteredSessionData) {
      await setCookieCache(ctx, filteredSessionData as any)
    }
  })
}
