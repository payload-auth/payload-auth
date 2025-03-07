import type { CollectionConfig } from 'payload'

const Accounts: CollectionConfig = {
  slug: 'accounts',
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'accountId',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'providerId',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'accessToken',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'refreshToken',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'accessTokenExpiresAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'refreshTokenExpiresAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'scope',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'idToken',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'password',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
} as const

export default Accounts
