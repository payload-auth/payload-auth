import { setCookieCache } from 'better-auth/cookies'
import { type Endpoint, getFieldsToSign, refreshOperation, TypedUser } from 'payload'
import { getPayloadAuth } from '@/better-auth/plugin/lib/get-payload-auth'
import { adminEndpoints } from '@/better-auth/plugin/constants'
import { getSignedCookie } from '@/better-auth/plugin/helpers/get-signed-cookie'
import type { GenericEndpointContext } from 'better-auth'

export const getRefreshTokenEndpoint = (userSlug: string): Endpoint => {
  const endpoint: Endpoint = {
    path: adminEndpoints.refreshToken,
    method: 'post',
    handler: async (req) => {
      const payload = await getPayloadAuth(req.payload.config)
      const authContext = await payload.betterAuth?.$context
      const userCollection = payload.collections[userSlug]

      if (!userCollection) {
        return new Response(JSON.stringify({ message: 'User collection not found' }), {
          status: 500
        })
      }

      if (!payload.betterAuth || !authContext) {
        return new Response(JSON.stringify({ message: 'BetterAuth not initialized' }), {
          status: 500
        })
      }

      const sessionTokenName = authContext.authCookies.sessionToken.name
      const cookieHeader = req.headers.get('cookie') || ''
      const hasSessionToken = cookieHeader.includes(`${sessionTokenName}=`)
      const dontRememberTokenName = authContext.authCookies.dontRememberToken.name

      if (!hasSessionToken) {
        try {
          const result = await refreshOperation({
            collection: userCollection,
            req
          })
          return new Response(JSON.stringify(result), { status: 200 })
        } catch (error) {
          console.error('Token refresh failed:', error)
          return new Response(JSON.stringify({ message: 'Token refresh failed' }), { status: 401 })
        }
      }

      const res = await payload.betterAuth.api.getSession({
        headers: req.headers,
        query: { disableCookieCache: true }
      })

      if (!res) {
        return new Response(JSON.stringify({ message: 'No current session' }), {
          status: 401
        })
      }

      const user = await payload.findByID({
        collection: userSlug as string,
        id: res.session.userId
      })

      if (!user) {
        return new Response(JSON.stringify({ message: 'No user found' }), {
          status: 401
        })
      }

      const cookieCacheFields = getFieldsToSign({
        collectionConfig: userCollection?.config,
        email: user.email,
        user: user as TypedUser
      })

      const responseData = {
        refreshedToken: null,
        setCookie: !!authContext.options.session?.cookieCache?.enabled,
        strategy: 'better-auth',
        user: { ...user, collection: userSlug }
      }

      const response = new Response(JSON.stringify(responseData), {
        status: 200
      })

      const ctx = {
        context: authContext,
        setCookie(name, value, options) {
          const path = options?.path || '/'
          const maxAge = options?.maxAge ? `; Max-Age=${options.maxAge}` : ''
          const httpOnly = options?.httpOnly ? '; HttpOnly' : ''
          const secure = options?.secure ? '; Secure' : ''
          const sameSite = options?.sameSite ? `; SameSite=${options.sameSite}` : '; SameSite=Lax'

          response.headers.set('Set-Cookie', `${name}=${value}; Path=${path}${maxAge}${httpOnly}${secure}${sameSite}`)
          return name
        }
      } as GenericEndpointContext

      const dontRememberMe = await getSignedCookie(cookieHeader, dontRememberTokenName, authContext.secret)

      await setCookieCache(
        ctx,
        {
          session: res.session,
          user: cookieCacheFields as any
        },
        !!dontRememberMe
      )

      return response
    }
  }

  return endpoint
}
