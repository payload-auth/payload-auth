import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { baModelFieldKeys, baModelKey, baPluginSlugs, baseSlugs } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'

export function buildTwoFactorsCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const twoFactorSlug = baPluginSlugs.twoFactors
  const userSlug = pluginOptions.users?.slug ?? baseSlugs.users

  let twoFactorCollection: CollectionConfig = {
    slug: twoFactorSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'secret',
      description: 'Two factor authentication secrets',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    custom: {
      betterAuthModelKey: baModelKey.twoFactor
    },
    fields: [
      {
        name: 'user',
        type: 'relationship',
        relationTo: userSlug,
        required: true,
        label: 'User',
        admin: {
          readOnly: true,
          description: 'The user that the two factor authentication secret belongs to'
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.twoFactor.userId
        }
      },
      {
        name: 'secret',
        type: 'text',
        label: 'Secret',
        index: true,
        admin: {
          readOnly: true,
          description: 'The secret used to generate the TOTP code.'
        },
        custom: {
          betterAuthFieldKey: 'secret'
        }
      },
      {
        name: 'backupCodes',
        type: 'text',
        required: true,
        label: 'Backup Codes',
        admin: {
          readOnly: true,
          description: 'The backup codes used to recover access to the account if the user loses access to their phone or email'
        },
        custom: {
          betterAuthFieldKey: 'backupCodes'
        }
      },
      ...getTimestampFields()
    ]
  }

  if (pluginOptions.pluginCollectionOverrides?.twoFactors) {
    twoFactorCollection = pluginOptions.pluginCollectionOverrides.twoFactors({
      collection: twoFactorCollection
    })
  }

  return twoFactorCollection
}
