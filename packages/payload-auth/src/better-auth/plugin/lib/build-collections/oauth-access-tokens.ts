import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { baPluginSlugs, baseSlugs, baModelKey, baModelFieldKeys } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'

export function buildOauthAccessTokensCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const oauthAccessTokenSlug = baPluginSlugs.oauthAccessTokens
  const oauthApplicationSlug = baPluginSlugs.oauthApplications
  const userSlug = pluginOptions.users?.slug ?? baseSlugs.users

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
    fields: [
      {
        name: 'accessToken',
        type: 'text',
        required: true,
        index: true,
        label: 'Access Token',
        admin: {
          readOnly: true,
          description: 'Access token issued to the client'
        },
        custom: {
          betterAuthFieldKey: 'accessToken'
        }
      },
      {
        name: 'refreshToken',
        type: 'text',
        required: true,
        label: 'Refresh Token',
        admin: {
          readOnly: true,
          description: 'Refresh token issued to the client'
        },
        custom: {
          betterAuthFieldKey: 'refreshToken'
        }
      },
      {
        name: 'accessTokenExpiresAt',
        type: 'date',
        required: true,
        label: 'Access Token Expires At',
        admin: {
          readOnly: true,
          description: 'Expiration date of the access token'
        },
        custom: {
          betterAuthFieldKey: 'accessTokenExpiresAt'
        }
      },
      {
        name: 'refreshTokenExpiresAt',
        type: 'date',
        required: true,
        label: 'Refresh Token Expires At',
        admin: {
          readOnly: true,
          description: 'Expiration date of the refresh token'
        },
        custom: {
          betterAuthFieldKey: 'refreshTokenExpiresAt'
        }
      },
      {
        name: 'client',
        type: 'relationship',
        relationTo: oauthApplicationSlug,
        required: true,
        label: 'Client',
        admin: {
          readOnly: true,
          description: 'OAuth application associated with the access token'
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.oauthAccessToken.clientId
        }
      },
      {
        name: 'user',
        type: 'relationship',
        relationTo: userSlug,
        required: true,
        label: 'User',
        admin: {
          readOnly: true,
          description: 'User associated with the access token'
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.oauthAccessToken.userId
        }
      },
      {
        name: 'scopes',
        type: 'text',
        required: true,
        label: 'Scopes',
        admin: {
          description: 'Comma-separated list of scopes granted'
        },
        custom: {
          betterAuthFieldKey: 'scopes'
        }
      },
      ...getTimestampFields()
    ]
  }

  if (pluginOptions.pluginCollectionOverrides?.oauthAccessTokens) {
    oauthAccessTokenCollection = pluginOptions.pluginCollectionOverrides.oauthAccessTokens({
      collection: oauthAccessTokenCollection
    })
  }

  return oauthAccessTokenCollection
}
