import { CollectionConfig } from 'payload'
import { baModelKey, baModelKeyToSlug, baseSlugs } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import { FieldRule } from './utils/model-field-transformations'
import type { BuildCollectionPropsWithIncoming, FieldOverrides } from '@/better-auth/plugin/types'
import { Session } from '@/better-auth/generated-types'

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

  // if (betterAuthPlugins) {
  //   betterAuthPlugins.forEach((plugin) => {
  //     switch (plugin.id) {
  //       case 'admin':
  //         sessionCollection.fields.push({
  //           name: 'impersonatedBy',
  //           type: 'relationship',
  //           relationTo: pluginOptions.users?.slug ?? 'users',
  //           required: false,
  //           saveToJWT: true,
  //           admin: {
  //             readOnly: true,
  //             description: 'The admin who is impersonating this session'
  //           },
  //           custom: {
  //             betterAuthFieldKey: 'impersonatedBy'
  //           }
  //         })
  //         break
  //       case 'organization':
  //         sessionCollection.fields.push({
  //           name: 'activeOrganization',
  //           type: 'relationship',
  //           saveToJWT: true,
  //           relationTo: getDeafultCollectionSlug({ modelKey: baModelKey.organization, pluginOptions }),
  //           admin: {
  //             readOnly: true,
  //             description: 'The currently active organization for the session'
  //           },
  //           custom: {
  //             betterAuthFieldKey: 'activeOrganizationId'
  //           }
  //         })
  //         break
  //       default:
  //         break
  //     }
  //   })
  // }

  if (typeof pluginOptions.sessions?.collectionOverrides === 'function') {
    sessionCollection = pluginOptions.sessions.collectionOverrides({
      collection: sessionCollection
    })
  }

  // map through and check that the custom properties align with the required schema model/fields keys
  // ensureSureCustomPropery(sessionCollection)
  // WE KNOW THAT ALL CUSTOM PROPERTIES AND PRESENT
  /// userId -> field.name = userRelation, relationTo = customers
  // santizeBAOPTIONS -> collection -> simple modelName/Collection fieldKeys/fieldNames

  return sessionCollection
}
