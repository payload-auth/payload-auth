import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import { assertAllSchemaFields } from './utils/assert-schema-fields'

import type { CollectionConfig } from 'payload'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'
import type { Member } from '@/better-auth/generated-types'

export function buildMembersCollection({ incomingCollections, pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const memberSlug = getDeafultCollectionSlug({ modelKey: baModelKey.member, pluginOptions })

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

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    schema,
    additionalProperties: fieldOverrides
  })

  let memberCollection: CollectionConfig = {
    ...existingMemberCollection,
    slug: memberSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'organization',
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

  assertAllSchemaFields(memberCollection, schema)

  return memberCollection
}
