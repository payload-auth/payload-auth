import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { baPluginSlugs, baseSlugs, baModelKey, baModelFieldKeys } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'

export function buildMembersCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const memberSlug = baPluginSlugs.members
  const organizationSlug = baPluginSlugs.organizations
  const userSlug = pluginOptions.users?.slug ?? baseSlugs.users
  const teamSlug = baPluginSlugs.teams

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
    fields: [
      {
        name: 'organization',
        type: 'relationship',
        relationTo: organizationSlug,
        required: true,
        index: true,
        label: 'Organization',
        admin: {
          readOnly: true,
          description: 'The organization that the member belongs to.'
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.member.organizationId
        }
      },
      {
        name: 'user',
        type: 'relationship',
        relationTo: userSlug,
        required: true,
        index: true,
        label: 'User',
        admin: {
          readOnly: true,
          description: 'The user that is a member of the organization.'
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.member.userId
        }
      },
      {
        name: 'team',
        type: 'relationship',
        relationTo: teamSlug,
        required: false,
        label: 'Team',
        admin: {
          description: 'The team that the member belongs to.'
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.member.teamId
        }
      },
      {
        name: 'role',
        type: 'text',
        required: true,
        defaultValue: 'member',
        label: 'Role',
        admin: {
          description: 'The role of the member in the organization.'
        },
        custom: {
          betterAuthFieldKey: 'role'
        }
      },
      ...getTimestampFields()
    ]
  }

  if (pluginOptions.pluginCollectionOverrides?.members) {
    memberCollection = pluginOptions.pluginCollectionOverrides.members({
      collection: memberCollection
    })
  }

  return memberCollection
}
