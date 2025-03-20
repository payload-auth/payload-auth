import { setCookieCache } from 'better-auth/cookies'
import { createAuthMiddleware } from 'better-auth/api'
import { getFieldsToSign } from 'payload'
import type { SanitizedBetterAuthOptions } from '../types.js'
import type { Config, Payload } from 'payload'

/**
 * Adds after-auth middleware to sanitize session data that goes into the cookie cache.
 * This middleware leverages the payload configuration's 'saveToJwt' property to filter
 * the user object, ensuring only permitted fields are included in the cookie cache.
 */
export function setAfterAuthMiddlewareHook(
  options: SanitizedBetterAuthOptions,
  payloadConfig: Payload['config'] | Config,
) {
  if (typeof options.hooks !== 'object') options.hooks = {}

  options.hooks.after = createAuthMiddleware(async (ctx) => {
    const newSession = ctx.context?.newSession
    if (!ctx.context.newSession) return

    if (newSession && newSession.user) {
      const userCollection = payloadConfig?.collections?.find((c) => Boolean(c.auth))

      if (!userCollection) {
        throw new Error('User collection not found')
      }

      const filteredUser = getFieldsToSign({
        collectionConfig: userCollection,
        email: newSession.user.email,
        user: newSession.user as any,
      })

      const filteredSessionData = {
        ...newSession,
        user: filteredUser,
      }
      await setCookieCache(ctx, filteredSessionData as any)
    }
  })
}
