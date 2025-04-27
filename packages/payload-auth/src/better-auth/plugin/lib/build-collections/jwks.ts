import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import { assertAllSchemaFields } from './utils/assert-schema-fields'

import type { CollectionConfig } from 'payload'
import type { Jwks } from '@/better-auth/generated-types'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'

export function buildJwksCollection({ pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const jwksSlug = getDeafultCollectionSlug({ modelKey: baModelKey.jwks, pluginOptions })

  const fieldOverrides: FieldOverrides<keyof Jwks> = {
    publicKey: () => ({
      index: true,
      admin: { description: 'The public part of the web key' }
    }),
    privateKey: () => ({
      admin: { description: 'The private part of the web key' }
    })
  }

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    schema,
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

  assertAllSchemaFields(jwksCollection, schema)

  return jwksCollection
}
