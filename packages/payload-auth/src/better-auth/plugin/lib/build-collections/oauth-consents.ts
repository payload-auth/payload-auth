import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'
import type { CollectionConfig } from 'payload'
import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import { FieldRule } from './utils/model-field-transformations'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { OauthConsent } from '@/better-auth/generated-types'

export function buildOauthConsentsCollection({ pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const oauthConsentSlug = getDeafultCollectionSlug({ modelKey: baModelKey.oauthConsent, pluginOptions })

  const fieldOverrides: FieldOverrides<keyof OauthConsent> = {
    clientId: () => ({
      admin: { readOnly: true, description: 'OAuth client associated with the consent' }
    }),
    userId: () => ({
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
