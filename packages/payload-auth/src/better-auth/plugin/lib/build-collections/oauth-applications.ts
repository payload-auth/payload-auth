import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { betterAuthPluginSlugs, baseCollectionSlugs } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'

export function buildOauthApplicationsCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }) {
  const oauthApplicationSlug = betterAuthPluginSlugs.oauthApplications
  const userSlug = pluginOptions.users?.slug ?? baseCollectionSlugs.users

  const oauthApplicationCollection: CollectionConfig = {
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
        }
      },
      {
        name: 'redirectURLs',
        type: 'text',
        required: true,
        label: 'Redirect URLs',
        admin: {
          description: 'Comma-separated list of redirect URLs'
        }
      },
      {
        name: 'metadata',
        type: 'json',
        admin: {
          readOnly: true,
          description: 'Additional metadata for the OAuth application'
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
        }
      },
      {
        name: 'icon',
        type: 'text',
        label: 'Icon',
        admin: {
          description: 'Icon of the OAuth application'
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
        }
      },
      ...getTimestampFields()
    ]
  }

  return oauthApplicationCollection
}
