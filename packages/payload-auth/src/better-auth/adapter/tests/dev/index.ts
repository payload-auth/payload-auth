import { getPayload as getPayloadBase } from 'payload'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { BetterAuthOptions, betterAuthPlugin, BetterAuthPluginOptions, getPayloadAuth } from '../../../plugin'

export const betterAuthOptions: BetterAuthOptions = {
  appName: 'payload-better-auth',
  baseURL: 'http://localhost:3000',
  trustedOrigins: ['http://localhost:3000'],
  emailAndPassword: {
    enabled: true
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
  hidePluginCollections: true,
  users: {
    hidden: false,
    adminRoles: ['admin'],
    allowedFields: ['name']
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
}

export const payloadConfig = buildConfig({
  admin: {
    user: 'users'
  },
  secret: 'super-secret-payload-key',
  db: postgresAdapter({
    pool: {
      connectionString: 'postgres://forrestdevs:@localhost:5432/pba-tests'
    },
    push: false,
    transactionOptions: false
  }),
  plugins: [betterAuthPlugin(betterAuthPluginOptions)]
})

export async function getPayload() {
  return await getPayloadAuth(payloadConfig)
}

export default payloadConfig
