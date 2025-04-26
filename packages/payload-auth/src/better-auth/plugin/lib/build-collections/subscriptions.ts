import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { baModelKey, baPluginSlugs } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'

export function buildSubscriptionsCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const subscriptionsSlug = baPluginSlugs.subscriptions

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
    fields: [
      {
        name: 'plan',
        type: 'text',
        required: true,
        index: true,
        label: 'Plan',
        admin: {
          description: 'The name of the subscription plan'
        },
        custom: {
          betterAuthFieldKey: 'plan'
        }
      },
      {
        name: 'referenceId',
        type: 'text',
        required: true,
        index: true,
        label: 'Reference ID',
        admin: {
          description: 'The ID this subscription is associated with (user ID by default)'
        },
        custom: {
          betterAuthFieldKey: 'referenceId'
        }
      },
      {
        name: 'stripeCustomerId',
        type: 'text',
        index: true,
        label: 'Stripe Customer ID',
        admin: {
          description: 'The Stripe customer ID'
        },
        custom: {
          betterAuthFieldKey: 'stripeCustomerId'
        }
      },
      {
        name: 'stripeSubscriptionId',
        type: 'text',
        index: true,
        label: 'Stripe Subscription ID',
        admin: {
          description: 'The Stripe subscription ID'
        },
        custom: {
          betterAuthFieldKey: 'stripeSubscriptionId'
        }
      },
      {
        name: 'status',
        type: 'text',
        required: true,
        index: true,
        label: 'Status',
        admin: {
          description: 'The status of the subscription (active, canceled, etc.)'
        },
        custom: {
          betterAuthFieldKey: 'status'
        }
      },
      {
        name: 'periodStart',
        type: 'date',
        label: 'Period Start',
        admin: {
          description: 'Start date of the current billing period'
        },
        custom: {
          betterAuthFieldKey: 'periodStart'
        }
      },
      {
        name: 'periodEnd',
        type: 'date',
        label: 'Period End',
        admin: {
          description: 'End date of the current billing period'
        },
        custom: {
          betterAuthFieldKey: 'periodEnd'
        }
      },
      {
        name: 'cancelAtPeriodEnd',
        type: 'checkbox',
        label: 'Cancel At Period End',
        admin: {
          description: 'Whether the subscription will be canceled at the end of the period'
        },
        custom: {
          betterAuthFieldKey: 'cancelAtPeriodEnd'
        }
      },
      {
        name: 'seats',
        type: 'number',
        label: 'Seats',
        admin: {
          description: 'Number of seats for team plans'
        },
        custom: {
          betterAuthFieldKey: 'seats'
        }
      },
      {
        name: 'trialStart',
        type: 'date',
        label: 'Trial Start',
        admin: {
          description: 'Start date of the trial period'
        },
        custom: {
          betterAuthFieldKey: 'trialStart'
        }
      },
      {
        name: 'trialEnd',
        type: 'date',
        label: 'Trial End',
        admin: {
          description: 'End date of the trial period'
        },
        custom: {
          betterAuthFieldKey: 'trialEnd'
        }
      },
      ...getTimestampFields()
    ]
  }

  if (pluginOptions.pluginCollectionOverrides?.subscriptions) {
    subscriptionsCollection = pluginOptions.pluginCollectionOverrides.subscriptions({
      collection: subscriptionsCollection
    })
  }

  return subscriptionsCollection
}
