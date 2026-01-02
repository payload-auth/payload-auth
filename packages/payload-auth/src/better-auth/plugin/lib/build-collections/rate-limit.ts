import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'
import { assertAllSchemaFields, getSchemaCollectionSlug, getSchemaFieldName } from './utils/collection-schema'

import type { CollectionConfig } from 'payload'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'
import { RateLimit } from '@/better-auth/generated-types'

export function buildRateLimitCollection({ incomingCollections, pluginOptions, resolvedSchemas }: BuildCollectionProps): CollectionConfig {
  const slug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.rateLimit)
  const schema = resolvedSchemas[baModelKey.rateLimit]

  const existingRateLimitCollection = incomingCollections.find((collection) => collection.slug === slug) as CollectionConfig | undefined

  const fieldOverrides: FieldOverrides<keyof RateLimit> = {
    key: () => ({
      index: true,
      admin: { readOnly: true, description: 'The key for the rate limit.' }
    })
  }

  const collectionFields = getCollectionFields({
    schema,
    additionalProperties: fieldOverrides
  })

  let rateLimitCollection: CollectionConfig = {
    ...existingRateLimitCollection,
    slug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.rateLimit, 'key'),
      description: 'Rate limits for users',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingRateLimitCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingRateLimitCollection?.access ?? {})
    },
    custom: {
      ...(existingRateLimitCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.rateLimit
    },
    fields: [...(existingRateLimitCollection?.fields ?? []), ...(collectionFields ?? [])]
  }


  if (typeof pluginOptions.pluginCollectionOverrides?.rateLimit === 'function') {
    rateLimitCollection = pluginOptions.pluginCollectionOverrides.rateLimit({
      collection: rateLimitCollection
    })
  }

  assertAllSchemaFields(rateLimitCollection, schema)

  return rateLimitCollection
}
