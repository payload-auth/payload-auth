import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { assertAllSchemaFields } from './utils/assert-schema-fields'

import type { CollectionConfig } from 'payload'
import type { OauthApplication } from '@/better-auth/generated-types'
import type { FieldRule } from './utils/model-field-transformations'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'

export function buildOauthApplicationsCollection({ incomingCollections, pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const oauthApplicationSlug = getDeafultCollectionSlug({ modelKey: baModelKey.oauthApplication, pluginOptions })

  const existingOauthApplicationCollection = incomingCollections.find((collection) => collection.slug === oauthApplicationSlug) as
    | CollectionConfig
    | undefined

  const fieldOverrides: FieldOverrides<keyof OauthApplication> = {
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
    ...existingOauthApplicationCollection,
    slug: oauthApplicationSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'name',
      description: 'OAuth applications are custom OAuth clients',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingOauthApplicationCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingOauthApplicationCollection?.access ?? {})
    },
    custom: {
      ...(existingOauthApplicationCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.oauthApplication
    },
    fields: [...(existingOauthApplicationCollection?.fields ?? []), ...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.oauthApplications === 'function') {
    oauthApplicationCollection = pluginOptions.pluginCollectionOverrides.oauthApplications({
      collection: oauthApplicationCollection
    })
  }

  assertAllSchemaFields(oauthApplicationCollection, schema)

  return oauthApplicationCollection
}
