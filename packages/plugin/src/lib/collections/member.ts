import type { CollectionConfig } from 'payload'

const Member: CollectionConfig = {
  slug: 'member',
  admin: {
    useAsTitle: 'organization',
  },
  fields: [
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organization',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'user',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      defaultValue: 'member',
    },
  ],
  timestamps: true,
} as const

export default Member
