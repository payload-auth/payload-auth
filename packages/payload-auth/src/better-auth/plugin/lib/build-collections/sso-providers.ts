import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { baseCollectionSlugs, betterAuthPluginSlugs } from '../config'
import { getTimestampFields } from './utils/get-timestamp-fields'

export function buildSsoProvidersCollection({
  pluginOptions,
}: {
  pluginOptions: BetterAuthPluginOptions
}) {
  const ssoProviderSlug = betterAuthPluginSlugs.ssoProviders
  const userSlug = pluginOptions.users?.slug ?? baseCollectionSlugs.users

  const ssoProviderCollection: CollectionConfig = {
    slug: ssoProviderSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'issuer',
      description: 'SSO providers are used to authenticate users with an external provider',
    },
    fields: [
      {
        name: 'issuer',
        type: 'text',
        required: true,
        index: true,
        label: 'Issuer',
        admin: {
          description: 'The issuer of the SSO provider',
        },
      },
      {
        name: 'domain',
        type: 'text',
        required: true,
        label: 'Domain',
        admin: {
          description: 'The domain of the SSO provider',
        },
      },
      {
        name: 'oidcConfig',
        type: 'text',
        required: true,
        label: 'OIDC Config',
        admin: {
          description: 'The OIDC config of the SSO provider',
        },
      },
      {
        name: 'user',
        type: 'relationship',
        relationTo: userSlug,
        required: true,
        label: 'User',
        admin: {
          description: 'The user associated with the SSO provider',
        },
      },
      {
        name: 'providerId',
        type: 'text',
        required: true,
        label: 'Provider ID',
        admin: {
          readOnly: true,
          description:
            'The provider id. Used to identify a provider and to generate a redirect url',
        },
      },
      {
        name: 'organizationId',
        type: 'text',
        required: true,
        label: 'Organization ID',
        admin: {
          readOnly: true,
          description: 'The organization Id. If provider is linked to an organization',
        },
      },
      ...getTimestampFields(),
    ],
  }

  return ssoProviderCollection
}
