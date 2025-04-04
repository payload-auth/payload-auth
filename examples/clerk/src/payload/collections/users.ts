import type { CollectionConfig } from 'payload'

export const usersCollection: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [{ name: 'name', type: 'text' }]
}
