import { prepareSessionData } from '@/better-auth/plugin/helpers/prepare-session-data'
import { createAuthMiddleware } from 'better-auth/api'
import { setSessionCookie } from 'better-auth/cookies'
import { customSession } from 'better-auth/plugins'

import type { BetterAuthPluginOptions, SanitizedBetterAuthOptions } from '@/better-auth/plugin/types'
import type { Config, Payload } from 'payload'
import { getSessionFromCtx } from 'better-auth/api'
import { baseCollectionSlugs } from '@/better-auth/plugin/constants'
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
  sanitizedOptions.plugins = sanitizedOptions.plugins ?? []
  sanitizedOptions.plugins.push(
    customSession(async ({ user, session }) => {
      // add additional field to user object (no db calls)
      const newUser = {
        ...user,
        customField: 'test'
      }
      return {
        session,
        user: newUser
      }
    })
  )
  sanitizedOptions.hooks.after = createAuthMiddleware(async (ctx) => {
    const session = await getSessionFromCtx(ctx)
    if (session) {
      const filteredSessionData = await prepareSessionData({
        session,
        payloadConfig,
        collectionSlugs: {
          userCollectionSlug: pluginOptions.users?.slug ?? baseCollectionSlugs.users,
          sessionCollectionSlug: pluginOptions.sessions?.slug ?? baseCollectionSlugs.sessions
        }
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
