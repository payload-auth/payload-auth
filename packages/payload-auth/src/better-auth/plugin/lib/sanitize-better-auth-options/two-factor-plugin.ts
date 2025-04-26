import { baModelFieldKeys, baModelKey } from '@/better-auth/plugin/constants'
import type { CollectionConfig } from 'payload'
import { getMappedCollection, getMappedField } from '../../helpers/get-collection'

export function configureTwoFactorPlugin(plugin: any, collectionMap: Record<string, CollectionConfig>): void {
  const twoFactorCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.twoFactor })
  const userCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.account })
  
  plugin.schema = plugin?.schema ?? {}

  Array.from([baModelKey.twoFactor, baModelKey.user]).forEach((key) => {
    if (!plugin.schema[key]) plugin.schema[key] = {}
  })

  plugin.schema = {
    ...plugin?.schema,
    user: {
      ...plugin?.schema?.user,
      modelName: userCollection.slug,
      fields: {
        ...(plugin?.schema?.user?.fields ?? {}),
        userId: {
          ...(plugin?.schema?.user?.fields?.userId ?? {}),
          fieldName: getMappedField({ collection: userCollection, betterAuthFieldKey: baModelFieldKeys.twoFactor.userId }).name
        }
      }
    },
    twoFactor: {
      ...(plugin?.schema?.twoFactor ?? {}),
      modelName: twoFactorCollection.slug,
      fields: {
      ...(plugin?.schema?.twoFactor?.fields ?? {}),
      userId: {
        ...(plugin?.schema?.twoFactor?.fields?.userId ?? {}),
          fieldName: getMappedField({ collection: twoFactorCollection, betterAuthFieldKey: baModelFieldKeys.twoFactor.userId }).name
        }
      }
    }
  }
}
