import type { BetterAuthOptions, BetterAuthPluginOptions } from 'payload-auth/better-auth'
import { emailHarmony, phoneHarmony } from 'better-auth-harmony'
import { nextCookies } from 'better-auth/next-js'
import {
  admin,
  anonymous,
  apiKey,
  emailOTP,
  jwt,
  magicLink,
  multiSession,
  oidcProvider,
  openAPI,
  organization,
  phoneNumber,
  twoFactor,
  username
} from 'better-auth/plugins'
import { passkey } from 'better-auth/plugins/passkey'
import { getAuthTables } from 'better-auth/db'
import { stripe } from '@better-auth/stripe'
import { sso } from 'better-auth/plugins/sso'
import { baModelFieldKeys, baModelFieldKeysToFieldNames, baModelKeyToSlug } from './constants'
import { getDefaultCollectionSchemaMap } from './helpers/get-collection-schema-map'

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
    rpID: 'payload-better-auth',
    rpName: 'payload-better-auth-demo',
    origin: 'http://localhost:3000'
  }),
  admin(),
  apiKey(),
  jwt(),
  oidcProvider({
    loginPage: ''
  }),
  sso(),
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
  stripe({
    stripeClient: '',
    stripeWebhookSecret: ''
  }),
  nextCookies()
]

export type BetterAuthPlugins = typeof betterAuthPlugins

export const betterAuthOptions: BetterAuthOptions = {
  appName: 'payload-better-auth',
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
}

function test() {
  const collectionSchemaMap = getDefaultCollectionSchemaMap({ betterAuthOptions })
  console.log(collectionSchemaMap)
}

// test()

// baModelFieldKeys[key as keyof typeof baModelFieldKeys][
//   field as keyof (typeof baModelFieldKeys)[keyof typeof baModelFieldKeys]
// ] || null
