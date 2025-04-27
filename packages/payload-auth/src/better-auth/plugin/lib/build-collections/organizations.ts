import type { BetterAuthPluginOptions } from '../../types'
import { baModelKey } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { FieldAttribute } from 'better-auth/db'
import type { Field, CollectionConfig } from 'payload'
import { FieldRule } from './utils/model-field-transformations'

export function buildOrganizationsCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const organizationSlug = getDeafultCollectionSlug({ modelKey: baModelKey.organization, pluginOptions })

  const fieldOverrides: Record<string, (field: FieldAttribute) => Partial<Field>> = {
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

  const organizationFieldRules: FieldRule[] = [
    {
      model: baModelKey.organization,
      condition: (field) => field.type === 'date',
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
    model: baModelKey.organization,
    betterAuthOptions: pluginOptions.betterAuthOptions ?? {},
    fieldRules: organizationFieldRules,
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
