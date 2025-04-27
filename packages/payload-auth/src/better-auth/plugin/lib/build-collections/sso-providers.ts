import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import { assertAllSchemaFields } from './utils/assert-schema-fields'

import type { CollectionConfig } from 'payload'
import type { SsoProvider } from '@/better-auth/generated-types'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'

export function buildSsoProvidersCollection({ incomingCollections, pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const ssoProviderSlug = getDeafultCollectionSlug({ modelKey: baModelKey.ssoProvider, pluginOptions })

  const existingSsoProviderCollection = incomingCollections.find((collection) => collection.slug === ssoProviderSlug) as
    | CollectionConfig
    | undefined

  const fieldOverrides: FieldOverrides<keyof SsoProvider> = {
    issuer: () => ({
      index: true,
      admin: { description: 'The issuer of the SSO provider' }
    }),
    domain: () => ({
      admin: { description: 'The domain of the SSO provider' }
    }),
    oidcConfig: () => ({
      admin: { description: 'The OIDC config of the SSO provider' }
    }),
    userId: () => ({
      admin: { description: 'The user associated with the SSO provider' }
    }),
    providerId: () => ({
      admin: {
        readOnly: true,
        description: 'The provider id. Used to identify a provider and to generate a redirect url'
      }
    }),
    organizationId: () => ({
      admin: {
        readOnly: true,
        description: 'The organization Id. If provider is linked to an organization'
      }
    })
  }

  const collectionFields = getCollectionFields({
    schema,
    additionalProperties: fieldOverrides
  })

  let ssoProviderCollection: CollectionConfig = {
    ...existingSsoProviderCollection,
    slug: ssoProviderSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'issuer',
      description: 'SSO providers are used to authenticate users with an external provider',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingSsoProviderCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingSsoProviderCollection?.access ?? {})
    },
    custom: {
      ...(existingSsoProviderCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.ssoProvider
    },
    fields: [...(existingSsoProviderCollection?.fields ?? []), ...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.ssoProviders === 'function') {
    ssoProviderCollection = pluginOptions.pluginCollectionOverrides.ssoProviders({
      collection: ssoProviderCollection
    })
  }

  assertAllSchemaFields(ssoProviderCollection, schema)

  return ssoProviderCollection
}
