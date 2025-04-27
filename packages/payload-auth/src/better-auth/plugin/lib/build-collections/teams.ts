import type { Team } from '@/better-auth/generated-types'
import { CollectionConfig } from 'payload'
import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import { BuildCollectionProps, FieldOverrides } from '../../types'
import { FieldRule } from './utils/model-field-transformations'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'

export function buildTeamsCollection({ pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const teamSlug = getDeafultCollectionSlug({ modelKey: baModelKey.team, pluginOptions })

  const fieldOverrides: FieldOverrides<keyof Team> = {
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
