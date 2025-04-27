import type { BetterAuthPluginOptions } from '../../types'
import { baModelKey } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { FieldAttribute } from 'better-auth/db'
import type { Field, CollectionConfig } from 'payload'
import { FieldRule } from './utils/model-field-transformations'

export function buildOauthAccessTokensCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const oauthAccessTokenSlug = getDeafultCollectionSlug({ modelKey: baModelKey.oauthAccessToken, pluginOptions })

  const fieldOverrides: Record<string, (field: FieldAttribute) => Partial<Field>> = {
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
    client: () => ({
      admin: { readOnly: true, description: 'OAuth application associated with the access token' }
    }),
    user: () => ({
      admin: { readOnly: true, description: 'User associated with the access token' }
    }),
    scopes: () => ({
      admin: { description: 'Comma-separated list of scopes granted' }
    })
  }

  const oauthAccessTokenFieldRules: FieldRule[] = [
    {
      model: baModelKey.oauthAccessToken,
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
    model: baModelKey.oauthAccessToken,
    betterAuthOptions: pluginOptions.betterAuthOptions ?? {},
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

  return oauthAccessTokenCollection
}
