import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import { assertAllSchemaFields } from './utils/assert-schema-fields'

import type { CollectionConfig } from 'payload'
import type { TwoFactor } from '@/better-auth/generated-types'
import type { BuildCollectionProps, FieldOverrides } from '../../types'

export function buildTwoFactorsCollection({ incomingCollections, pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const twoFactorSlug = getDeafultCollectionSlug({ modelKey: baModelKey.twoFactor, pluginOptions })

  const existingTwoFactorCollection = incomingCollections.find((collection) => collection.slug === twoFactorSlug) as
    | CollectionConfig
    | undefined

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

  const collectionFields = getCollectionFields({
    schema,
    additionalProperties: fieldOverrides
  })

  let twoFactorCollection: CollectionConfig = {
    ...existingTwoFactorCollection,
    slug: twoFactorSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'secret',
      description: 'Two factor authentication secrets',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingTwoFactorCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingTwoFactorCollection?.access ?? {})
    },
    custom: {
      ...(existingTwoFactorCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.twoFactor
    },
    fields: [...(existingTwoFactorCollection?.fields ?? []), ...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.twoFactors === 'function') {
    twoFactorCollection = pluginOptions.pluginCollectionOverrides.twoFactors({
      collection: twoFactorCollection
    })
  }

  assertAllSchemaFields(twoFactorCollection, schema)

  return twoFactorCollection
}
