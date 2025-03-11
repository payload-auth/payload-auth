import type { CollectionConfig } from 'payload'

const Session: CollectionConfig = {
  slug: 'session',
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'user',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'token',
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
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'activeOrganizationId',
      type: 'text',
    },
    {
      name: 'impersonatedBy',
      type: 'relationship',
      relationTo: 'user',
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
} as const

export default Session
