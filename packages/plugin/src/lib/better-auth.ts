import type { BasePayload, Endpoint } from 'payload'
import type {
  Auth,
  AuthContext,
  BetterAuthOptions,
  BetterAuthPlugin,
  InferAPI,
  InferPluginErrorCodes,
  InferPluginTypes,
  InferSession,
  InferUser,
  PrettifyDeep,
  UnionToIntersection,
} from 'better-auth'
import { betterAuth as betterAuthBase } from 'better-auth'

// import {
//   bearer,
//   admin,
//   multiSession,
//   organization,
//   twoFactor,
//   oneTap,
//   oAuthProxy,
//   openAPI,
//   oidcProvider,
//   customSession,
// } from 'better-auth/plugins'
// import { nextCookies } from 'better-auth/next-js'
// import { passkey } from 'better-auth/plugins/passkey'
import { payloadAdapter } from '@payload-better-auth/adapter'

// interface BASE_ERROR_CODES {
//   USER_NOT_FOUND: string
//   FAILED_TO_CREATE_USER: string
//   FAILED_TO_CREATE_SESSION: string
//   FAILED_TO_UPDATE_USER: string
//   FAILED_TO_GET_SESSION: string
//   INVALID_PASSWORD: string
//   INVALID_EMAIL: string
//   INVALID_EMAIL_OR_PASSWORD: string
//   SOCIAL_ACCOUNT_ALREADY_LINKED: string
//   PROVIDER_NOT_FOUND: string
//   INVALID_TOKEN: string
//   ID_TOKEN_NOT_SUPPORTED: string
//   FAILED_TO_GET_USER_INFO: string
//   USER_EMAIL_NOT_FOUND: string
//   EMAIL_NOT_VERIFIED: string
//   PASSWORD_TOO_SHORT: string
//   PASSWORD_TOO_LONG: string
//   USER_ALREADY_EXISTS: string
//   EMAIL_CAN_NOT_BE_UPDATED: string
//   CREDENTIAL_ACCOUNT_NOT_FOUND: string
//   SESSION_EXPIRED: string
//   FAILED_TO_UNLINK_LAST_ACCOUNT: string
//   ACCOUNT_NOT_FOUND: string
// }

// Create explicit interface based on the foo declaration
// export interface BetterAuthServer<O extends BetterAuthOptions = BetterAuthOptions> {
//   handler: (request: Request) => Promise<Response>
//   options: O
//   api: InferAPI<
//     Auth['api'] &
//       UnionToIntersection<
//         O['plugins'] extends (infer T)[]
//           ? T extends BetterAuthPlugin
//             ? T extends {
//                 endpoints: infer E
//               }
//               ? E
//               : {}
//             : {}
//           : {}
//       >
//   >
//   $context: Promise<AuthContext>
//   $Infer: {
//     Session: {
//       session: PrettifyDeep<InferSession<O>>
//       user: PrettifyDeep<InferUser<O>>
//     }
//   } & InferPluginTypes<O>
//   $ERROR_CODES: InferPluginErrorCodes<O> & BASE_ERROR_CODES
// }
type ExtractEndpointsFromPlugins<T extends BetterAuthPlugin[] | undefined> =
  T extends BetterAuthPlugin[]
    ? UnionToIntersection<Extract<T[number], { endpoints: any }>['endpoints']>
    : {}

// export type ExtractEndpoints<T> = T extends { endpoints: infer E } ? E : {}
export type ExtractEndpoints<T> = T extends BetterAuthPlugin
  ? T extends { endpoints?: infer E }
    ? E
    : {}
  : {}

// type Debug_OrganizationPlugin = ExtractEndpoints<typeof organization>

// export type BetterAuthReturn<TPlugins extends BetterAuthPlugin[] | undefined> = ReturnType<
//   typeof betterAuthBase
// > & {
//   api: InferAPI<
//     TPlugins extends BetterAuthPlugin[]
//       ? UnionToIntersection<
//           {
//             [K in keyof TPlugins]: TPlugins[K] extends { endpoints: infer E } ? E : {}
//           }[number]
//         >
//       : {}
//   >
// }

export type BetterAuthReturnForPlugins<T extends BetterAuthPlugin[]> = Omit<
  ReturnType<typeof betterAuthBase>,
  '$Infer'
> & {
  api: InferAPI<
    UnionToIntersection<
      {
        [K in keyof T]: T[K] extends { endpoints: infer E } ? E : never
      }[number]
    >
  >
  $Infer: ReturnType<typeof betterAuthBase>['$Infer'] &
    InferPluginTypes<{ plugins: T extends BetterAuthPlugin[] ? T : [] }>
}

// export type BetterAuthFn<TPlugins extends BetterAuthPlugin[] | undefined = BetterAuthPlugin[]> =
//   () => BetterAuthReturn<TPlugins>

export type BetterAuthReturn<TPlugins extends BetterAuthPlugin[] = BetterAuthPlugin[]> =
  Omit<ReturnType<typeof betterAuthBase>, '$Infer'> & {
    api: TPlugins extends (infer P)[] ? InferAPI<UnionToIntersection<ExtractEndpoints<P>>> : {}
    $Infer: ReturnType<typeof betterAuthBase>['$Infer'] & {
      [K in keyof InferPluginTypes<{
        plugins: TPlugins extends BetterAuthPlugin[] ? TPlugins : []
      }>]: InferPluginTypes<{ plugins: TPlugins extends BetterAuthPlugin[] ? TPlugins : [] }>[K]
    }
  }

