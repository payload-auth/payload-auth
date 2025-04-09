// import { expo } from '@better-auth/expo'
import { generateVerifyEmailUrl } from 'payload-auth/better-auth/plugin'
import type { BetterAuthReturn, BetterAuthOptions, BetterAuthPluginOptions } from 'payload-auth/better-auth'
import { emailHarmony, phoneHarmony } from 'better-auth-harmony'
import { nextCookies } from 'better-auth/next-js'
import {
  admin,
  anonymous,
  apiKey,
  emailOTP,
  magicLink,
  multiSession,
  openAPI,
  organization,
  phoneNumber,
  twoFactor,
  username
} from 'better-auth/plugins'
import { passkey } from 'better-auth/plugins/passkey'
import type { CollectionConfig } from 'payload'

export const betterAuthPlugins = [
  username(),
  emailHarmony(),
  phoneHarmony({
    defaultCountry: 'CA'
  }),
  twoFactor({
    schema: {
      user: {
        modelName: 'users',
        fields: {
          userId: 'user'
        }
      },
      twoFactor: {
        modelName: 'twoFactors',
        fields: {
          userId: 'user'
        }
      }
    },
    issuer: 'payload-better-auth',
    otpOptions: {
      async sendOTP({ user, otp }) {
        console.log('Send OTP for user: ', user, otp)
      }
    }
  }),
  anonymous({
    emailDomainName: 'payload-better-auth.com',
    onLinkAccount: async ({ anonymousUser, newUser }) => {
      console.log('Link account for anonymous user: ', anonymousUser, newUser)
    },
    disableDeleteAnonymousUser: false
  }),
  phoneNumber({
    sendOTP: async ({ phoneNumber, code }, req) => {
      console.log('Send OTP for user: ', phoneNumber, code)
    }
  }),
  magicLink({
    sendMagicLink: async ({ email, token, url }, request) => {
      console.log('Send magic link for user: ', email, token, url)
    }
  }),
  emailOTP({
    async sendVerificationOTP({ email, otp, type }) {
      console.log('Send verification OTP for user: ', email, otp, type)
    }
  }),
  passkey({
    rpID: 'payload-better-auth',
    rpName: 'payload-better-auth-demo',
    origin: 'http://localhost:3000'
  }),
  admin(),
  apiKey(),
  organization({
    teams: {
      enabled: true
    },
    async sendInvitationEmail(data) {
      const inviteLink = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/accept-invitation/${data.id}`
      console.log('Send invite for org: ', data, inviteLink)
    }
  }),
  multiSession(),
  openAPI(),
  // expo(),
  nextCookies()
]

export type BetterAuthPlugins = typeof betterAuthPlugins

export const betterAuthOptions: BetterAuthOptions = {
  appName: 'payload-better-auth',
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  trustedOrigins: [process.env.NEXT_PUBLIC_BETTER_AUTH_URL],
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
    async sendResetPassword({ user, url }) {
      console.log('Send reset password for user: ', user, url)
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }
  },
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      console.log('Send verification email for user: ', user, url)
    }
  },
  plugins: betterAuthPlugins,
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url, token }) => {
        console.log('Send change email verification for user: ', user, newEmail, url, token)
      }
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url, token }) => {
        // Send delete account verification
      },
      beforeDelete: async (user) => {
        // Perform actions before user deletion
      },
      afterDelete: async (user) => {
        // Perform cleanup after user deletion
      }
    },
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
        input: false
      }
    }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // Cache duration in seconds
    }
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'email-password']
    }
  }
}

export const betterAuthPluginOptions: BetterAuthPluginOptions = {
  disabled: false,
  debug: {
    logTables: false,
    enableDebugLogs: false
  },
  disableDefaultPayloadAuth: true,
  adminComponents: {
    socialProviders: {
      google: {
        enabled: true,
        disableSignUp: true
      }
    }
  },
  hidePluginCollections: true,
  users: {
    slug: 'users',
    hidden: false,
    adminRoles: ['admin'],
    allowedFields: ['name'],
    blockFirstBetterAuthVerificationEmail: true,
    collectionOverrides: ({ collection }) => {
      return {
        ...collection,
        auth: {
          ...(typeof collection?.auth === 'object' ? collection.auth : {}),
          verify: {
            generateEmailHTML: async ({ user, req, token }) => {
              const betterAuth = (req.payload as any).betterAuth as BetterAuthReturn<BetterAuthPlugins>
              const authContext = await betterAuth.$context
              const verifyUrl = await generateVerifyEmailUrl({
                userEmail: user.email,
                secret: authContext.secret,
                expiresIn: betterAuth.options?.emailVerification?.expiresIn || 3600,
                verifyRouteUrl: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth/verify-email`,
                callbackURL: '/dashboard'
              })

              console.log('generateEmailHTML verifyUrl', verifyUrl)

              return `<p>Verify your email by clicking <a href="${verifyUrl}">here</a></p>`
            }
          },
          loginWithUsername: {
            allowEmailLogin: true
          }
        }
      } satisfies CollectionConfig
    }
  },
  accounts: {
    slug: 'accounts'
  },
  sessions: {
    slug: 'sessions'
  },
  verifications: {
    slug: 'verifications'
  },
  betterAuthOptions: betterAuthOptions
}
