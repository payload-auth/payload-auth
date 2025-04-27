import { baModelKey } from '@/better-auth/plugin/constants'
import { getMappedCollection, transformCollectionsToCollectionConfigs } from '@/better-auth/plugin/helpers/get-collection'
import { getIp } from '@/better-auth/plugin/helpers/get-ip'
import { prepareSessionData } from '@/better-auth/plugin/helpers/prepare-session-data'
import { getPayloadAuth } from '@/better-auth/plugin/lib/get-payload-auth'
import type { BetterAuthPluginOptions } from '@/better-auth/plugin/types'
import { generateId, Session } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { setSessionCookie } from 'better-auth/cookies'
import { parseSetCookie, type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { cookies } from 'next/headers'
import { CollectionAfterLoginHook } from 'payload'
/**
 * This hook is used to sync the admin login token with better-auth session token
 * It also creates a new session in better-auth
 */
export function getAfterLoginHook() {
  const hook: CollectionAfterLoginHook = async ({ req, user }) => {
    const config = req.payload.config
    const payload = await getPayloadAuth(config)
    const collections = req.payload.collections
    const collectionMap = transformCollectionsToCollectionConfigs(collections)
    const userCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.user })
    const sessionCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.session })
    const cookieStore = await cookies()
    const authContext = await payload.betterAuth.$context
    const sessionExpiration = payload.betterAuth.options.session?.expiresIn || 60 * 60 * 24 * 7 // 7 days
    // we can't use internal adapter as we can cause a race condition unless we pass req to the payload.create
    const session = (await payload.create({
      collection: sessionCollection.slug,
      data: {
        ipAddress: getIp(req.headers, payload.betterAuth.options) || '',
        userAgent: req.headers?.get('user-agent') || '',
        user: user.id,
        token: generateId(32),
        expiresAt: new Date(Date.now() + sessionExpiration * 1000)
      },
      req
    })) as Session

    const betterAuthHandleRequest = createAuthMiddleware(async (ctx): Promise<Headers | null> => {
      ctx.context = { ...authContext, user: user }
      await ctx.setSignedCookie(
        ctx.context.authCookies.sessionToken.name,
        session.token,
        ctx.context.secret,
        ctx.context.authCookies.sessionToken.options
      )
      const filteredSessionData = await prepareSessionData({
        sessionData: { session, user },
        usersCollection: userCollection,
        sessionsCollection: sessionCollection
      })
      if (filteredSessionData) {
        await setSessionCookie(ctx, filteredSessionData)
      }
      if ('responseHeaders' in ctx) {
        return ctx.responseHeaders as Headers
      }
      return null
    })

    // Create a modified request object that matches the expected MiddlewareInputContext type
    const modifiedReq = {
      ...req,
      body: undefined // Explicitly set body to undefined to satisfy type constraint
    }

    const responseHeaders = await betterAuthHandleRequest(modifiedReq)
    const responseCookies = responseHeaders
      ?.getSetCookie()
      .map((cookie) => parseSetCookie(cookie))
      .filter(Boolean) as ResponseCookie[]

    if (responseCookies) {
      for (const cookieData of responseCookies) {
        const { name, value, ...options } = cookieData
        cookieStore.set({
          ...options,
          name,
          value: decodeURIComponent(value)
        })
      }
    }
  }

  return hook as CollectionAfterLoginHook
}
