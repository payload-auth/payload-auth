import { baModelFieldKeys, baModelKey } from '@/better-auth/plugin/constants'
import { getMappedCollection, getMappedField } from '../../helpers/get-collection'
import { CollectionConfig } from 'payload'

export function configureOidcPlugin(plugin: any, collectionMap: Record<string, CollectionConfig>): void {
  const oauthApplicationCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.oauthApplication })
  const oauthAccessTokenCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.oauthAccessToken })
  const oauthConsentCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.oauthConsent })

  plugin.schema = plugin?.schema ?? {}

  // Initialize missing schema objects
  Array.from([baModelKey.oauthAccessToken, baModelKey.oauthConsent, baModelKey.oauthApplication]).forEach((key) => {
    if (!plugin.schema[key]) plugin.schema[key] = {}
  })

  plugin.schema = {
    ...plugin?.schema,
    oauthApplication: {
      ...plugin?.schema?.oauthApplication,
      modelName: oauthApplicationCollection.slug,
      fields: {
        ...(plugin?.schema?.oauthApplication?.fields ?? {}),
        userId: {
          ...(plugin?.schema?.oauthApplication?.fields?.userId ?? {}),
          fieldName: getMappedField({
            collection: oauthApplicationCollection,
            betterAuthFieldKey: baModelFieldKeys.oauthApplication.userId
          }).name
        }
      }
    },
    oauthAccessToken: {
      ...plugin?.schema?.oauthAccessToken,
      modelName: oauthAccessTokenCollection.slug,
      fields: {
        ...(plugin?.schema?.oauthAccessToken?.fields ?? {}),
        userId: {
          ...(plugin?.schema?.oauthAccessToken?.fields?.userId ?? {}),
          fieldName: getMappedField({
            collection: oauthAccessTokenCollection,
            betterAuthFieldKey: baModelFieldKeys.oauthAccessToken.userId
          }).name
        },
        clientId: {
          ...(plugin?.schema?.oauthAccessToken?.fields?.clientId ?? {}),
          fieldName: getMappedField({
            collection: oauthAccessTokenCollection,
            betterAuthFieldKey: baModelFieldKeys.oauthAccessToken.clientId
          }).name
        }
      }
    },
    oauthConsent: {
      ...plugin?.schema?.oauthConsent,
      modelName: oauthConsentCollection.slug,
      fields: {
        ...(plugin?.schema?.oauthConsent?.fields ?? {}),
        userId: {
          ...(plugin?.schema?.oauthConsent?.fields?.userId ?? {}),
          fieldName: getMappedField({ collection: oauthConsentCollection, betterAuthFieldKey: baModelFieldKeys.oauthConsent.userId }).name
        },
        clientId: {
          ...(plugin?.schema?.oauthConsent?.fields?.clientId ?? {}),
          fieldName: getMappedField({
            collection: oauthConsentCollection,
            betterAuthFieldKey: baModelFieldKeys.oauthConsent.clientId
          }).name
        }
      }
    }
  }
}
