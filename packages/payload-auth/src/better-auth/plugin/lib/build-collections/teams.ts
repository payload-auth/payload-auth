import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions, BuildCollectionProps, FieldOverrides } from '../../types'
import { baModelKey } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { FieldAttribute } from 'better-auth/db'
import type { Field } from 'payload'
import { FieldRule } from './utils/model-field-transformations'

export function buildTeamsCollection({ pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const teamSlug = getDeafultCollectionSlug({ modelKey: baModelKey.team, pluginOptions })

  const fieldOverrides: FieldOverrides = {
    name: () => ({
      admin: { description: 'The name of the team.' }
    }),
    organization: () => ({
      admin: {
        readOnly: true,
        description: 'The organization that the team belongs to.'
      }
    })
  }

  const teamFieldRules: FieldRule[] = [
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

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    schema,
    fieldRules: teamFieldRules,
    additionalProperties: fieldOverrides
  })

  let teamCollection: CollectionConfig = {
    slug: teamSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'name',
      description: 'Teams are groups of users that share access to certain resources.',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    custom: {
      betterAuthModelKey: baModelKey.team
    },
    fields: [...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.teams === 'function') {
    teamCollection = pluginOptions.pluginCollectionOverrides.teams({
      collection: teamCollection
    })
  }

  return teamCollection
}
