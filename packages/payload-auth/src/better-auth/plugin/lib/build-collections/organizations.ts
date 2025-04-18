import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { betterAuthPluginSlugs } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'

export function buildOrganizationsCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const organizationSlug = betterAuthPluginSlugs.organizations

  const organizationCollection: CollectionConfig = {
    slug: organizationSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'name',
      description: 'Organizations are groups of users that share access to certain resources.',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        label: 'Name',
        admin: {
          description: 'The name of the organization.'
        }
      },
      {
        name: 'slug',
        type: 'text',
        unique: true,
        index: true,
        label: 'Slug',
        admin: {
          description: 'The slug of the organization.'
        }
      },
      {
        name: 'logo',
        type: 'text',
        label: 'Logo',
        admin: {
          description: 'The logo of the organization.'
        }
      },
      {
        name: 'metadata',
        type: 'json',
        label: 'Metadata',
        admin: {
          description: 'Additional metadata for the organization.'
        }
      },
      ...getTimestampFields()
    ]
  }

  return organizationCollection
}
