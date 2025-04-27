import { baModelFieldKeys, baModelKey } from '@/better-auth/plugin/constants'
import { CollectionSchemaMap } from '../../helpers/get-collection-schema-map'
import { getMappedField } from '../../helpers/get-collection'

export function configureTwoFactorPlugin(plugin: any, collectionSchemaMap: CollectionSchemaMap): void {
  plugin.schema = plugin?.schema ?? {}

  Array.from([baModelKey.twoFactor, baModelKey.user]).forEach((key) => {
    if (!plugin.schema[key]) plugin.schema[key] = {}
  })

  plugin.schema = {
    ...plugin?.schema,
    //TODO: NOT SURE IF THIS IS NEEDED
    // user: {
    //   ...plugin?.schema?.user,
    //   modelName: collectionSchemaMap[baModelKey.user].collectionSlug,
    //   fields: {
    //     ...(plugin?.schema?.user?.fields ?? {}),
    //     userId: {
    //       ...(plugin?.schema?.user?.fields?.userId ?? {}),
    //       fieldName: collectionSchemaMap[baModelKey.twoFactor].fields[baModelFieldKeys.twoFactor.userId]
    //     }
    //   }
    // },
    twoFactor: {
      ...(plugin?.schema?.twoFactor ?? {}),
      modelName: collectionSchemaMap[baModelKey.twoFactor].collectionSlug,
      fields: {
        ...(plugin?.schema?.twoFactor?.fields ?? {}),
        userId: {
          ...(plugin?.schema?.twoFactor?.fields?.userId ?? {}),
          fieldName: collectionSchemaMap[baModelKey.twoFactor].fields[baModelFieldKeys.twoFactor.userId]
        }
      }
    }
  }
}
