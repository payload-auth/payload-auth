import type { CollectionConfig } from 'payload'
import type { ClerkPluginOptions } from '../../../types'
import { clerkUserFields } from './fields'
import { clerkWebhookEndpoint } from './endpoints/webhook/index'
import { syncClerkUsersEndpoint } from './endpoints/sync-from-clerk'
import { clerkAuthStrategy } from '../../auth-strategy'
import { getReadAccess, getCreateAccess, getUpdateAccess, getDeleteAccess } from './access'

export interface WithClerkUsersCollectionOptions {
  collection?: Partial<CollectionConfig>
  options: ClerkPluginOptions
  apiBasePath?: string
  adminBasePath?: string
}

export function withClerkUsersCollection({
  collection = { slug: 'users' },
  options,
  apiBasePath = '/api',
  adminBasePath = '/admin',
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
      components: {
        Description: {
          path: 'payload-auth/clerk/admin/ui#SyncClerkUsersButton',
          clientProps: {
            userCollectionSlug: userSlug,
            apiBasePath,
            adminBasePath,
          }
        },
      }
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
      read: getReadAccess({ adminRoles }),
      create: getCreateAccess({ adminRoles }),
      update: getUpdateAccess({ adminRoles }),
      delete: getDeleteAccess({ adminRoles }),
    },
    endpoints: [
      ...(collection.endpoints || []),
      clerkWebhookEndpoint({ userSlug, options }),
      syncClerkUsersEndpoint({ userCollectionSlug: userSlug }),
    ]
  }

  if (options.users?.collectionOverrides) {
    clerkUserCollection = options.users.collectionOverrides({ 
      collection: clerkUserCollection 
    })
  }

  return clerkUserCollection
} 