import type { CollectionConfig } from 'payload'

const VerificationToken: CollectionConfig = {
  slug: 'verification-token',
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

export default VerificationToken
