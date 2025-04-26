import type { FieldAttribute } from 'better-auth/db'
import type { Field, CollectionConfig } from 'payload'
import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { BetterAuthPluginOptions } from '../../types'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'

export function buildApiKeysCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const apiKeySlug = getDeafultCollectionSlug({ modelKey: baModelKey.apikey, pluginOptions })

  const fieldOverrides: Record<string, (field: FieldAttribute) => Partial<Field>> = {
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
    user: () => ({
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

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    model: baModelKey.apikey,
    betterAuthOptions: pluginOptions.betterAuthOptions ?? {},
    additionalProperties: fieldOverrides
  })

  let apiKeyCollection: CollectionConfig = {
    slug: apiKeySlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'name',
      description: 'API keys are used to authenticate requests to the API.',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    custom: {
      betterAuthModelKey: baModelKey.apikey
    },
    fields: [...collectionFields, ...getTimestampFields()]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.apiKeys === 'function') {
    apiKeyCollection = pluginOptions.pluginCollectionOverrides.apiKeys({
      collection: apiKeyCollection
    })
  }

  return apiKeyCollection
}
