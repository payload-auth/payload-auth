import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'
import { getSchemaCollectionSlug, getSchemaFieldName } from './utils/collection-schema'
import { assertAllSchemaFields } from './utils/collection-schema'

import type { CollectionConfig } from 'payload'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'
import type { Organization } from '@/better-auth/generated-types'

export function buildOrganizationsCollection({ incomingCollections, pluginOptions, resolvedSchemas }: BuildCollectionProps): CollectionConfig {
  const organizationSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.organization)
  const organizationSchema = resolvedSchemas[baModelKey.organization]

  const existingOrganizationCollection = incomingCollections.find((collection) => collection.slug === organizationSlug) as
    | CollectionConfig
    | undefined

  const fieldOverrides: FieldOverrides<keyof Organization> = {
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

  const collectionFields = getCollectionFields({
    schema: organizationSchema,
    additionalProperties: fieldOverrides
  })

  let organizationCollection: CollectionConfig = {
    ...existingOrganizationCollection,
    slug: organizationSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.organization, 'name'),
      description: 'Organizations are groups of users that share access to certain resources.',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingOrganizationCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingOrganizationCollection?.access ?? {})
    },
    custom: {
      ...(existingOrganizationCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.organization
    },
    fields: [...(existingOrganizationCollection?.fields ?? []), ...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.organizations === 'function') {
    organizationCollection = pluginOptions.pluginCollectionOverrides.organizations({
      collection: organizationCollection
    })
  }

  assertAllSchemaFields(organizationCollection, organizationSchema)

  return organizationCollection
}
