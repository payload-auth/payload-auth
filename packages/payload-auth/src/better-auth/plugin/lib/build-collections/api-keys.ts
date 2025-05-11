import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getDefaultCollectionSlug } from '../../helpers/get-collection-slug'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'
import { assertAllSchemaFields, getSchemaCollectionSlug } from './utils/collection-schema'

import { type CollectionConfig } from 'payload'
import type { Apikey } from '@/better-auth/generated-types'
import type { FieldRule } from './utils/model-field-transformations'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'

export function buildApiKeysCollection({ incomingCollections, pluginOptions, resolvedSchemas }: BuildCollectionProps): CollectionConfig {
  const apiKeySlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.apikey)
  const apiKeySchema = resolvedSchemas[baModelKey.apikey]

  const existingApiKeyCollection = incomingCollections.find((collection) => collection.slug === apiKeySlug) as CollectionConfig | undefined

  const fieldOverrides: FieldOverrides<keyof Apikey> = {
    name: () => ({
      admin: { readOnly: true, description: 'The name of the API key.' }
    }),
    start: () => ({
      admin: { readOnly: true, description: 'The starting characters of the API key.' }
    }),
    prefix: () => ({
      admin: { readOnly: true, description: 'The API Key prefix. Stored as plain text.' }
    }),
    key: () => ({
      admin: { readOnly: true, description: 'The hashed API key itself.' }
    }),
    userId: () => ({
      admin: { readOnly: true, description: 'The user associated with the API key.' }
    }),
    refillInterval: () => ({
      admin: { readOnly: true, description: 'The interval to refill the key in milliseconds.' }
    }),
    refillAmount: () => ({
      admin: { readOnly: true, description: 'The amount to refill the remaining count of the key.' }
    }),
    lastRefillAt: () => ({
      admin: { readOnly: true, description: 'The date and time when the key was last refilled.' }
    }),
    enabled: () => ({
      defaultValue: true,
      admin: { readOnly: true, description: 'Whether the API key is enabled.' }
    }),
    rateLimitEnabled: () => ({
      defaultValue: true,
      admin: { readOnly: true, description: 'Whether the API key has rate limiting enabled.' }
    }),
    rateLimitTimeWindow: () => ({
      admin: { readOnly: true, description: 'The time window in milliseconds for the rate limit.' }
    }),
    rateLimitMax: () => ({
      admin: { readOnly: true, description: 'The maximum number of requests allowed within the rate limit time window.' }
    }),
    requestCount: () => ({
      admin: { readOnly: true, description: 'The number of requests made within the rate limit time window.' }
    }),
    remaining: () => ({
      admin: { readOnly: true, description: 'The number of requests remaining.' }
    }),
    lastRequest: () => ({
      admin: { readOnly: true, description: 'The date and time of the last request made to the key.' }
    }),
    expiresAt: () => ({
      admin: { readOnly: true, description: 'The date and time of when the API key will expire.' }
    }),
    permissions: () => ({
      admin: { readOnly: true, description: 'The permissions for the API key.' }
    }),
    metadata: () => ({
      type: 'json',
      admin: { readOnly: true, description: 'Any additional metadata you want to store with the key.' }
    })
  }

  const apiKeyFieldRules: FieldRule[] = [
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

  const collectionFields = getCollectionFields({
    schema: apiKeySchema,
    fieldRules: apiKeyFieldRules,
    additionalProperties: fieldOverrides
  })

  let apiKeyCollection: CollectionConfig = {
    ...existingApiKeyCollection,
    slug: apiKeySlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: apiKeySchema?.fields?.name?.fieldName,
      description: 'API keys are used to authenticate requests to the API.',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingApiKeyCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingApiKeyCollection?.access ?? {})
    },
    custom: {
      ...(existingApiKeyCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.apikey
    },
    fields: [...(existingApiKeyCollection?.fields ?? []), ...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.apiKeys === 'function') {
    apiKeyCollection = pluginOptions.pluginCollectionOverrides.apiKeys({
      collection: apiKeyCollection
    })
  }

  assertAllSchemaFields(apiKeyCollection, apiKeySchema)

  return apiKeyCollection
}
