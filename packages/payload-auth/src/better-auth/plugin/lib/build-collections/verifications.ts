import type { Verification } from '@/better-auth/generated-types'
import type { CollectionConfig } from 'payload'
import type { BuildCollectionProps, FieldOverrides } from '../../types'
import type { FieldRule } from './utils/model-field-transformations'

import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { assertAllSchemaFields, getSchemaCollectionSlug, getSchemaFieldName } from './utils/collection-schema'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'

export function buildVerificationsCollection({ incomingCollections, pluginOptions, resolvedSchemas }: BuildCollectionProps): CollectionConfig {
  const verificationSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.verification)
  const verificationSchema = resolvedSchemas[baModelKey.verification]

  const existingVerificationCollection = incomingCollections.find((collection) => collection.slug === verificationSlug) as
    | CollectionConfig
    | undefined

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
        label: 'general:updatedAt'
      })
    }
  ]

  const collectionFields = getCollectionFields({
    schema: verificationSchema,
    fieldRules: verificationFieldRules,
    additionalProperties: fieldOverrides
  })

  let verificationCollection: CollectionConfig = {
    ...existingVerificationCollection,
    slug: verificationSlug,
    admin: {
      useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.verification, 'identifier'),
      description: 'Verifications are used to verify authentication requests',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingVerificationCollection?.admin,
      hidden: pluginOptions.verifications?.hidden
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingVerificationCollection?.access ?? {})
    },
    custom: {
      ...(existingVerificationCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.verification
    },
    fields: [...(existingVerificationCollection?.fields ?? []), ...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.verifications?.collectionOverrides === 'function') {
    verificationCollection = pluginOptions.verifications.collectionOverrides({
      collection: verificationCollection
    })
  }

  assertAllSchemaFields(verificationCollection, verificationSchema)

  return verificationCollection
}
