import type { CollectionConfig } from 'payload'

import betterAuthStrategy from '../better-auth-strategy.js'

const User: CollectionConfig = {
  slug: 'user',
  admin: {
    defaultColumns: ['email'],
    useAsTitle: 'email',
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [betterAuthStrategy()],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'emailVerified',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
    {
      name: 'image',
      type: 'text',
    },
    {
      name: 'twoFactorEnabled',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
    {
      name: 'banned',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'banReason',
      type: 'text',
    },
    {
      name: 'banExpires',
      type: 'number',
    },
  ],
  timestamps: true,
} as const

export default User
