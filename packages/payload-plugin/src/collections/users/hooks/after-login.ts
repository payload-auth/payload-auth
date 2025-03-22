import { CookiePrefixOptions, generateId, GenericEndpointContext, Session } from 'better-auth'
import { APIError, CollectionAfterLoginHook } from 'payload'
import { getPayloadWithAuth } from '../../../../src/index'
import { getIp } from '../../../helpers/get-ip'
import { base64Url } from '@better-auth/utils/base64'
import { createHMAC } from '@better-auth/utils/hmac'
import {
  getSignedCookie,
  serializeCookie,
  serializeSignedCookie,
  signCookieValue,
} from '../../../helpers/serialize-cookie'
import { cookies } from 'next/headers'
import { setSessionCookie } from 'better-auth/cookies'

type AfterLoginOptions = {
  sessionsCollectionSlug: string
}

/**
 * This hook is used to sync the admin login token with better-auth session token
 * It also creates a new session in better-auth
 */
export const getAfterLoginHook = (options: AfterLoginOptions): CollectionAfterLoginHook => {
  const hook: CollectionAfterLoginHook = async ({ collection, context, req, token, user }) => {
    const config = req.payload.config
    const payload = await getPayloadWithAuth(config)
    // we just have to signin with better-auth using email and password
    // NOTE: this might not work for admins who sigin in with social providers
    // but theres alot that needs to be done to support that anyways

    // we just need to create the session and set the cookie directly
    // reading better-auth code this seems like the process

    //create the data object that will be used to create the session
    const sessionExpiration = payload.betterAuth.options.session?.expiresIn || 60 * 60 * 24 * 7 // 7 days
    const session = await payload.create({
      collection: options.sessionsCollectionSlug,
      data: {
        ipAddress: getIp(req.headers, payload.betterAuth.options) || '',
        userAgent: req.headers?.get('user-agent') || '',
        user: user.id,
        token: generateId(32),
        expiresAt: new Date(Date.now() + sessionExpiration * 1000),
      },
    })
    const betterAuthSession = {
      session: {
        id: session.id.toString(),
        user: session.user.id.toString(),
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        expiresAt: new Date(session.expiresAt),
        token: session.token,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      },
      user: {
        id: user.id.toString(),
        collection: user.collection,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
      },
    }

    console.log('betterAuthSession', betterAuthSession)
    if (!session) {
      payload.logger.error('Failed to create better auth session')
      throw new APIError('UNAUTHORIZED', 500)
    }
    // finally set the better-auth session cookie with the session and user data
    // we have to create at least two cookies
    // the better-auth.session_token cookie
    // const sessionTokenCookie = await serializeSignedCookie(
    //   'session_token',
    //   betterAuthSession.token,
    //   process.env.BETTER_AUTH_SECRET || '',
    //   {
    //     maxAge: sessionExpiration,
    //   },
    // )
    // the better-auth.session_data cookie
    const data = base64Url.encode(
      JSON.stringify({
        session: betterAuthSession,
        expiresAt: betterAuthSession.session.expiresAt.getTime(),
        signature: await createHMAC('SHA-256', 'base64urlnopad').sign(
          process.env.BETTER_AUTH_SECRET || '',
          JSON.stringify({
            ...betterAuthSession,
            expiresAt: betterAuthSession.session.expiresAt.getTime(),
          }),
        ),
      }),
      {
        padding: false,
      },
    )

    const authContext = await payload.betterAuth.$context

    const ctx = {
      context: authContext,
      setCookie(name, value, options) {
        const path = options?.path || '/'
        const maxAge = options?.maxAge ? `; Max-Age=${options.maxAge}` : ''
        const httpOnly = options?.httpOnly ? '; HttpOnly' : ''
        const secure = options?.secure ? '; Secure' : ''
        const sameSite = options?.sameSite ? `; SameSite=${options.sameSite}` : '; SameSite=Lax'

        req.headers.set(
          'Set-Cookie',
          `${name}=${value}; Path=${path}${maxAge}${httpOnly}${secure}${sameSite}`,
        )
        return name
      },
      getSignedCookie: async (key: string, secret: string, prefix?: CookiePrefixOptions) => {
        return getSignedCookie(key, secret, req.headers, prefix)
      },
      setSignedCookie: async (key, value, secret, options) => {
        const cookie = await serializeSignedCookie(key, value, secret, options)
        req.headers.append('set-cookie', cookie)
        return cookie
      },
    } as GenericEndpointContext

    await setSessionCookie(ctx, {
      session: betterAuthSession.session as any,
      user: betterAuthSession.user as any,
    })

    const res = authContext.setNewSession({
      session: betterAuthSession.session as any,
      user: betterAuthSession.user as any,
    })

    // const sessionDataCookie = serializeCookie('session_data', data, {
    //   maxAge: sessionExpiration,
    // })

    // need to actually set the cookies with next cookies api
    const cookieStore = await cookies()
    const sessionTokenValue = await signCookieValue(
      betterAuthSession.session.token,
      process.env.BETTER_AUTH_SECRET || '',
    )
    const sessionDataValue = encodeURIComponent(data)
    // console.log('sessionTokenValue', sessionTokenValue)
    // console.log('sessionDataValue', sessionDataValue)
    // req.headers.append('set-cookie', `better-auth.session_token=${sessionTokenValue}`)
    // req.headers.append('set-cookie', `better-auth.session_data=${sessionDataValue}`)
    // const setCookie = req.headers.getSetCookie()
    // console.log('setCookie', setCookie)

    cookieStore.set('better-auth.session_token', sessionTokenValue)
    cookieStore.set('better-auth.session_data', sessionDataValue)

    // const sessionAfterLogin = await payload.betterAuth.api.getSession({
    //   headers: req.headers,
    //   query: { disableCookieCache: true },
    // })
    // console.log('sessionAfterLogin', sessionAfterLogin)
  }

  return hook as CollectionAfterLoginHook
}

