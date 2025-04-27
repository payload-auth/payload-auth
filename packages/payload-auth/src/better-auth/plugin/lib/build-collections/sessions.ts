import { baModelKey, baModelKeyToSlug, baseSlugs } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import { assertAllSchemaFields } from './utils/assert-schema-fields'

import type { CollectionConfig } from 'payload'
import type { Session } from '@/better-auth/generated-types'
import type { FieldRule } from './utils/model-field-transformations'
import type { BuildCollectionPropsWithIncoming, FieldOverrides } from '@/better-auth/plugin/types'

export function buildSessionsCollection({
  incomingCollections,
  pluginOptions,
  schema
}: BuildCollectionPropsWithIncoming): CollectionConfig {
  const sessionSlug = getDeafultCollectionSlug({ modelKey: baModelKey.session, pluginOptions })

  const existingSessionCollection = incomingCollections.find((collection) => collection.slug === sessionSlug) as
    | CollectionConfig
    | undefined

  const fieldOverrides: FieldOverrides<keyof Session> = {
    userId: () => ({
      name: baModelKeyToSlug.user,
      saveToJWT: true,
      admin: { readOnly: true, description: 'The user that the session belongs to' },
      relationTo: getDeafultCollectionSlug({ modelKey: baModelKey.user, pluginOptions })
    }),
    token: () => ({
      index: true,
      saveToJWT: true,
      admin: { readOnly: true, description: 'The unique session token' }
    }),
    expiresAt: () => ({
      saveToJWT: true,
      admin: { readOnly: true, description: 'The date and time when the session will expire' }
    }),
    ipAddress: () => ({
      saveToJWT: true,
      admin: { readOnly: true, description: 'The IP address of the device' }
    }),
    userAgent: () => ({
      saveToJWT: true,
      admin: { readOnly: true, description: 'The user agent information of the device' }
    }),
    impersonatedBy: () => ({
      name: 'impersonatedBy',
      type: 'relationship',
      relationTo: pluginOptions.users?.slug ?? baseSlugs.users,
      required: false,
      saveToJWT: true,
      admin: {
        readOnly: true,
        description: 'The admin who is impersonating this session'
      }
    }),
    activeOrganizationId: () => ({
      name: 'activeOrganization',
      type: 'relationship',
      saveToJWT: true,
      relationTo: getDeafultCollectionSlug({ modelKey: baModelKey.organization, pluginOptions }),
      admin: {
        readOnly: true,
        description: 'The currently active organization for the session'
      }
    })
  }

  const sessionFieldRules: FieldRule[] = [
    {
      condition: (field) => field.fieldName === 'updatedAt' || field.fieldName === 'createdAt',
      transform: (field) => ({
        ...field,
        saveToJWT: false,
        admin: {
          disableBulkEdit: true,
          hidden: true
        },
        index: true,
        label: ({ t }: any) => t('general:updatedAt')
      })
    }
  ]

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    schema,
    fieldRules: sessionFieldRules,
    additionalProperties: fieldOverrides
  })

  let sessionCollection: CollectionConfig = {
    slug: sessionSlug,
    admin: {
      ...existingSessionCollection?.admin,
      hidden: pluginOptions.sessions?.hidden,
      description: 'Sessions are active sessions for users. They are used to authenticate users with a session token',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    custom: {
      betterAuthModelKey: baModelKey.session
    },
    fields: [...(existingSessionCollection?.fields ?? []), ...(collectionFields ?? [])],
    ...existingSessionCollection
  }

  if (typeof pluginOptions.sessions?.collectionOverrides === 'function') {
    sessionCollection = pluginOptions.sessions.collectionOverrides({
      collection: sessionCollection
    })
  }

  assertAllSchemaFields(sessionCollection, schema)

  return sessionCollection
}
