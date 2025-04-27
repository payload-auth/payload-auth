import { baModelFieldKeys, baModelKey } from '@/better-auth/plugin/constants'
import { CollectionSchemaMap } from '../../helpers/get-collection-schema-map'

export function configureOidcPlugin(plugin: any, collectionSchemaMap: CollectionSchemaMap): void {
  plugin.schema = plugin?.schema ?? {}

  // Initialize missing schema objects
  Array.from([baModelKey.oauthAccessToken, baModelKey.oauthConsent, baModelKey.oauthApplication]).forEach((key) => {
    if (!plugin.schema[key]) plugin.schema[key] = {}
  })

  plugin.schema = {
    ...plugin?.schema,
    oauthApplication: {
      ...plugin?.schema?.oauthApplication,
      modelName: collectionSchemaMap[baModelKey.oauthApplication].collectionSlug,
      fields: {
        ...(plugin?.schema?.oauthApplication?.fields ?? {}),
        userId: {
          ...(plugin?.schema?.oauthApplication?.fields?.userId ?? {}),
          fieldName: collectionSchemaMap[baModelKey.oauthApplication].fields[baModelFieldKeys.oauthApplication.userId]
        }
      }
    },
    oauthAccessToken: {
      ...plugin?.schema?.oauthAccessToken,
      modelName: collectionSchemaMap[baModelKey.oauthAccessToken].collectionSlug,
      fields: {
        ...(plugin?.schema?.oauthAccessToken?.fields ?? {}),
        userId: {
          ...(plugin?.schema?.oauthAccessToken?.fields?.userId ?? {}),
          fieldName: collectionSchemaMap[baModelKey.oauthAccessToken].fields[baModelFieldKeys.oauthAccessToken.userId]
        },
        clientId: {
          ...(plugin?.schema?.oauthAccessToken?.fields?.clientId ?? {}),
          fieldName: collectionSchemaMap[baModelKey.oauthAccessToken].fields[baModelFieldKeys.oauthAccessToken.clientId]
        }
      }
    },
    oauthConsent: {
      ...plugin?.schema?.oauthConsent,
      modelName: collectionSchemaMap[baModelKey.oauthConsent].collectionSlug,
      fields: {
        ...(plugin?.schema?.oauthConsent?.fields ?? {}),
        userId: {
          ...(plugin?.schema?.oauthConsent?.fields?.userId ?? {}),
          fieldName: collectionSchemaMap[baModelKey.oauthConsent].fields[baModelFieldKeys.oauthConsent.userId]
        },
        clientId: {
          ...(plugin?.schema?.oauthConsent?.fields?.clientId ?? {}),
          fieldName: collectionSchemaMap[baModelKey.oauthConsent].fields[baModelFieldKeys.oauthConsent.clientId]
        }
      }
    }
  }
}
