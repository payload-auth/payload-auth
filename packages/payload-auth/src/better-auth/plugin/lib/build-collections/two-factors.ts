import type { BetterAuthPluginOptions } from '../../types'
import { baModelKey } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { FieldAttribute } from 'better-auth/db'
import type { Field, CollectionConfig } from 'payload'

export function buildTwoFactorsCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const twoFactorSlug = getDeafultCollectionSlug({ modelKey: baModelKey.twoFactor, pluginOptions })

  const fieldOverrides: Record<string, (field: FieldAttribute) => Partial<Field>> = {
    user: () => ({
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
    model: baModelKey.twoFactor,
    betterAuthOptions: pluginOptions.betterAuthOptions ?? {},
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
    fields: [...collectionFields, ...getTimestampFields()]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.twoFactors === 'function') {
    twoFactorCollection = pluginOptions.pluginCollectionOverrides.twoFactors({
      collection: twoFactorCollection
    })
  }

  return twoFactorCollection
}
