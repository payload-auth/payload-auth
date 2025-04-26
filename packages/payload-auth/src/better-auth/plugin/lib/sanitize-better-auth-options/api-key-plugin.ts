import { baModelFieldKeys, baModelKey } from '@/better-auth/plugin/constants'
import type { CollectionConfig } from 'payload'
import { getMappedCollection, getMappedField } from '../../helpers/get-collection'

export function configureApiKeyPlugin(plugin: any, collectionMap: Record<string, CollectionConfig>): void {
  const apiKeyCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.apikey })

  plugin.schema = plugin?.schema ?? {}
  plugin.schema.apikey = {
    ...(plugin?.schema?.apikey ?? {}),
    modelName: apiKeyCollection.slug,
    fields: {
      ...(plugin?.schema?.apikey?.fields ?? {}),
      userId: {
        ...(plugin?.schema?.apikey?.fields?.userId ?? {}),
        fieldName: getMappedField({ collection: apiKeyCollection, betterAuthFieldKey: baModelFieldKeys.apikey.userId }).name
      }
    }
  }
}
