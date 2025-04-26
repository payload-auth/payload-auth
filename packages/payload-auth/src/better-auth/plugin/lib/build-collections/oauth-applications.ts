import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { baPluginSlugs, baseSlugs, baModelKey, baModelFieldKeys } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'

export function buildOauthApplicationsCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const oauthApplicationSlug = baPluginSlugs.oauthApplications
  const userSlug = pluginOptions.users?.slug ?? baseSlugs.users

  let oauthApplicationCollection: CollectionConfig = {
    slug: oauthApplicationSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'name',
      description: 'OAuth applications are custom OAuth clients',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    custom: {
      betterAuthModelKey: baModelKey.oauthApplication
    },
    fields: [
      {
        name: 'clientId',
        type: 'text',
        unique: true,
        index: true,
        required: true,
        label: 'Client ID',
        admin: {
          readOnly: true,
          description: 'Unique identifier for each OAuth client'
        },
        custom: {
          betterAuthFieldKey: 'clientId'
        }
      },
      {
        name: 'clientSecret',
        type: 'text',
        required: true,
        label: 'Client Secret',
        admin: {
          readOnly: true,
          description: 'Secret key for the OAuth client'
        },
        custom: {
          betterAuthFieldKey: 'clientSecret'
        }
      },
      {
        name: 'name',
        type: 'text',
        required: true,
        index: true,
        label: 'Name',
        admin: {
          description: 'Name of the OAuth application'
        },
        custom: {
          betterAuthFieldKey: 'name'
        }
      },
      {
        name: 'redirectURLs',
        type: 'text',
        required: true,
        label: 'Redirect URLs',
        admin: {
          description: 'Comma-separated list of redirect URLs'
        },
        custom: {
          betterAuthFieldKey: 'redirectURLs'
        }
      },
      {
        name: 'metadata',
        type: 'json',
        admin: {
          readOnly: true,
          description: 'Additional metadata for the OAuth application'
        },
        custom: {
          betterAuthFieldKey: 'metadata'
        }
      },
      {
        name: 'type',
        type: 'text',
        required: true,
        label: 'Type',
        admin: {
          readOnly: true,
          description: 'Type of OAuth client (e.g., web, mobile)'
        },
        custom: {
          betterAuthFieldKey: 'type'
        }
      },
      {
        name: 'disabled',
        type: 'checkbox',
        defaultValue: false,
        required: true,
        label: 'Disabled',
        admin: {
          description: 'Indicates if the client is disabled'
        },
        custom: {
          betterAuthFieldKey: 'disabled'
        }
      },
      {
        name: 'icon',
        type: 'text',
        label: 'Icon',
        admin: {
          description: 'Icon of the OAuth application'
        },
        custom: {
          betterAuthFieldKey: 'icon'
        }
      },
      {
        name: 'user',
        type: 'relationship',
        relationTo: userSlug,
        required: false,
        label: 'User',
        admin: {
          readOnly: true,
          description: 'ID of the user who owns the client. (optional)'
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.oauthApplication.userId
        }
      },
      ...getTimestampFields()
    ]
  }

  if (pluginOptions.pluginCollectionOverrides?.oauthApplications) {
    oauthApplicationCollection = pluginOptions.pluginCollectionOverrides.oauthApplications({
      collection: oauthApplicationCollection
    })
  }

  return oauthApplicationCollection
}
