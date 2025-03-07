import type { BasePayload } from 'payload'

import { betterAuth as betterAuthBase } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { admin, openAPI } from 'better-auth/plugins'
import { payloadAdapter } from '@payload-better-auth/adapter'

export const betterAuth = (payload: BasePayload) => {
  return betterAuthBase({
    appName: 'PayloadBetterAuth',
    database: payloadAdapter(payload),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    plugins: [
      admin({
        schema: {
          session: {
            fields: {
              impersonatedBy: 'user',
            },
          },
        },
      }),
      openAPI(),
      nextCookies(),
    ],
    user: {
      modelName: 'users',
      additionalFields: {
        role: {
          type: 'string',
          required: true,
        },
      },
    },
    session: {
      modelName: 'sessions',
      fields: {
        userId: 'user',
      },
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // Cache duration in seconds
      },
    },
    account: {
      modelName: 'accounts',
      fields: {
        userId: 'user',
      },
    },
    verification: {
      modelName: 'verification-tokens',
    },
  })
}
