import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'
import { assertAllSchemaFields, getSchemaCollectionSlug, getSchemaFieldName } from './utils/collection-schema'

import type { CollectionConfig } from 'payload'
import type { OauthAccessToken } from '@/better-auth/generated-types'
import type { BuildCollectionProps, FieldOverrides, FieldRule } from '@/better-auth/plugin/types'

export function buildOauthAccessTokensCollection({
  incomingCollections,
  pluginOptions,
  resolvedSchemas
}: BuildCollectionProps): CollectionConfig {
  const oauthAccessTokenSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.oauthAccessToken)
  const oauthAccessTokenSchema = resolvedSchemas[baModelKey.oauthAccessToken]

  const existingOauthAccessTokenCollection = incomingCollections.find((collection) => collection.slug === oauthAccessTokenSlug) as
    | CollectionConfig
    | undefined

  const fieldOverrides: FieldOverrides<keyof OauthAccessToken> = {
    accessToken: () => ({
      index: true,
      admin: { readOnly: true, description: 'Access token issued to the client' }
    }),
    refreshToken: () => ({
      admin: { readOnly: true, description: 'Refresh token issued to the client' }
    }),
    accessTokenExpiresAt: () => ({
      admin: { readOnly: true, description: 'Expiration date of the access token' }
    }),
    refreshTokenExpiresAt: () => ({
      admin: { readOnly: true, description: 'Expiration date of the refresh token' }
    }),
    clientId: () => ({
      admin: { readOnly: true, description: 'OAuth application associated with the access token' }
    }),
    userId: () => ({
      admin: { readOnly: true, description: 'User associated with the access token' }
    }),
    scopes: () => ({
      admin: { description: 'Comma-separated list of scopes granted' }
    })
  }

  const oauthAccessTokenFieldRules: FieldRule[] = [
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
    schema: oauthAccessTokenSchema,
    fieldRules: oauthAccessTokenFieldRules,
    additionalProperties: fieldOverrides
  })

  let oauthAccessTokenCollection: CollectionConfig = {
    ...existingOauthAccessTokenCollection,
    slug: oauthAccessTokenSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.oauthAccessToken, 'accessToken'),
      description: 'OAuth access tokens for custom OAuth clients',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingOauthAccessTokenCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingOauthAccessTokenCollection?.access ?? {})
    },
    custom: {
      ...(existingOauthAccessTokenCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.oauthAccessToken
    },
    fields: [...(existingOauthAccessTokenCollection?.fields ?? []), ...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.oauthAccessTokens === 'function') {
    oauthAccessTokenCollection = pluginOptions.pluginCollectionOverrides.oauthAccessTokens({
      collection: oauthAccessTokenCollection
    })
  }

  assertAllSchemaFields(oauthAccessTokenCollection, oauthAccessTokenSchema)

  return oauthAccessTokenCollection
}
