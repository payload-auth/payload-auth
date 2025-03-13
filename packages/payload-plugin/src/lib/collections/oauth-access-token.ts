import type { CollectionConfig } from 'payload'

const OauthAccessToken: CollectionConfig = {
  slug: 'oauthAccessToken',
  admin: {
    useAsTitle: 'accessToken',
  },
  fields: [
    {
      name: 'accessToken',
      type: 'text',
      unique: true,
    },
    {
      name: 'refreshToken',
      type: 'text',
      unique: true,
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
      name: 'clientId',
      type: 'text',
    },
    {
      name: 'userId',
      type: 'text',
    },
    {
      name: 'scopes',
      type: 'text',
    },
  ],
  timestamps: true,
} as const

export default OauthAccessToken
