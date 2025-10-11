import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'
import { assertAllSchemaFields, getSchemaCollectionSlug } from './utils/collection-schema'
import type { CollectionConfig } from 'payload'
import type { OauthApplication } from '@/better-auth/generated-types'
import type { BuildCollectionProps, FieldOverrides, FieldRule } from '@/better-auth/plugin/types'

export function buildOauthApplicationsCollection({
  incomingCollections,
  pluginOptions,
  resolvedSchemas
}: BuildCollectionProps): CollectionConfig {
  const oauthApplicationSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.oauthApplication)

  const oauthApplicationSchema = resolvedSchemas[baModelKey.oauthApplication]

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
    userId: () => ({
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

  const collectionFields = getCollectionFields({
    schema: oauthApplicationSchema,
    fieldRules: oauthApplicationFieldRules,
    additionalProperties: fieldOverrides
  })

  let oauthApplicationCollection: CollectionConfig = {
    ...existingOauthApplicationCollection,
    slug: oauthApplicationSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: oauthApplicationSchema?.fields?.name?.fieldName,
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

  assertAllSchemaFields(oauthApplicationCollection, oauthApplicationSchema)

  return oauthApplicationCollection
}