// export const serializeCookie = (key: string, value: string, opt?: CookieOptions) => {
// 	value = encodeURIComponent(value);
// 	return _serialize(key, value, opt);
// };

// setCookie: (key: string, value: string, options?: CookieOptions) => {
//     const cookie = serializeCookie(key, value, options);
//     headers.append("set-cookie", cookie);
//     return cookie;
// },
// export function getCookies(options: BetterAuthOptions) {
//   const createCookie = createCookieGetter(options)
//   const sessionMaxAge = options.session?.expiresIn || createTime(7, 'd').toSeconds()
//   const sessionToken = createCookie('session_token', {
//     maxAge: sessionMaxAge,
//   })
//   const sessionData = createCookie('session_data', {
//     maxAge: options.session?.cookieCache?.maxAge || 60 * 5,
//   })
//   const dontRememberToken = createCookie('dont_remember')
//   return {
//     sessionToken: {
//       name: sessionToken.name,
//       options: sessionToken.attributes,
//     },
//     /**
//      * This cookie is used to store the session data in the cookie
//      * This is useful for when you want to cache the session in the cookie
//      */
//     sessionData: {
//       name: sessionData.name,
//       options: sessionData.attributes,
//     },
//     dontRememberToken: {
//       name: dontRememberToken.name,
//       options: dontRememberToken.attributes,
//     },
//   }
// }

// sessionConfig: {
//     updateAge: number;
//     expiresIn: number;
//     freshAge: number;
// };

// setSignedCookie: async (
//     key: string,
//     value: string,
//     secret: string,
//     options?: CookieOptions,
// ) => {
//     const cookie = await serializeSignedCookie(key, value, secret, options);
//     headers.append("set-cookie", cookie);
//     return cookie;
// },

// export const afterLogin: CollectionAfterLoginHook<User> = async ({
//   collection,
//   context,
//   req,
//   token,
//   user,
// }) => {

// }

// token
// V8zOX8p6L3yeyt5NlW0wYq1Yb81YI0Bj.jSdCK44cbk92dYNYMFIC5Za8vnuBf3atACUBEvCW+bY=

// data
// eyJzZXNzaW9uIjp7InNlc3Npb24iOnsiaWQiOjYsInVzZXIiOjYsInRva2VuIjoiVjh6T1g4cDZMM3lleXQ1TmxXMHdZcTFZYjgxWUkwQmoiLCJleHBpcmVzQXQiOiIyMDI1LTAzLTI5VDA1OjMxOjI4LjEyOVoiLCJpcEFkZHJlc3MiOiI6OjEiLCJ1c2VyQWdlbnQiOiJNb3ppbGxhLzUuMCAoTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF8xNV83KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTM0LjAuMC4wIFNhZmFyaS81MzcuMzYiLCJ1cGRhdGVkQXQiOiIyMDI1LTAzLTIyVDA1OjMxOjI4LjEzMloiLCJjcmVhdGVkQXQiOiIyMDI1LTAzLTIyVDA1OjMxOjI4LjEyOVoifSwidXNlciI6eyJpZCI6NiwiY29sbGVjdGlvbiI6InVzZXJzIiwiZW1haWwiOiJkb21pbmFudHNvY2lhbHNAZ21haWwuY29tIiwibmFtZSI6Ikx1a2UgR2Fubm9uIiwiZW1haWxWZXJpZmllZCI6dHJ1ZSwiaW1hZ2UiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKMGNtRThJOUxmRF9tWWFNZ01vbW5MNVRSYVBrWXhWZFNhOGZLOWVUOGtvRFFCenc9czk2LWMiLCJyb2xlIjoidXNlciJ9fSwiZXhwaXJlc0F0IjoxNzQyNjIxNzg4MTM3LCJzaWduYXR1cmUiOiJoM29TTGQzR1VMWGNlek5waWlqeHA2QTdRMThNLXE5VXlSMWJlcUZUMlMwIn0
// {
//     "session": {
//       "session": {
//         "id": 6,
//         "user": 6,
//         "token": "V8zOX8p6L3yeyt5NlW0wYq1Yb81YI0Bj",
//         "expiresAt": "2025-03-29T05:31:28.129Z",
//         "ipAddress": "::1",
//         "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
//         "updatedAt": "2025-03-22T05:31:28.132Z",
//         "createdAt": "2025-03-22T05:31:28.129Z"
//       },
//       "user": {
//         "id": 6,
//         "collection": "users",
//         "email": "dominantsocials@gmail.com",
//         "name": "Luke Gannon",
//         "emailVerified": true,
//         "image": "https://lh3.googleusercontent.com/a/ACg8ocJ0cmE8I9LfD_mYaMgMomnL5TRaPkYxVdSa8fK9eT8koDQBzw=s96-c",
//         "role": "user"
//       }
//     },
//     "expiresAt": 1742621788137,
//     "signature": "h3oSLd3GULXcezNpiijxp6A7Q18M-q9UyR1beqFT2S0"
//   }
