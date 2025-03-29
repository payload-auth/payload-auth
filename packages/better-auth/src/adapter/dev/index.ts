import { getPayload as getPayloadBase } from 'payload'

import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'

export const payloadConfig = buildConfig({
  admin: {
    user: 'user',
  },
  secret: 'super-secret-payload-key',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    push: false,
    transactionOptions: false,
  }),
  collections: [
    {
      slug: 'user',
      admin: {
        useAsTitle: 'name',
      },
      auth: {
        disableLocalStrategy: true,
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          unique: true,
        },
        {
          name: 'emailVerified',
          type: 'checkbox',
          required: true,
        },
        {
          name: 'image',
          type: 'text',
        },
      ],
      timestamps: true,
    },
    {
      slug: 'account',
      admin: {
        useAsTitle: 'accountId',
      },
      fields: [
        {
          name: 'accountId',
          type: 'number',
          required: true,
        },
        {
          name: 'providerId',
          type: 'text',
        },
        {
          name: 'user',
          type: 'relationship',
          required: true,
          relationTo: 'user',
        },
        {
          name: 'accessToken',
          type: 'text',
        },
        {
          name: 'refreshToken',
          type: 'text',
        },
        {
          name: 'idToken',
          type: 'text',
        },
        {
          name: 'accessTokenExpiresAt',
          type: 'date',
        },
        {
          name: 'refreshTokenExpiresAt',
          type: 'date',
        },
        {
          name: 'scope',
          type: 'text',
        },
        {
          name: 'password',
          type: 'text',
        },
      ],
      timestamps: true,
    },
    {
      slug: 'verification',
      admin: {
        useAsTitle: 'identifier',
      },
      fields: [
        {
          name: 'identifier',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
        {
          name: 'expiresAt',
          type: 'date',
          required: true,
        },
      ],
      timestamps: true,
    },
    {
      slug: 'session',
      admin: {
        useAsTitle: 'expiresAt',
      },
      fields: [
        {
          name: 'expiresAt',
          type: 'date',
          required: true,
        },
        {
          name: 'token',
          type: 'text',
          required: true,
          unique: true,
        },
        {
          name: 'ipAddress',
          type: 'text',
        },
        {
          name: 'userAgent',
          type: 'text',
        },
        {
          name: 'user',
          type: 'relationship',
          required: true,
          relationTo: 'user',
        },
      ],
      timestamps: true,
    },
  ],
})

export async function getPayload() {
  return await getPayloadBase({ config: payloadConfig })
}

export default payloadConfig
