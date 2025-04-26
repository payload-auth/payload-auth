import type { BetterAuthPluginOptions } from '../../types'
import { baModelKey } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { FieldAttribute } from 'better-auth/db'
import type { Field, CollectionConfig } from 'payload'

export function buildSsoProvidersCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const ssoProviderSlug = getDeafultCollectionSlug({ modelKey: baModelKey.ssoProvider, pluginOptions })

  const fieldOverrides: Record<string, (field: FieldAttribute) => Partial<Field>> = {
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
    user: () => ({
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

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    model: baModelKey.ssoProvider,
    betterAuthOptions: pluginOptions.betterAuthOptions ?? {},
    additionalProperties: fieldOverrides
  })

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
    fields: [...collectionFields, ...getTimestampFields()]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.ssoProviders === 'function') {
    ssoProviderCollection = pluginOptions.pluginCollectionOverrides.ssoProviders({
      collection: ssoProviderCollection
    })
  }

  return ssoProviderCollection
}
