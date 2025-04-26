import { baModelKey, baModelFieldKeys } from '@/better-auth/plugin/constants'
import { getMappedCollection, getMappedField } from '../../helpers/get-collection'
import type { CollectionConfig } from 'payload'

export function configureSsoPlugin(plugin: any, collectionMap: Record<string, CollectionConfig>): void {
  const ssoProviderCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.ssoProvider })
  plugin.schema = plugin?.schema ?? {}
  plugin.schema.sso = {
    ...(plugin?.schema?.sso ?? {}),
    modelName: ssoProviderCollection.slug,
    fields: {
      ...(plugin?.schema?.sso?.fields ?? {}),
      userId: {
        ...(plugin?.schema?.sso?.fields?.userId ?? {}),
        fieldName: getMappedField({ collection: ssoProviderCollection, betterAuthFieldKey: baModelFieldKeys.ssoProvider.userId }).name
      }
    }
  }
}
