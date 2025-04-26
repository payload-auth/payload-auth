import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { baModelKey, baseSlugs } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'

export function buildVerificationsCollection({
  incomingCollections,
  pluginOptions
}: {
  incomingCollections: CollectionConfig[]
  pluginOptions: BetterAuthPluginOptions
}): CollectionConfig {
  const verificationSlug = pluginOptions.verifications?.slug ?? baseSlugs.verifications
  const existingVerificationCollection = incomingCollections.find((collection) => collection.slug === verificationSlug)

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
    fields: [
      ...(existingVerificationCollection?.fields ?? []),
      {
        name: 'identifier',
        type: 'text',
        required: true,
        index: true,
        label: 'Identifier',
        admin: {
          description: 'The identifier of the verification request',
          readOnly: true
        },
        custom: {
          betterAuthFieldKey: 'identifier'
        }
      },
      {
        name: 'value',
        type: 'text',
        required: true,
        label: 'Value',
        admin: {
          description: 'The value to be verified',
          readOnly: true
        },
        custom: {
          betterAuthFieldKey: 'value'
        }
      },
      {
        name: 'expiresAt',
        type: 'date',
        required: true,
        label: 'Expires At',
        admin: {
          description: 'The date and time when the verification request will expire',
          readOnly: true
        },
        custom: {
          betterAuthFieldKey: 'expiresAt'
        }
      }
    ],
    timestamps: true,
    ...existingVerificationCollection
  }

  if (pluginOptions.verifications?.collectionOverrides) {
    verificationCollection = pluginOptions.verifications.collectionOverrides({
      collection: verificationCollection
    })
  }

  return verificationCollection
}
