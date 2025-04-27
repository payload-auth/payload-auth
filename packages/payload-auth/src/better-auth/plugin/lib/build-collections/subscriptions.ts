import { BetterAuthPluginOptions } from '../../types'
import { baModelKey } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { FieldAttribute } from 'better-auth/db'
import type { Field, CollectionConfig } from 'payload'
import { FieldRule } from './utils/model-field-transformations'

export function buildSubscriptionsCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const subscriptionsSlug = getDeafultCollectionSlug({ modelKey: baModelKey.subscription, pluginOptions })

  const fieldOverrides: Record<string, (field: FieldAttribute) => Partial<Field>> = {
    plan: () => ({
      index: true,
      admin: { readOnly: true, description: 'The name of the subscription plan' }
    }),
    referenceId: () => ({
      index: true,
      admin: { readOnly: true, description: 'The ID this subscription is associated with (user ID by default)' }
    }),
    stripeCustomerId: () => ({
      index: true,
      admin: { readOnly: true, description: 'The Stripe customer ID' }
    }),
    stripeSubscriptionId: () => ({
      index: true,
      admin: { readOnly: true, description: 'The Stripe subscription ID' }
    }),
    status: () => ({
      index: true,
      admin: { description: 'The status of the subscription (active, canceled, etc.)' }
    }),
    periodStart: () => ({
      admin: { description: 'Start date of the current billing period' }
    }),
    periodEnd: () => ({
      admin: { description: 'End date of the current billing period' }
    }),
    cancelAtPeriodEnd: () => ({
      admin: { description: 'Whether the subscription will be canceled at the end of the period' }
    }),
    seats: () => ({
      admin: { description: 'Number of seats for team plans' }
    }),
    trialStart: () => ({
      admin: { description: 'Start date of the trial period' }
    }),
    trialEnd: () => ({
      admin: { description: 'End date of the trial period' }
    })
  }

  const subscriptionFieldRules: FieldRule[] = [
    {
      model: baModelKey.subscription,
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
    model: baModelKey.subscription,
    betterAuthOptions: pluginOptions.betterAuthOptions ?? {},
    fieldRules: subscriptionFieldRules,
    additionalProperties: fieldOverrides
  })

  let subscriptionsCollection: CollectionConfig = {
    slug: subscriptionsSlug,
    admin: {
      useAsTitle: 'plan',
      description: 'Subscriptions are used to manage the subscriptions of the users',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    custom: {
      betterAuthModelKey: baModelKey.subscription
    },
    fields: [...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.subscriptions === 'function') {
    subscriptionsCollection = pluginOptions.pluginCollectionOverrides.subscriptions({
      collection: subscriptionsCollection
    })
  }

  return subscriptionsCollection
}
