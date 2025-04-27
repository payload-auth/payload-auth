import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { CollectionConfig } from 'payload'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'

export function buildOrganizationsCollection({ pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const organizationSlug = getDeafultCollectionSlug({ modelKey: baModelKey.organization, pluginOptions })

  const fieldOverrides: FieldOverrides = {
    name: () => ({
      admin: { description: 'The name of the organization.' }
    }),
    slug: () => ({
      unique: true,
      index: true,
      admin: { description: 'The slug of the organization.' }
    }),
    logo: () => ({
      admin: { description: 'The logo of the organization.' }
    }),
    metadata: () => ({
      admin: { description: 'Additional metadata for the organization.' }
    })
  }

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    schema,
    additionalProperties: fieldOverrides
  })

  let organizationCollection: CollectionConfig = {
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
    custom: {
      betterAuthModelKey: baModelKey.organization
    },
    fields: [...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.organizations === 'function') {
    organizationCollection = pluginOptions.pluginCollectionOverrides.organizations({
      collection: organizationCollection
    })
  }

  return organizationCollection
}
