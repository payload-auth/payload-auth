import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'
import { getDefaultCollectionSlug } from '../../helpers/get-collection-slug'
import { assertAllSchemaFields, getSchemaCollectionSlug, getSchemaFieldName } from './utils/collection-schema'

import type { CollectionConfig } from 'payload'
import type { Jwks } from '@/better-auth/generated-types'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'

export function buildJwksCollection({ incomingCollections, pluginOptions, resolvedSchemas }: BuildCollectionProps): CollectionConfig {
  const jwksSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.jwks)
  const jwksSchema = resolvedSchemas[baModelKey.jwks]

  const existingJwksCollection = incomingCollections.find((collection) => collection.slug === jwksSlug) as CollectionConfig | undefined

  const fieldOverrides: FieldOverrides<keyof Jwks> = {
    publicKey: () => ({
      index: true,
      admin: { description: 'The public part of the web key' }
    }),
    privateKey: () => ({
      admin: { description: 'The private part of the web key' }
    })
  }

  const collectionFields = getCollectionFields({
    schema: jwksSchema,
    additionalProperties: fieldOverrides
  })

  let jwksCollection: CollectionConfig = {
    ...existingJwksCollection,
    slug: jwksSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.jwks, 'publicKey'),
      description: 'JWKS are used to verify the signature of the JWT token',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingJwksCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingJwksCollection?.access ?? {})
    },
    custom: {
      ...(existingJwksCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.jwks
    },
    fields: [...(existingJwksCollection?.fields ?? []), ...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.jwks === 'function') {
    jwksCollection = pluginOptions.pluginCollectionOverrides.jwks({
      collection: jwksCollection
    })
  }

  assertAllSchemaFields(jwksCollection, jwksSchema)

  return jwksCollection
}
