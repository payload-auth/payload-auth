import type { BetterAuthPluginOptions } from '../../types'
import { baModelKey } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { FieldAttribute } from 'better-auth/db'
import type { Field, CollectionConfig } from 'payload'
import { FieldRule } from './utils/model-field-transformations'

export function buildJwksCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const jwksSlug = getDeafultCollectionSlug({ modelKey: baModelKey.jwks, pluginOptions })

  const fieldOverrides: Record<string, (field: FieldAttribute) => Partial<Field>> = {
    publicKey: () => ({
      index: true,
      admin: { description: 'The public part of the web key' }
    }),
    privateKey: () => ({
      admin: { description: 'The private part of the web key' }
    })
  }

  const jwksFieldRules: FieldRule[] = [
    {
      model: baModelKey.jwks,
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
    model: baModelKey.jwks,
    betterAuthOptions: pluginOptions.betterAuthOptions ?? {},
    fieldRules: jwksFieldRules,
    additionalProperties: fieldOverrides
  })

  let jwksCollection: CollectionConfig = {
    slug: jwksSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'publicKey',
      description: 'JWKS are used to verify the signature of the JWT token',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    custom: {
      betterAuthModelKey: baModelKey.jwks
    },
    fields: [...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.jwks === 'function') {
    jwksCollection = pluginOptions.pluginCollectionOverrides.jwks({
      collection: jwksCollection
    })
  }

  return jwksCollection
}
