import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { BuildCollectionPropsWithIncoming, FieldOverrides } from '../../types'
import type { CollectionConfig } from 'payload'
import { FieldRule } from './utils/model-field-transformations'
import type { Verification } from '@/better-auth/generated-types'

export function buildVerificationsCollection({
  incomingCollections,
  pluginOptions,
  schema
}: BuildCollectionPropsWithIncoming): CollectionConfig {
  const verificationSlug = getDeafultCollectionSlug({ modelKey: baModelKey.verification, pluginOptions })
  const existingVerificationCollection = incomingCollections.find((collection) => collection.slug === verificationSlug)

  const fieldOverrides: FieldOverrides<keyof Verification> = {
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
    schema,
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
