import type { CollectionConfig } from 'payload'

export const usersCollection: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    { name: 'name', type: 'text' },
    { name: 'packageField', type: 'text', admin: { components: { afterInput: [{ path: 'payload-auth/clerk/admin/ui#PackageTestField' }] } } },
    { name: 'localField', type: 'text', admin: { components: { afterInput: [{ path: '@/payload/components/local-field#LocalField' }] } } }
  ]
}
