import type { CollectionConfig } from 'payload'

const Invitation: CollectionConfig = {
  slug: 'invitation',
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organization',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
    },
    {
      name: 'status',
      type: 'text',
      required: true,
      defaultValue: 'pending',
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
    },
    {
      name: 'inviter',
      type: 'relationship',
      relationTo: 'user',
      required: true,
    },
  ],
  timestamps: true,
} as const

export default Invitation
