import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { betterAuthPluginSlugs, baseCollectionSlugs } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'

export function buildTwoFactorsCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }) {
  const twoFactorSlug = betterAuthPluginSlugs.twoFactors
  const userSlug = pluginOptions.users?.slug ?? baseCollectionSlugs.users

  const twoFactorCollection: CollectionConfig = {
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
        }
      },
      ...getTimestampFields()
    ]
  }

  return twoFactorCollection
}
