import { BetterAuthPluginOptions } from '../../types'
import { baModelKey } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { FieldAttribute } from 'better-auth/db'
import type { Field, CollectionConfig } from 'payload'
import { FieldRule } from './utils/model-field-transformations'
export function buildMembersCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const memberSlug = getDeafultCollectionSlug({ modelKey: baModelKey.member, pluginOptions })

  const fieldOverrides: Record<string, (field: FieldAttribute) => Partial<Field>> = {
    organization: () => ({
      index: true,
      admin: { readOnly: true, description: 'The organization that the member belongs to.' }
    }),
    user: () => ({
      index: true,
      admin: { readOnly: true, description: 'The user that is a member of the organization.' }
    }),
    team: () => ({
      admin: { description: 'The team that the member belongs to.' }
    }),
    role: () => ({
      defaultValue: 'member',
      admin: { description: 'The role of the member in the organization.' }
    })
  }

  const memberFieldRules: FieldRule[] = [
    {
      model: baModelKey.member,
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
    model: baModelKey.member,
    betterAuthOptions: pluginOptions.betterAuthOptions ?? {},
    fieldRules: memberFieldRules,
    additionalProperties: fieldOverrides
  })

  let memberCollection: CollectionConfig = {
    slug: memberSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'organization',
      description: 'Members of an organization.',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    custom: {
      betterAuthModelKey: baModelKey.member
    },
    fields: [...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.members === 'function') {
    memberCollection = pluginOptions.pluginCollectionOverrides.members({
      collection: memberCollection
    })
  }

  return memberCollection
}
