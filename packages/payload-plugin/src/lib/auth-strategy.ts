import type { AuthStrategy } from 'payload'
import { getPayloadWithAuth } from '../index.js'
import type { TPlugins } from '../types.js'

/**
 * Auth strategy for BetterAuth
 * @param adminRoles - Admin roles
 * @param userSlug - User collection slug
 * @returns Auth strategy
 */
export function betterAuthStrategy(adminRoles?: string[], userSlug?: string): AuthStrategy {
  return {
    name: 'better-auth',
    authenticate: async ({ payload, headers }) => {
      const payloadAuth = await getPayloadWithAuth<NonNullable<TPlugins>>(payload.config)
      const session = await payloadAuth.betterAuth.api.getSession({ headers })

      if (!session) {
        return { user: null }
      }

      const user = await payloadAuth.findByID({
        collection: userSlug ?? 'users',
        id: session.session.userId,
      })

      if (!user || (adminRoles && !adminRoles.includes(user?.role))) {
        return { user: null }
      }

      return {
        // Send the user with the collection slug back to authenticate,
        // or send null if no user should be authenticated
        user: user
          ? {
              collection: userSlug ?? 'users',
              ...user,
            }
          : null,

        // Optionally, you can return headers
        // that you'd like Payload to set here when
        // it returns the response
        responseHeaders: new Headers({
          token: session.session.token,
        }),
      }
    },
  }
}
