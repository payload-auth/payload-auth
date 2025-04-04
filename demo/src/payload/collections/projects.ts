import { CollectionConfig } from 'payload'

export const projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'name'
  },
  fields: [
    {
      name: 'name',
      type: 'text'
    },
    {
      name: 'description',
      type: 'textarea'
    },
    {
      name: 'status',
      type: 'select',
      options: ['active', 'inactive']
    }
  ]
} as const

export default projects
