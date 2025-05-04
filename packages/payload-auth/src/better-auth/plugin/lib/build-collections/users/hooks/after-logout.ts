import { baModelKey } from '@/better-auth/plugin/constants'
import { getCollectionByModelKey } from '@/better-auth/plugin/helpers/get-collection'
import { getPayloadAuth } from '@/better-auth/plugin/lib/get-payload-auth'
import { cookies } from 'next/headers'
import type { CollectionAfterLogoutHook } from 'payload'

export function getAfterLogoutHook() {
  const hook: CollectionAfterLogoutHook = async ({ req }) => {
    const cookieStore = await cookies()
    const payload = await getPayloadAuth(req.payload.config)
    const securePrefix = '__Secure-'
    const authContext = await payload.betterAuth.$context
    const sessionTokenName = authContext.authCookies.sessionToken.name
    const sessionDataName = authContext.authCookies.sessionData.name
    const dontRememberTokenName = authContext.authCookies.dontRememberToken.name
    const sessionsSlug = getCollectionByModelKey(req.payload.collections, baModelKey.session).slug

    try {
      const sessionCookieValue = cookieStore.get(sessionTokenName)?.value
      if (sessionCookieValue) {
        const payload = req.payload
        const [token] = sessionCookieValue.split('.')
        const { docs: sessions } = await payload.find({
          collection: sessionsSlug,
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
              collection: sessionsSlug,
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
    
    //This is a hacky wat to delete the admin session cookie (BETTER AUTH HARDCODED THIS)
    // see https://github.com/better-auth/better-auth/blob/25e82669eed83ba6da063c167e8ae5b7da84ef9f/packages/better-auth/src/plugins/admin/admin.ts#L917C7-L917C23
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
