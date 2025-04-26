import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '@/better-auth/plugin/types'
import { baseSlugs, baPluginSlugs, baModelKey, baModelFieldKeys } from '@/better-auth/plugin/constants'
import { getTimestampFields } from '@/better-auth/plugin/lib/build-collections/utils/get-timestamp-fields'
import { getAdminAccess } from '@/better-auth/plugin/helpers/get-admin-access'

export function buildSessionsCollection({
  incomingCollections,
  pluginOptions
}: {
  incomingCollections: CollectionConfig[]
  pluginOptions: BetterAuthPluginOptions
}): CollectionConfig {
  const sessionSlug = pluginOptions.sessions?.slug ?? baseSlugs.sessions
  const userSlug = pluginOptions.users?.slug ?? baseSlugs.users
  const betterAuthPlugins = pluginOptions.betterAuthOptions?.plugins ?? []

  const existingSessionCollection = incomingCollections.find((collection) => collection.slug === sessionSlug) as
    | CollectionConfig
    | undefined

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
    fields: [
      ...(existingSessionCollection?.fields ?? []),
      {
        name: 'user',
        type: 'relationship',
        relationTo: userSlug,
        required: true,
        saveToJWT: true,
        index: true,
        admin: {
          readOnly: true,
          description: 'The user that the session belongs to'
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.session.userId
        }
      },
      {
        name: 'token',
        type: 'text',
        required: true,
        unique: true,
        index: true,
        saveToJWT: true,
        label: 'Token',
        admin: {
          description: 'The unique session token',
          readOnly: true
        },
        custom: {
          betterAuthFieldKey: 'token'
        }
      },
      {
        name: 'expiresAt',
        type: 'date',
        required: true,
        label: 'Expires At',
        saveToJWT: true,
        admin: {
          description: 'The date and time when the session will expire',
          readOnly: true
        },
        custom: {
          betterAuthFieldKey: 'expiresAt'
        }
      },
      {
        name: 'ipAddress',
        type: 'text',
        label: 'IP Address',
        saveToJWT: true,
        admin: {
          description: 'The IP address of the device',
          readOnly: true
        },
        custom: {
          betterAuthFieldKey: 'ipAddress'
        }
      },
      {
        name: 'userAgent',
        type: 'text',
        label: 'User Agent',
        saveToJWT: true,
        admin: {
          description: 'The user agent information of the device',
          readOnly: true
        },
        custom: {
          betterAuthFieldKey: 'userAgent'
        }
      },
      ...getTimestampFields()
    ],
    ...existingSessionCollection
  }
  if (betterAuthPlugins) {
    betterAuthPlugins.forEach((plugin) => {
      switch (plugin.id) {
        case 'admin':
          sessionCollection.fields.push({
            name: 'impersonatedBy',
            type: 'relationship',
            relationTo: userSlug,
            required: false,
            saveToJWT: true,
            label: 'Impersonated By',
            admin: {
              readOnly: true,
              description: 'The admin who is impersonating this session'
            },
            custom: {
              betterAuthFieldKey: baModelFieldKeys.session.impersonatedBy
            }
          })
          break
        case 'organization':
          sessionCollection.fields.push({
            name: 'activeOrganization',
            type: 'relationship',
            saveToJWT: true,
            relationTo: baPluginSlugs.organizations,
            label: 'Active Organization',
            admin: {
              readOnly: true,
              description: 'The currently active organization for the session'
            },
            custom: {
              betterAuthFieldKey: baModelFieldKeys.session.activeOrganizationId
            }
          })
          break
        default:
          break
      }
    })
  }

  if (pluginOptions.sessions?.collectionOverrides) {
    sessionCollection = pluginOptions.sessions.collectionOverrides({
      collection: sessionCollection
    })
  }

  return sessionCollection
}
