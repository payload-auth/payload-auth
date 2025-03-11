import type { CollectionConfig } from 'payload'

const Organization: CollectionConfig = {
  slug: 'organization',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
    },
    {
      name: 'logo',
      type: 'text',
    },
    {
      name: 'metadata',
      type: 'text',
    },
  ],
  timestamps: true,
} as const

export default Organization
