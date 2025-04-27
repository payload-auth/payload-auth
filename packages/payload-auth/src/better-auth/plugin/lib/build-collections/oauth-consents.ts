import type { BetterAuthPluginOptions } from '../../types'
import { baModelKey } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { FieldAttribute } from 'better-auth/db'
import type { Field, CollectionConfig } from 'payload'
import { FieldRule } from './utils/model-field-transformations'

export function buildOauthConsentsCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const oauthConsentSlug = getDeafultCollectionSlug({ modelKey: baModelKey.oauthConsent, pluginOptions })

  const fieldOverrides: Record<string, (field: FieldAttribute) => Partial<Field>> = {
    client: () => ({
      admin: { readOnly: true, description: 'OAuth client associated with the consent' }
    }),
    user: () => ({
      admin: { readOnly: true, description: 'User associated with the consent' }
    }),
    scopes: () => ({
      admin: { readOnly: true, description: 'Comma-separated list of scopes consented to' }
    }),
    consentGiven: () => ({
      defaultValue: false,
      admin: { readOnly: true, description: 'Indicates if consent was given' }
    })
  }

  const oauthConsentFieldRules: FieldRule[] = [
    {
      model: baModelKey.oauthConsent,
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
    model: baModelKey.oauthConsent,
    betterAuthOptions: pluginOptions.betterAuthOptions ?? {},
    fieldRules: oauthConsentFieldRules,
    additionalProperties: fieldOverrides
  })

  let oauthConsentCollection: CollectionConfig = {
    slug: oauthConsentSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      description: 'OAuth consents are used to store user consents for OAuth clients',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    custom: {
      betterAuthModelKey: baModelKey.oauthConsent
    },
    fields: [...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.oauthConsents === 'function') {
    oauthConsentCollection = pluginOptions.pluginCollectionOverrides.oauthConsents({
      collection: oauthConsentCollection
    })
  }

  return oauthConsentCollection
}
