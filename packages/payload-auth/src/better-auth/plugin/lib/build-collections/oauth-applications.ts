import type { BetterAuthPluginOptions } from '../../types'
import { baModelKey } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { FieldAttribute } from 'better-auth/db'
import type { CollectionConfig } from 'payload'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'
import { FieldRule } from './utils/model-field-transformations'

export function buildOauthApplicationsCollection({ pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const oauthApplicationSlug = getDeafultCollectionSlug({ modelKey: baModelKey.oauthApplication, pluginOptions })

  const fieldOverrides: FieldOverrides = {
    clientId: () => ({
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Unique identifier for each OAuth client' }
    }),
    clientSecret: () => ({
      admin: { readOnly: true, description: 'Secret key for the OAuth client' }
    }),
    name: () => ({
      index: true,
      admin: { description: 'Name of the OAuth application' }
    }),
    redirectURLs: () => ({
      admin: { description: 'Comma-separated list of redirect URLs' }
    }),
    metadata: () => ({
      admin: { readOnly: true, description: 'Additional metadata for the OAuth application' }
    }),
    type: () => ({
      admin: { readOnly: true, description: 'Type of OAuth client (e.g., web, mobile)' }
    }),
    disabled: () => ({
      defaultValue: false,
      admin: { description: 'Indicates if the client is disabled' }
    }),
    icon: () => ({
      admin: { description: 'Icon of the OAuth application' }
    }),
    user: () => ({
      admin: { readOnly: true, description: 'ID of the user who owns the client. (optional)' }
    })
  }

  const oauthApplicationFieldRules: FieldRule[] = [
    {
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
    schema,
    fieldRules: oauthApplicationFieldRules,
    additionalProperties: fieldOverrides
  })

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
    fields: [...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.oauthApplications === 'function') {
    oauthApplicationCollection = pluginOptions.pluginCollectionOverrides.oauthApplications({
      collection: oauthApplicationCollection
    })
  }

  return oauthApplicationCollection
}
