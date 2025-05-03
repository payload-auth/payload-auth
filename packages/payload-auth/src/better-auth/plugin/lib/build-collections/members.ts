import { baModelFieldKeysToFieldNames, baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'
import { getSchemaCollectionSlug, getSchemaFieldName } from './utils/collection-schema'
import { assertAllSchemaFields } from './utils/collection-schema'

import type { CollectionConfig } from 'payload'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'
import type { Member } from '@/better-auth/generated-types'

export function buildMembersCollection({ incomingCollections, pluginOptions, resolvedSchemas }: BuildCollectionProps): CollectionConfig {
  const memberSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.member)
  const memberSchema = resolvedSchemas[baModelKey.member]

  const existingMemberCollection = incomingCollections.find((collection) => collection.slug === memberSlug) as CollectionConfig | undefined

  const fieldOverrides: FieldOverrides<keyof Member> = {
    organizationId: () => ({
      index: true,
      admin: { readOnly: true, description: 'The organization that the member belongs to.' }
    }),
    userId: () => ({
      index: true,
      admin: { readOnly: true, description: 'The user that is a member of the organization.' }
    }),
    teamId: () => ({
      admin: { description: 'The team that the member belongs to.' }
    }),
    role: () => ({
      defaultValue: 'member',
      admin: { description: 'The role of the member in the organization.' }
    })
  }

  const collectionFields = getCollectionFields({
    schema: memberSchema,
    additionalProperties: fieldOverrides
  })

  let memberCollection: CollectionConfig = {
    ...existingMemberCollection,
    slug: memberSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.member, 'organizationId'),
      description: 'Members of an organization.',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingMemberCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingMemberCollection?.access ?? {})
    },
    custom: {
      ...(existingMemberCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.member
    },
    fields: [...(existingMemberCollection?.fields ?? []), ...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.members === 'function') {
    memberCollection = pluginOptions.pluginCollectionOverrides.members({
      collection: memberCollection
    })
  }

  assertAllSchemaFields(memberCollection, memberSchema)

  return memberCollection
}
