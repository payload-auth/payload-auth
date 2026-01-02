import type { BetterAuthOptions, PayloadAuthOptions } from 'payload-auth/better-auth'
import { emailHarmony, phoneHarmony } from 'better-auth-harmony'
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
import { passkey } from '@better-auth/passkey'
import { createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import type { BetterAuthPlugin as BetterAuthPluginType } from 'better-auth/types'

export const betterAuthPlugins = [
  username(),
  emailHarmony(),
  phoneHarmony({
    defaultCountry: 'CA'
  }),
  twoFactor({
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
    rpID: 'localhost',
    rpName: 'Localhost',
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
  nextCookies()
] satisfies BetterAuthPluginType[]

export type BetterAuthPlugins = typeof betterAuthPlugins

export const betterAuthOptions = {
  appName: 'payload-better-auth',
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  trustedOrigins: [process.env.NEXT_PUBLIC_BETTER_AUTH_URL],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // autoSignIn: true,
    async sendResetPassword({ user, url }) {
      console.log('Send reset password for user: ', user.id, 'at url', url)
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      console.log('Send verification email for user: ', url)
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
} satisfies BetterAuthOptions

export type ConstructedBetterAuthOptions = typeof betterAuthOptions

export const betterAuthPluginOptions = {
  disabled: false,
  debug: {
    logTables: false,
    enableDebugLogs: false
  },
  // admin: {
  //   loginMethods: ['passkey']
  // },
  disableDefaultPayloadAuth: true,
  hidePluginCollections: true,
  users: {
    slug: 'users', // not required, this is the default anyways
    hidden: false,
    adminRoles: ['admin'],
    defaultRole: 'user',
    defaultAdminRole: 'admin',
    roles: ['user', 'admin', 'publisher'] as const,
    allowedFields: ['name']
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
  adminInvitations: {
    sendInviteEmail: async ({ payload, email, url }) => {
      console.log('Send admin invite: ', email, url)
      return {
        success: true
      }
    }
  },
  betterAuthOptions: betterAuthOptions
} satisfies PayloadAuthOptions

export type ConstructedBetterAuthPluginOptions = typeof betterAuthPluginOptions
