import * as types from './types.js'
import type { Config } from 'payload'

import collectionConfigs from './lib/collections/index.js'
import { BetterAuthOptions, BetterAuthPlugin } from 'better-auth'
import { betterAuth } from './lib/better-auth.js'

import {
  bearer,
  admin,
  multiSession,
  organization,
  twoFactor,
  oneTap,
  oAuthProxy,
  openAPI,
  oidcProvider,
  customSession,
} from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { passkey } from 'better-auth/plugins/passkey'
import type { BetterAuthReturn } from './lib/better-auth.js'

// export type BetterAuthFn = <
//   TPlugins extends BetterAuthPlugin[] = BetterAuthPlugin[],
// >() => BetterAuthReturn<TPlugins>

export type PayloadBetterAuthConfig = {
  disabled?: boolean
  betterAuthOptions?: Omit<BetterAuthOptions, 'database'> & {
    enable_debug_logs?: boolean
  }
}

const plugins = [
  organization({
    schema: {
      member: {
        fields: {
          organizationId: 'organization',
          userId: 'user',
        },
      },
      invitation: {
        fields: {
          organizationId: 'organization',
          inviterId: 'inviter',
        },
      },
    },
    async sendInvitationEmail(data) {
      console.log('Send invite for org: ', data)
    },
  }),
  twoFactor({
    schema: {
      twoFactor: {
        fields: {
          userId: 'user',
        },
      },
    },
    otpOptions: {
      async sendOTP({ user, otp }) {
        console.log('Send OTP for user: ', user, otp)
      },
    },
  }),
  passkey({
    schema: {
      passkey: {
        fields: {
          userId: 'user',
        },
      },
    },
  }),
  openAPI(),
  bearer(),
  admin({
    adminUserIds: [],
    schema: {
      session: {
        fields: {
          impersonatedBy: 'user',
        },
      },
    },
  }),
  multiSession(),
  oAuthProxy(),
  oidcProvider({
    loginPage: '/sign-in',
  }),
  oneTap(),
  nextCookies(),
]

export type Plugins = typeof plugins
export const payloadBetterAuth =
  (pluginOptions: PayloadBetterAuthConfig) =>
  (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config
    }

    if (!config.collections) {
      config.collections = []
    }

    config.collections.push(...collectionConfigs)

    config.onInit = async (payload) => {
      const auth = betterAuth({
        payload,
        options: {
          ...pluginOptions.betterAuthOptions,
          plugins,
        },
      })

      payload.betterAuth = auth
    }
    return config
  }

export type { types, BetterAuthReturn }

// type AuthType = typeof auth

// const plugins = auth.options.plugins || []
// type UsedPlugins = typeof plugins
// payload.betterAuth = (<
//   TPlugins extends BetterAuthPlugin[] = BetterAuthPlugin[],
// >(customOptions?: {
//   plugins?: TPlugins
// }) => {
//   // If custom options are provided, create a new instance
//   if (customOptions) {
//     return betterAuth({
//       payload,
//       options: {
//         ...pluginOptions.betterAuthOptions,
//         ...customOptions,
//       },
//     })
//   }
//   // Otherwise return the existing instance with the correct type
//   return auth
// }) as any
// type AuthType = typeof auth
//  = auth as AuthType
// plugins: [
//   organization({
//     schema: {
//       member: {
//         fields: {
//           organizationId: 'organization',
//           userId: 'user',
//         },
//       },
//       invitation: {
//         fields: {
//           organizationId: 'organization',
//           inviterId: 'inviter',
//         },
//       },
//     },
//     async sendInvitationEmail(data) {
//       console.log('Send invite for org: ', data)
//     },
//   }),
//   twoFactor({
//     schema: {
//       twoFactor: {
//         fields: {
//           userId: 'user',
//         },
//       },
//     },
//     otpOptions: {
//       async sendOTP({ user, otp }) {
//         console.log('Send OTP for user: ', user, otp)
//       },
//     },
//   }),
//   passkey({
//     schema: {
//       passkey: {
//         fields: {
//           userId: 'user',
//         },
//       },
//     },
//   }),
//   openAPI(),
//   bearer(),
//   admin({
//     adminUserIds: [],
//     schema: {
//       session: {
//         fields: {
//           impersonatedBy: 'user',
//         },
//       },
//     },
//   }),
//   multiSession(),
//   oAuthProxy(),
//   oidcProvider({
//     loginPage: '/sign-in',
//   }),
//   oneTap(),
//   nextCookies(),
// ],
// plugins: [...(pluginOptions.betterAuthOptions.plugins || [])],
