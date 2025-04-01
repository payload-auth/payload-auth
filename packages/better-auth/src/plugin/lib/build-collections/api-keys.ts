import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { betterAuthPluginSlugs, baseCollectionSlugs } from '../config'
import { getTimestampFields } from './utils/get-timestamp-fields'

export function buildApiKeysCollection({
  pluginOptions,
}: {
  pluginOptions: BetterAuthPluginOptions
}) {
  const apiKeySlug = betterAuthPluginSlugs.apiKeys
  const userSlug = pluginOptions.users?.slug ?? baseCollectionSlugs.users

  const apiKeyCollection: CollectionConfig = {
    slug: apiKeySlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'name',
      description: 'API keys are used to authenticate requests to the API.',
    },
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Name',
        admin: {
          readOnly: true,
          description: 'The name of the API key.',
        },
      },
      {
        name: 'start',
        type: 'text',
        label: 'Starting Characters',
        admin: {
          readOnly: true,
          description:
            'The starting characters of the API key. Useful for showing the first few characters of the API key in the UI for the users to easily identify.',
        },
      },
      {
        name: 'prefix',
        type: 'text',
        label: 'Prefix',
        admin: {
          readOnly: true,
          description: 'The API Key prefix. Stored as plain text.',
        },
      },
      {
        name: 'key',
        type: 'text',
        required: true,
        label: 'API Key',
        admin: {
          readOnly: true,
          description: 'The hashed API key itself.',
        },
      },
      {
        name: 'user',
        type: 'relationship',
        relationTo: userSlug,
        required: true,
        label: 'User',
        admin: {
          readOnly: true,
          description: 'The user associated with the API key.',
        },
      },
      {
        name: 'refillInterval',
        type: 'number',
        label: 'Refill Interval',
        admin: {
          readOnly: true,
          description: 'The interval to refill the key in milliseconds.',
        },
      },
      {
        name: 'refillAmount',
        type: 'number',
        label: 'Refill Amount',
        admin: {
          readOnly: true,
          description: 'The amount to refill the remaining count of the key.',
        },
      },
      {
        name: 'lastRefillAt',
        type: 'date',
        label: 'Last Refill At',
        admin: {
          readOnly: true,
          description: 'The date and time when the key was last refilled.',
        },
      },
      {
        name: 'enabled',
        type: 'checkbox',
        defaultValue: true,
        label: 'Enabled',
        admin: {
          readOnly: true,
          description: 'Whether the API key is enabled.',
        },
      },
      {
        name: 'rateLimitEnabled',
        type: 'checkbox',
        defaultValue: true,
        label: 'Rate Limit Enabled',
        admin: {
          readOnly: true,
          description: 'Whether the API key has rate limiting enabled.',
        },
      },
      {
        name: 'rateLimitTimeWindow',
        type: 'number',
        label: 'Rate Limit Time Window',
        admin: {
          readOnly: true,
          description: 'The time window in milliseconds for the rate limit.',
        },
      },
      {
        name: 'rateLimitMax',
        type: 'number',
        label: 'The maximum number of requests allowed within the `rateLimitTimeWindow`.',
        admin: {
          readOnly: true,
          description: 'The maximum number of requests allowed within the rate limit time window.',
        },
      },
      {
        name: 'requstCount',
        type: 'number',
        label: 'Request Count',
        required: true,
        admin: {
          readOnly: true,
          description: 'The number of requests made within the rate limit time window.',
        },
      },
      {
        name: 'remaining',
        type: 'number',
        label: 'Remaining Requests',
        admin: {
          readOnly: true,
          description: 'The number of requests remaining.',
        },
      },
      {
        name: 'lastRequest',
        type: 'date',
        label: 'Last Request At',
        admin: {
          readOnly: true,
          description: 'The date and time of the last request made to the key.',
        },
      },
      {
        name: 'expiresAt',
        type: 'date',
        label: 'Expires At',
        admin: {
          readOnly: true,
          description: 'The date and time of when the API key will expire.',
        },
      },
      {
        name: 'permissions',
        type: 'text',
        label: 'Permissions',
        admin: {
          readOnly: true,
          description: 'The permissions for the API key.',
        },
      },
      {
        name: 'metadata',
        type: 'json',
        label: 'Metadata',
        admin: {
          readOnly: true,
          description: 'Any additional metadata you want to store with the key.',
        },
      },
      ...getTimestampFields(),
    ],
  }

  return apiKeyCollection
}
