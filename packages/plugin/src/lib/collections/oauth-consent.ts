import type { CollectionConfig } from 'payload'

const OauthConsent: CollectionConfig = {
  slug: 'oauthConsent',
  admin: {
    useAsTitle: 'clientId',
  },
  fields: [
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
    {
      name: 'consentGiven',
      type: 'checkbox',
    },
  ],
  timestamps: true,
} as const

export default OauthConsent
