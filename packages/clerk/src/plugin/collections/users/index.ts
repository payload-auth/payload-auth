import type { CollectionConfig } from 'payload'
import type { ClerkPluginOptions } from '../../../types'
import { clerkUserFields } from './fields'
import { clerkWebhookEndpoint } from './endpoints/webhook'
import { clerkAuthStrategy } from '../../auth-strategy'

export interface WithClerkUsersCollectionOptions {
  collection?: Partial<CollectionConfig>
  options: ClerkPluginOptions
}

export function withClerkUsersCollection({
  collection = { slug: 'users' },
  options,
}: WithClerkUsersCollectionOptions): CollectionConfig {
  const userSlug = options.users?.slug ?? 'users'
  const adminRoles = options.users?.adminRoles ?? ['admin']
  
  let clerkUserCollection: CollectionConfig = {
    ...collection,
    slug: userSlug,
    admin: {
      useAsTitle: 'email',
      defaultColumns: ['email', 'clerkId', 'firstName', 'lastName'],
      hidden: options.users?.hidden ?? false,
      ...(collection.admin || {}),
    },
    fields: [
      ...(collection.fields || []),
      ...clerkUserFields,
    ],
    auth: {
      ...(typeof collection?.auth === 'object' ? collection.auth : {}),
      strategies: [
        clerkAuthStrategy(userSlug),
      ],
    },
    access: {
      read: ({ req }) => {
        if (req.user && adminRoles.includes(req.user.role as string)) {
          return true
        }
        
        return {
          id: {
            equals: req.user?.id,
          },
        }
      },
      create: ({ req }) => {
        return Boolean(req.user && adminRoles.includes(req.user.role as string))
      },
      update: ({ req }) => {
        if (req.user && adminRoles.includes(req.user.role as string)) {
          return true
        }
        
        return {
          id: {
            equals: req.user?.id,
          },
        }
      },
      delete: ({ req }) => {
        return Boolean(req.user && adminRoles.includes(req.user.role as string))
      },
    },
    endpoints: [
      ...(collection.endpoints || []),
      clerkWebhookEndpoint({ userSlug, options }),
    ]
  }

  if (options.users?.collectionOverrides) {
    clerkUserCollection = options.users.collectionOverrides({ 
      collection: clerkUserCollection 
    })
  }

  return clerkUserCollection
} 