import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { baPluginSlugs, baseSlugs, baModelKey, baModelFieldKeys } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'

export function buildOauthConsentsCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const oauthConsentSlug = baPluginSlugs.oauthConsents
  const userSlug = pluginOptions.users?.slug ?? baseSlugs.users

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
    fields: [
      {
        name: 'client',
        type: 'relationship',
        relationTo: baPluginSlugs.oauthApplications,
        required: true,
        label: 'Client',
        admin: {
          readOnly: true,
          description: 'OAuth client associated with the consent'
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.oauthConsent.clientId
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
          description: 'User associated with the consent'
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.oauthConsent.userId
        }
      },
      {
        name: 'scopes',
        type: 'text',
        required: true,
        label: 'Scopes',
        admin: {
          readOnly: true,
          description: 'Comma-separated list of scopes consented to'
        },
        custom: {
          betterAuthFieldKey: 'scopes'
        }
      },
      {
        name: 'consentGiven',
        type: 'checkbox',
        defaultValue: false,
        required: true,
        label: 'Consent Given',
        admin: {
          readOnly: true,
          description: '	Indicates if consent was given'
        },
        custom: {
          betterAuthFieldKey: 'consentGiven'
        }
      },
      ...getTimestampFields()
    ]
  }

  if (pluginOptions.pluginCollectionOverrides?.oauthConsents) {
    oauthConsentCollection = pluginOptions.pluginCollectionOverrides.oauthConsents({
      collection: oauthConsentCollection
    })
  }

  return oauthConsentCollection
}
