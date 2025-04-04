import { generateId, Session } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { setCookieCache } from 'better-auth/cookies'
import { parseSetCookie, type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { cookies } from 'next/headers'
import { CollectionAfterLoginHook } from 'payload'
import { getPayloadAuth } from '../../../lib/get-payload-auth'
import { getIp } from '../../../helpers/get-ip'
import { prepareSessionData } from '../../../lib/prepare-session-data'

type AfterLoginOptions = {
  usersCollectionSlug: string
  sessionsCollectionSlug: string
}

/**
 * This hook is used to sync the admin login token with better-auth session token
 * It also creates a new session in better-auth
 */
export const getAfterLoginHook = (options: AfterLoginOptions): CollectionAfterLoginHook => {
  const hook: CollectionAfterLoginHook = async ({ collection, context, req, token, user }) => {
    const config = req.payload.config
    const payload = await getPayloadAuth(config)
    const cookieStore = await cookies()
    const authContext = await payload.betterAuth.$context

    const sessionExpiration = payload.betterAuth.options.session?.expiresIn || 60 * 60 * 24 * 7 // 7 days
    // we can't use internal adapter as we can cause a race condition unless we pass req to the payload.create
    const session = (await payload.create({
      collection: options.sessionsCollectionSlug,
      data: {
        ipAddress: getIp(req.headers, payload.betterAuth.options) || '',
        userAgent: req.headers?.get('user-agent') || '',
        user: user.id,
        token: generateId(32),
        expiresAt: new Date(Date.now() + sessionExpiration * 1000),
      },
      req,
    })) as Session

    const betterAuthHandleRequest = createAuthMiddleware(async (ctx): Promise<Headers | null> => {
      ctx.context = { ...authContext, user: user }
      await ctx.setSignedCookie(
        ctx.context.authCookies.sessionToken.name,
        session.token,
        ctx.context.secret,
        ctx.context.authCookies.sessionToken.options,
      )
      const filteredSessionData = await prepareSessionData({
        newSession: { session, user },
        payloadConfig: config,
        collectionSlugs: {
          userCollectionSlug: options.usersCollectionSlug,
          sessionCollectionSlug: options.sessionsCollectionSlug,
        },
      })
      await setCookieCache(ctx, filteredSessionData as any)
      if ('responseHeaders' in ctx) {
        return ctx.responseHeaders as Headers
      }
      return null
    })

    const responseHeaders = await betterAuthHandleRequest(req)
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
          value: decodeURIComponent(value),
        })
      }
    }
  }

  return hook as CollectionAfterLoginHook
}
