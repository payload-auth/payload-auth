import type { CollectionConfig } from 'payload'

import betterAuthStrategy from '../better-auth-strategy.js'

const Users: CollectionConfig = {
  slug: 'users',
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
      defaultValue: false,
    },
    {
      name: 'image',
      type: 'text',
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

export default Users
