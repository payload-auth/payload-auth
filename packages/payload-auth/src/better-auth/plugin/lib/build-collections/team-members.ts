import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'
import { getSchemaCollectionSlug, getSchemaFieldName, assertAllSchemaFields } from './utils/collection-schema'

import type { CollectionConfig } from 'payload'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'
import type { TeamMember } from '@/better-auth/generated-types'

export function buildTeamMembersCollection({
  incomingCollections,
  pluginOptions,
  resolvedSchemas
}: BuildCollectionProps): CollectionConfig {
  const teamMemberSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.teamMember)
  const teamMemberSchema = resolvedSchemas[baModelKey.teamMember]

  const existingTeamMemberCollection = incomingCollections.find((collection) => collection.slug === teamMemberSlug) as
    | CollectionConfig
    | undefined

  const fieldOverrides: FieldOverrides<keyof TeamMember> = {
    teamId: () => ({
      name: 'team',
      index: true,
      admin: { readOnly: true, description: 'The team that the membership belongs to.' }
    }),
    userId: () => ({
      name: 'user',
      index: true,
      admin: { readOnly: true, description: 'The user that is a member of the team.' }
    })
  }

  const collectionFields = getCollectionFields({
    schema: teamMemberSchema,
    additionalProperties: fieldOverrides
  })

  let teamMemberCollection: CollectionConfig = {
    ...existingTeamMemberCollection,
    slug: teamMemberSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.teamMember, 'teamId'),
      description: 'Team members of an organization team.',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingTeamMemberCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingTeamMemberCollection?.access ?? {})
    },
    custom: {
      ...(existingTeamMemberCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.teamMember
    },
    fields: [...(existingTeamMemberCollection?.fields ?? []), ...(collectionFields ?? [])]
  }

  assertAllSchemaFields(teamMemberCollection, teamMemberSchema)

  return teamMemberCollection
}