export const betterAuth = <TPlugins extends BetterAuthPlugin[] = BetterAuthPlugin[]>({
  payload,
  options,
}: {
  payload: BasePayload
  options: Omit<BetterAuthOptions, 'database' | 'plugins'> & {
    enable_debug_logs?: boolean
    plugins: TPlugins
  }
}): BetterAuthReturn<TPlugins> => {
  const auth = betterAuthBase({
    ...options,
    database: payloadAdapter(payload, {
      enable_debug_logs: options.enable_debug_logs,
    }),
  })

  return auth as any as BetterAuthReturn<TPlugins>
}

// // Type-capturing function factory
// export type BetterAuthFactory = {
//   <TPlugins extends BetterAuthPlugin[]>(
//     payload: BasePayload,
//     options: Omit<any, 'database' | 'plugins'> & {
//       enable_debug_logs?: boolean
//       plugins: TPlugins
//     },
//   ): () => BetterAuthReturn<TPlugins>
// }
// export const betterAuthFactory = (<TPlugins extends BetterAuthPlugin[]>(
//   payload: BasePayload,
//   options: Omit<BetterAuthOptions, 'database' | 'plugins'> & {
//     enable_debug_logs?: boolean
//     plugins: TPlugins
//   },
// ) => {
//   // Return a function that will return the auth object
//   return () => betterAuth({ payload, options })
// }) as BetterAuthFactory

// export type BetterAuthServer<
//   TPlugins extends BetterAuthPlugin[] | undefined = BetterAuthPlugin[] | undefined,
// > = ReturnType<typeof betterAuthBase> & {
//   api: TPlugins extends BetterAuthPlugin[]
//     ? UnionToIntersection<
//         {
//           [K in keyof TPlugins]: TPlugins[K] extends { endpoints: infer E } ? E : never
//         }[number]
//       >
//     : {}
// }

// export type BetterAuthServer
//   TPlugins extends BetterAuthPlugin[] = BetterAuthPlugin[]
// > = ReturnType<typeof betterAuth<TPlugins>>

// function initBA(payload: BasePayload) {
//   const options = {
//     appName: 'PayloadBetterAuth',
//     database: payloadAdapter(payload, {
//       enable_debug_logs: true,
//     }),
//     emailAndPassword: {
//       enabled: true,
//       async sendResetPassword({ user, url }) {
//         console.log('Send reset password for user: ', user, url)
//       },
//     },
//     socialProviders: {
//       google: {
//         clientId: process.env.GOOGLE_CLIENT_ID as string,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//       },
//     },
//     emailVerification: {
//       async sendVerificationEmail({ user, url }) {
//         console.log('Send verification email for user: ', user, url)
//       },
//     },
//     plugins: [
//       organization({
//         schema: {
//           member: {
//             fields: {
//               organizationId: 'organization',
//               userId: 'user',
//             },
//           },
//           invitation: {
//             fields: {
//               organizationId: 'organization',
//               inviterId: 'inviter',
//             },
//           },
//         },
//         async sendInvitationEmail(data) {
//           console.log('Send invite for org: ', data)
//         },
//       }),
//       twoFactor({
//         schema: {
//           twoFactor: {
//             fields: {
//               userId: 'user',
//             },
//           },
//         },
//         otpOptions: {
//           async sendOTP({ user, otp }) {
//             console.log('Send OTP for user: ', user, otp)
//           },
//         },
//       }),
//       passkey({
//         schema: {
//           passkey: {
//             fields: {
//               userId: 'user',
//             },
//           },
//         },
//       }),
//       openAPI(),
//       bearer(),
//       admin({
//         adminUserIds: [],
//         schema: {
//           session: {
//             fields: {
//               impersonatedBy: 'user',
//             },
//           },
//         },
//       }),
//       multiSession(),
//       oAuthProxy(),
//       nextCookies(),
//       oidcProvider({
//         loginPage: '/sign-in',
//       }),
//       oneTap(),
//       customSession(async (session) => {
//         return {
//           ...session,
//           user: {
//             ...session.user,
//             dd: 'test',
//           },
//         }
//       }),
//     ],
//     user: {
//       modelName: 'user',
//       additionalFields: {},
//     },
//     session: {
//       modelName: 'session',
//       fields: {
//         userId: 'user',
//       },
//       cookieCache: {
//         enabled: true,
//         maxAge: 5 * 60, // Cache duration in seconds
//       },
//     },
//     account: {
//       modelName: 'account',
//       fields: {
//         userId: 'user',
//       },
//       accountLinking: {
//         trustedProviders: ['google', 'github', 'demo-app'],
//       },
//     },
//     verification: {
//       modelName: 'verification-token',
//     },
//   }
//   const foo = betterAuth({ payload, options })
// }

// : {
//   handler: (request: Request) => Promise<Response>
//   options: O
//   api: InferAPI<
//     Auth['api'] &
//       UnionToIntersection<
//         O['plugins'] extends (infer T)[]
//           ? T extends BetterAuthPlugin
//             ? T extends {
//                 endpoints: infer E
//               }
//               ? E
//               : {}
//             : {}
//           : {}
//       >
//   >
//   $context: Promise<AuthContext>
//   $Infer: {
//     Session: {
//       session: PrettifyDeep<InferSession<O>>
//       user: PrettifyDeep<InferUser<O>>
//     }
//   } & InferPluginTypes<O>
//   $ERROR_CODES: InferPluginErrorCodes<O> & BASE_ERROR_CODES
// }
