import { BetterAuthPluginOptions } from '../../types'
import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { FieldAttribute } from 'better-auth/db'
import type { Field, CollectionConfig } from 'payload'
import { FieldRule } from './utils/model-field-transformations'

export function buildVerificationsCollection({
  incomingCollections,
  pluginOptions
}: {
  incomingCollections: CollectionConfig[]
  pluginOptions: BetterAuthPluginOptions
}): CollectionConfig {
  const verificationSlug = getDeafultCollectionSlug({ modelKey: baModelKey.verification, pluginOptions })
  const existingVerificationCollection = incomingCollections.find((collection) => collection.slug === verificationSlug)

  const fieldOverrides: Record<string, (field: FieldAttribute) => Partial<Field>> = {
    identifier: () => ({
      index: true,
      admin: {
        readOnly: true,
        description: 'The identifier of the verification request'
      }
    }),
    value: () => ({
      admin: {
        readOnly: true,
        description: 'The value to be verified'
      }
    }),
    expiresAt: () => ({
      admin: {
        readOnly: true,
        description: 'The date and time when the verification request will expire'
      }
    })
  }

  const verificationFieldRules: FieldRule[] = [
    {
      model: baModelKey.verification,
      condition: (field) => field.type === 'date',
      transform: (field) => ({
        ...field,
        saveToJWT: false,
        admin: {
          disableBulkEdit: true,
          hidden: true
        },
        index: true,
        label: ({ t }: any) => t('general:updatedAt')
      })
    }
  ]

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    model: baModelKey.verification,
    betterAuthOptions: pluginOptions.betterAuthOptions ?? {},
    fieldRules: verificationFieldRules,
    additionalProperties: fieldOverrides
  })

  let verificationCollection: CollectionConfig = {
    slug: verificationSlug,
    admin: {
      useAsTitle: 'identifier',
      description: 'Verifications are used to verify authentication requests',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingVerificationCollection?.admin,
      hidden: pluginOptions.verifications?.hidden
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    custom: {
      betterAuthModelKey: baModelKey.verification
    },
    fields: [...(existingVerificationCollection?.fields ?? []), ...(collectionFields ?? [])],
    ...existingVerificationCollection
  }

  if (typeof pluginOptions.verifications?.collectionOverrides === 'function') {
    verificationCollection = pluginOptions.verifications.collectionOverrides({
      collection: verificationCollection
    })
  }

  return verificationCollection
}
