import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { baModelFieldKeys, baModelKey, baPluginSlugs } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'

export function buildTeamsCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const teamSlug = baPluginSlugs.teams
  const organizationSlug = baPluginSlugs.organizations

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
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        label: 'Name',
        admin: {
          description: 'The name of the team.'
        },
        custom: {
          betterAuthFieldKey: 'name'
        }
      },
      {
        name: 'organization',
        type: 'relationship',
        relationTo: organizationSlug,
        required: true,
        label: 'Organization',
        admin: {
          readOnly: true,
          description: 'The organization that the team belongs to.'
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.team.organizationId
        }
      },
      ...getTimestampFields()
    ]
  }

  if (pluginOptions.pluginCollectionOverrides?.teams) {
    teamCollection = pluginOptions.pluginCollectionOverrides.teams({
      collection: teamCollection
    })
  }

  return teamCollection
}
