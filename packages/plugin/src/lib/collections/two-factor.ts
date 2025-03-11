import type { CollectionConfig } from 'payload'

const TwoFactor: CollectionConfig = {
  slug: 'twoFactor',
  admin: {
    useAsTitle: 'secret',
  },
  fields: [
    {
      name: 'secret',
      type: 'text',
      required: true,
    },
    {
      name: 'backupCodes',
      type: 'text',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'user',
      required: true,
    },
  ],
  timestamps: true,
} as const

export default TwoFactor
