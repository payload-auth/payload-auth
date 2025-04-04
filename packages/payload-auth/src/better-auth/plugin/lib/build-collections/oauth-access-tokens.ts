import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { betterAuthPluginSlugs, baseCollectionSlugs } from '../config'
import { getTimestampFields } from './utils/get-timestamp-fields'

export function buildOauthAccessTokensCollection({
  pluginOptions,
}: {
  pluginOptions: BetterAuthPluginOptions
}) {
  const oauthAccessTokenSlug = betterAuthPluginSlugs.oauthAccessTokens
  const oauthApplicationSlug = betterAuthPluginSlugs.oauthApplications
  const userSlug = pluginOptions.users?.slug ?? baseCollectionSlugs.users

  const oauthAccessTokenCollection: CollectionConfig = {
    slug: oauthAccessTokenSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'accessToken',
      description: 'OAuth access tokens for custom OAuth clients',
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
          description: 'Access token issued to the client',
        },
      },
      {
        name: 'refreshToken',
        type: 'text',
        required: true,
        label: 'Refresh Token',
        admin: {
          readOnly: true,
          description: 'Refresh token issued to the client',
        },
      },
      {
        name: 'accessTokenExpiresAt',
        type: 'date',
        required: true,
        label: 'Access Token Expires At',
        admin: {
          readOnly: true,
          description: 'Expiration date of the access token',
        },
      },
      {
        name: 'refreshTokenExpiresAt',
        type: 'date',
        required: true,
        label: 'Refresh Token Expires At',
        admin: {
          readOnly: true,
          description: 'Expiration date of the refresh token',
        },
      },
      {
        name: 'client',
        type: 'relationship',
        relationTo: oauthApplicationSlug,
        required: true,
        label: 'Client',
        admin: {
          readOnly: true,
          description: 'OAuth application associated with the access token',
        },
      },
      {
        name: 'user',
        type: 'relationship',
        relationTo: userSlug,
        required: true,
        label: 'User',
        admin: {
          readOnly: true,
          description: 'User associated with the access token',
        },
      },
      {
        name: 'scopes',
        type: 'text',
        required: true,
        label: 'Scopes',
        admin: {
          description: 'Comma-separated list of scopes granted',
        },
      },
      ...getTimestampFields(),
    ],
  }

  return oauthAccessTokenCollection
}
