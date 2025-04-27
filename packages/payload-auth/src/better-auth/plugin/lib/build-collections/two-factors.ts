import type { BuildCollectionProps, FieldOverrides } from '../../types'
import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { CollectionConfig } from 'payload'
import type { TwoFactor } from '@/better-auth/generated-types'

export function buildTwoFactorsCollection({ pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const twoFactorSlug = getDeafultCollectionSlug({ modelKey: baModelKey.twoFactor, pluginOptions })

  const fieldOverrides: FieldOverrides<keyof TwoFactor> = {
    userId: () => ({
      admin: {
        readOnly: true,
        description: 'The user that the two factor authentication secret belongs to'
      }
    }),
    secret: () => ({
      index: true,
      admin: {
        readOnly: true,
        description: 'The secret used to generate the TOTP code.'
      }
    }),
    backupCodes: () => ({
      admin: {
        readOnly: true,
        description: 'The backup codes used to recover access to the account if the user loses access to their phone or email'
      }
    })
  }

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    schema,
    additionalProperties: fieldOverrides
  })

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
    fields: [...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.twoFactors === 'function') {
    twoFactorCollection = pluginOptions.pluginCollectionOverrides.twoFactors({
      collection: twoFactorCollection
    })
  }

  return twoFactorCollection
}
