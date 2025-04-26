import { baModelKey, baModelFieldKeys } from '@/better-auth/plugin/constants'
import { getMappedCollection, getMappedField } from '../../helpers/get-collection'
import { CollectionConfig } from 'payload'

export function configurePasskeyPlugin(plugin: any, collectionMap: Record<string, CollectionConfig>): void {
  const passkeyCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.passkey })
  plugin.schema = plugin?.schema ?? {}
  plugin.schema.passkey = {
    ...(plugin?.schema?.passkey ?? {}),
    modelName: passkeyCollection.slug,
    fields: {
      ...(plugin?.schema?.passkey?.fields ?? {}),
      userId: {
        ...(plugin?.schema?.passkey?.fields?.userId ?? {}),
        fieldName: getMappedField({ collection: passkeyCollection, betterAuthFieldKey: baModelFieldKeys.passkey.userId }).name
      }
    }
  }
}
