import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'
import { getSchemaCollectionSlug, getSchemaFieldName, assertAllSchemaFields } from './utils/collection-schema'

import type { CollectionConfig } from 'payload'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'
import type { TeamMember } from '@/better-auth/generated-types'

export function buildTeamMembersCollection({ incomingCollections, pluginOptions, resolvedSchemas }: BuildCollectionProps): CollectionConfig {
  const teamMemberSlug = getSchemaCollectionSlug(resolvedSchemas as any, (baModelKey as any).teamMember)
  const teamMemberSchema = (resolvedSchemas as any)[(baModelKey as any).teamMember]

  const existingTeamMemberCollection = incomingCollections.find((collection) => collection.slug === teamMemberSlug) as
    | CollectionConfig
    | undefined

  const fieldOverrides: FieldOverrides<keyof TeamMember> = {
    teamId: () => ({
      index: true,
      admin: { readOnly: true, description: 'The team that the membership belongs to.' }
    }),
    userId: () => ({
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
      useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.teamMember as any, 'teamId' as any),
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
      betterAuthModelKey: baModelKey.teamMember as any
    },
    fields: [...(existingTeamMemberCollection?.fields ?? []), ...(collectionFields ?? [])]
  }

  assertAllSchemaFields(teamMemberCollection, teamMemberSchema)

  return teamMemberCollection
}


