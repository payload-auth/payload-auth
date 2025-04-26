import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { baseSlugs, baModelKey, baPluginSlugs, baModelFieldKeys } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'

export function buildSsoProvidersCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const ssoProviderSlug = baPluginSlugs.ssoProviders
  const userSlug = pluginOptions.users?.slug ?? baseSlugs.users

  let ssoProviderCollection: CollectionConfig = {
    slug: ssoProviderSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'issuer',
      description: 'SSO providers are used to authenticate users with an external provider',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    custom: {
      betterAuthModelKey: baModelKey.ssoProvider
    },
    fields: [
      {
        name: 'issuer',
        type: 'text',
        required: true,
        index: true,
        label: 'Issuer',
        admin: {
          description: 'The issuer of the SSO provider'
        },
        custom: {
          betterAuthFieldKey: 'issuer'
        }
      },
      {
        name: 'domain',
        type: 'text',
        required: true,
        label: 'Domain',
        admin: {
          description: 'The domain of the SSO provider'
        },
        custom: {
          betterAuthFieldKey: 'domain'
        }
      },
      {
        name: 'oidcConfig',
        type: 'text',
        required: true,
        label: 'OIDC Config',
        admin: {
          description: 'The OIDC config of the SSO provider'
        },
        custom: {
          betterAuthFieldKey: 'oidcConfig'
        }
      },
      {
        name: 'user',
        type: 'relationship',
        relationTo: userSlug,
        required: true,
        label: 'User',
        admin: {
          description: 'The user associated with the SSO provider'
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.ssoProvider.userId
        }
      },
      {
        name: 'providerId',
        type: 'text',
        required: true,
        label: 'Provider ID',
        admin: {
          readOnly: true,
          description: 'The provider id. Used to identify a provider and to generate a redirect url'
        },
        custom: {
          betterAuthFieldKey: 'providerId'
        }
      },
      {
        name: 'organizationId',
        type: 'text',
        required: true,
        label: 'Organization ID',
        admin: {
          readOnly: true,
          description: 'The organization Id. If provider is linked to an organization'
        },
        custom: {
          betterAuthFieldKey: 'organizationId'
        }
      },
      ...getTimestampFields()
    ]
  }

  if (pluginOptions.pluginCollectionOverrides?.ssoProviders) {
    ssoProviderCollection = pluginOptions.pluginCollectionOverrides.ssoProviders({
      collection: ssoProviderCollection
    })
  }

  return ssoProviderCollection
}
