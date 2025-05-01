import { prepareSessionData } from '@/better-auth/plugin/helpers/prepare-session-data'
import { createAuthMiddleware } from 'better-auth/api'
import { setSessionCookie } from 'better-auth/cookies'

import type { SanitizedBetterAuthOptions } from '@/better-auth/plugin/types'
import type { CollectionConfig, Config, Payload } from 'payload'
import type { CollectionSchemaMap } from '@/better-auth/plugin/helpers/get-collection-schema-map'
import { baModelKey } from '@/better-auth/plugin/constants'

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
  collectionSchemaMap
}: {
  sanitizedOptions: SanitizedBetterAuthOptions
  config: Payload['config'] | Config | Promise<Payload['config'] | Config>
  collectionSchemaMap: CollectionSchemaMap
}) {
  if (typeof sanitizedOptions.hooks !== 'object') sanitizedOptions.hooks = {}
  const originalAfter = sanitizedOptions.hooks.after
  sanitizedOptions.hooks.after = createAuthMiddleware(async (ctx) => {
    const newSession = ctx.context.newSession
    if (newSession) {
      const awaitedPayloadConfig = await config
      const usersCollection = awaitedPayloadConfig?.collections?.find((c) => c.slug === collectionSchemaMap[baModelKey.user].collectionSlug)
      const sessionsCollection = awaitedPayloadConfig?.collections?.find(
        (c) => c.slug === collectionSchemaMap[baModelKey.session].collectionSlug
      )
      if (!usersCollection || !sessionsCollection) return null

      const filteredSessionData = await prepareSessionData({
        sessionData: newSession,
        usersCollection: usersCollection,
        sessionsCollection: sessionsCollection
      })

      if (filteredSessionData) {
        await setSessionCookie(ctx, filteredSessionData)
      }
    }

    if (typeof originalAfter === 'function') {
      originalAfter(ctx)
    }
  })
}
