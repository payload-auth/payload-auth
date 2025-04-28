import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { assertAllSchemaFields } from './utils/assert-schema-fields'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'

import type { CollectionConfig } from 'payload'
import type { Team } from '@/better-auth/generated-types'
import type { FieldRule } from './utils/model-field-transformations'
import type { BuildCollectionProps, FieldOverrides } from '../../types'

export function buildTeamsCollection({ incomingCollections, pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const teamSlug = getDeafultCollectionSlug({ modelKey: baModelKey.team, pluginOptions })

  const existingTeamCollection = incomingCollections.find((collection) => collection.slug === teamSlug) as CollectionConfig | undefined

  const fieldOverrides: FieldOverrides<keyof Team> = {
    name: () => ({
      admin: { description: 'The name of the team.' }
    }),
    organizationId: () => ({
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

  const collectionFields = getCollectionFields({
    schema,
    fieldRules: teamFieldRules,
    additionalProperties: fieldOverrides
  })

  let teamCollection: CollectionConfig = {
    ...existingTeamCollection,
    slug: teamSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'name',
      description: 'Teams are groups of users that share access to certain resources.',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingTeamCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingTeamCollection?.access ?? {})
    },
    custom: {
      ...(existingTeamCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.team
    },
    fields: [...(existingTeamCollection?.fields ?? []), ...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.teams === 'function') {
    teamCollection = pluginOptions.pluginCollectionOverrides.teams({
      collection: teamCollection
    })
  }

  assertAllSchemaFields(teamCollection, schema)

  return teamCollection
}
