import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import { assertAllSchemaFields } from './utils/assert-schema-fields'

import type { CollectionConfig } from 'payload'
import type { FieldRule } from './utils/model-field-transformations'
import type { OauthAccessToken } from '@/better-auth/generated-types'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'

export function buildOauthAccessTokensCollection({ pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const oauthAccessTokenSlug = getDeafultCollectionSlug({ modelKey: baModelKey.oauthAccessToken, pluginOptions })

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

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    schema,
    fieldRules: oauthAccessTokenFieldRules,
    additionalProperties: fieldOverrides
  })

  let oauthAccessTokenCollection: CollectionConfig = {
    slug: oauthAccessTokenSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'accessToken',
      description: 'OAuth access tokens for custom OAuth clients',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    custom: {
      betterAuthModelKey: baModelKey.oauthAccessToken
    },
    fields: [...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.oauthAccessTokens === 'function') {
    oauthAccessTokenCollection = pluginOptions.pluginCollectionOverrides.oauthAccessTokens({
      collection: oauthAccessTokenCollection
    })
  }

  assertAllSchemaFields(oauthAccessTokenCollection, schema)

  return oauthAccessTokenCollection
}
