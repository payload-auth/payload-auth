import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { betterAuthPluginSlugs } from '../config'
import { getTimestampFields } from './utils/get-timestamp-fields'

export function buildTeamsCollection({
  pluginOptions,
}: {
  pluginOptions: BetterAuthPluginOptions
}) {
  const teamSlug = betterAuthPluginSlugs.teams
  const organizationSlug = betterAuthPluginSlugs.organizations
  const teamCollection: CollectionConfig = {
    slug: teamSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'name',
      description: 'Teams are groups of users that share access to certain resources.',
    },
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        label: 'Name',
        admin: {
          description: 'The name of the team.',
        },
      },
      {
        name: 'organization',
        type: 'relationship',
        relationTo: organizationSlug,
        required: true,
        label: 'Organization',
        admin: {
          readOnly: true,
          description: 'The organization that the team belongs to.',
        },
      },
      ...getTimestampFields(),
    ],
  }

  return teamCollection
}
