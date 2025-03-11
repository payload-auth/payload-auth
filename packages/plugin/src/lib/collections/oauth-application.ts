import type { CollectionConfig } from 'payload'

const OauthApplication: CollectionConfig = {
  slug: 'oauthApplication',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'icon',
      type: 'text',
    },
    {
      name: 'metadata',
      type: 'text',
    },
    {
      name: 'clientId',
      type: 'text',
      unique: true,
    },
    {
      name: 'clientSecret',
      type: 'text',
    },
    {
      name: 'redirectURLs',
      type: 'text',
    },
    {
      name: 'type',
      type: 'text',
    },
    {
      name: 'disabled',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'userId',
      type: 'text',
    },
  ],
  timestamps: true,
} as const

export default OauthApplication
