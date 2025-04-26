import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { baModelKey } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { FieldAttribute } from 'better-auth/db'
import type { Field } from 'payload'

export function buildSessionsCollection({
  incomingCollections,
  pluginOptions
}: {
  incomingCollections: CollectionConfig[]
  pluginOptions: BetterAuthPluginOptions
}): CollectionConfig {
  const sessionSlug = getDeafultCollectionSlug({ modelKey: baModelKey.session, pluginOptions })
  const betterAuthPlugins = pluginOptions.betterAuthOptions?.plugins ?? []

  const existingSessionCollection = incomingCollections.find((collection) => collection.slug === sessionSlug) as
    | CollectionConfig
    | undefined

  const fieldOverrides: Record<string, (field: FieldAttribute) => Partial<Field>> = {
    user: () => ({
      saveToJWT: true,
      index: true,
      admin: { readOnly: true, description: 'The user that the session belongs to' }
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
    })
  }

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    model: baModelKey.session,
    betterAuthOptions: pluginOptions.betterAuthOptions ?? {},
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
    fields: [...(existingSessionCollection?.fields ?? []), ...collectionFields, ...getTimestampFields()],
    ...existingSessionCollection
  }

  if (betterAuthPlugins) {
    betterAuthPlugins.forEach((plugin) => {
      switch (plugin.id) {
        case 'admin':
          sessionCollection.fields.push({
            name: 'impersonatedBy',
            type: 'relationship',
            relationTo: pluginOptions.users?.slug ?? 'users',
            required: false,
            saveToJWT: true,
            admin: {
              readOnly: true,
              description: 'The admin who is impersonating this session'
            },
            custom: {
              betterAuthFieldKey: 'impersonatedBy'
            }
          })
          break
        case 'organization':
          sessionCollection.fields.push({
            name: 'activeOrganization',
            type: 'relationship',
            saveToJWT: true,
            relationTo: getDeafultCollectionSlug({ modelKey: baModelKey.organization, pluginOptions }),
            admin: {
              readOnly: true,
              description: 'The currently active organization for the session'
            },
            custom: {
              betterAuthFieldKey: 'activeOrganizationId'
            }
          })
          break
        default:
          break
      }
    })
  }

  if (typeof pluginOptions.sessions?.collectionOverrides === 'function') {
    sessionCollection = pluginOptions.sessions.collectionOverrides({
      collection: sessionCollection
    })
  }

  return sessionCollection
}
