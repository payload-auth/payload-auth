import { cookies } from 'next/headers'
import type { CollectionAfterLogoutHook } from 'payload'
import type { CollectionHookWithBetterAuth } from '@/better-auth/plugin/types'
import { getPayloadAuth } from '@/better-auth/plugin/lib/get-payload-auth'

type CollectionAfterLogoutHookWithBetterAuth = CollectionHookWithBetterAuth<CollectionAfterLogoutHook>

type AfterLogoutOptions = {
  sessionsCollectionSlug: string
}

export const getAfterLogoutHook = (options: AfterLogoutOptions): CollectionAfterLogoutHook => {
  const hook: CollectionAfterLogoutHookWithBetterAuth = async ({ req }) => {
    const cookieStore = await cookies()
    const payload = await getPayloadAuth(req.payload.config)
    const securePrefix = '__Secure-'
    const authContext = await payload.betterAuth.$context
    const sessionTokenName = authContext.authCookies.sessionToken.name
    const sessionDataName = authContext.authCookies.sessionData.name
    const dontRememberTokenName = authContext.authCookies.dontRememberToken.name

    try {
      const sessionCookieValue = cookieStore.get(sessionTokenName)?.value
      if (sessionCookieValue) {
        const payload = req.payload
        const [token] = sessionCookieValue.split('.')
        const { docs: sessions } = await payload.find({
          collection: options.sessionsCollectionSlug,
          where: {
            token: { equals: token }
          },
          limit: 1,
          req
        })
        const session = sessions.at(0)
        if (session) {
          try {
            await payload.delete({
              collection: options.sessionsCollectionSlug,
              where: {
                id: { equals: session.id }
              },
              req
            })
          } catch (error) {
            console.error('Error deleting session:', error)
          }
        }
      }

      const baseMultiSessionName = sessionTokenName + '_multi'
      const multiSessionCookies = cookieStore.getAll()
      multiSessionCookies.forEach((cookie) => {
        if (cookie.name.startsWith(baseMultiSessionName)) {
          cookieStore.delete(cookie.name)
        }
        const secureMultiSessionName = securePrefix + baseMultiSessionName
        if (cookie.name.startsWith(secureMultiSessionName)) {
          cookieStore.delete(cookie.name)
        }
      })
    } catch (error) {
      console.error('Error afterLogoutHook:', error)
    }
    //TODO: this is a hack to delete the admin session cookie
    // we need to find a better way to do this (BETTER AUTH HARDCODED THIS)
    cookieStore.delete('admin_session')

    const cleanSessionTokenName = sessionTokenName.replace(securePrefix, '')
    const cleanSessionDataName = sessionDataName.replace(securePrefix, '')
    const cleanDontRememberTokenName = dontRememberTokenName.replace(securePrefix, '')

    cookieStore.delete(cleanSessionTokenName)
    cookieStore.delete(`__Secure-${cleanSessionTokenName}`)

    cookieStore.delete(cleanSessionDataName)
    cookieStore.delete(`__Secure-${cleanSessionDataName}`)

    cookieStore.delete(cleanDontRememberTokenName)
    cookieStore.delete(`__Secure-${cleanDontRememberTokenName}`)
  }

  return hook as CollectionAfterLogoutHook
}
