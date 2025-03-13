import type { CollectionConfig } from 'payload'

const Passkey: CollectionConfig = {
  slug: 'passkey',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'publicKey',
      type: 'text',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'user',
      required: true,
    },
    {
      name: 'credentialID',
      type: 'text',
      required: true,
    },
    {
      name: 'counter',
      type: 'number',
      required: true,
    },
    {
      name: 'deviceType',
      type: 'text',
      required: true,
    },
    {
      name: 'backedUp',
      type: 'checkbox',
      required: true,
    },
    {
      name: 'transports',
      type: 'text',
    },
  ],
  timestamps: true,
} as const

export default Passkey
