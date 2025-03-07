import type { CollectionConfig } from 'payload'

const VerificationTokens: CollectionConfig = {
  slug: 'verification-tokens',
  fields: [
    {
      name: 'identifier',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'value',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
} as const

export default VerificationTokens
