import type { AuthStrategy } from 'payload'
import { getPayloadAuth } from '@/better-auth/plugin/lib/get-payload-auth'
import { baseCollectionSlugs } from '@/better-auth/plugin/constants'

/**
 * Auth strategy for BetterAuth
 * @param userSlug - User collection slug
 * @returns Auth strategy
 */
export function betterAuthStrategy(userSlug?: string): AuthStrategy {
  return {
    name: 'better-auth',
    authenticate: async ({ payload, headers }) => {
      try {
        const payloadAuth = await getPayloadAuth(payload.config)
        const res = await payloadAuth.betterAuth.api.getSession({
          headers
        })
        if (!res) {
          return { user: null }
        }
        const userId =
          res.user.id ?? res.session.userId ?? ('user' in res.session && typeof res.session.user === 'string' ? res.session.user : null)
        if (!userId) {
          return { user: null }
        }
        const user = await payloadAuth.findByID({
          collection: userSlug ?? baseCollectionSlugs.users,
          id: userId
        })
        if (!user) {
          return { user: null }
        }
        return {
          user: {
            ...user,
            collection: userSlug ?? baseCollectionSlugs.users,
            _strategy: 'better-auth'
          }
        }
      } catch (error) {
        console.error(error)
        return { user: null }
      }
    }
  }
}
