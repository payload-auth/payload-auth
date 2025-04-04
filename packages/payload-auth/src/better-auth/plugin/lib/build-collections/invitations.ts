import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { betterAuthPluginSlugs, baseCollectionSlugs } from '../config'
import { getTimestampFields } from './utils/get-timestamp-fields'

export function buildInvitationsCollection({
  pluginOptions,
}: {
  pluginOptions: BetterAuthPluginOptions
}): CollectionConfig {
  const invitationSlug = betterAuthPluginSlugs.invitations
  const userSlug = pluginOptions.users?.slug ?? baseCollectionSlugs.users
  const organizationSlug = betterAuthPluginSlugs.organizations
  const invitationCollection: CollectionConfig = {
    slug: invitationSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'email',
      description: 'Invitations to join an organization',
    },
    fields: [
      {
        name: 'email',
        type: 'text',
        required: true,
        index: true,
        label: 'Email',
        admin: {
          description: 'The email of the user being invited.',
          readOnly: true,
        },
      },
      {
        name: 'inviter',
        type: 'relationship',
        relationTo: userSlug,
        required: true,
        label: 'Inviter',
        admin: {
          description: 'The user who invited the user.',
          readOnly: true,
        },
      },
      {
        name: 'organization',
        type: 'relationship',
        relationTo: organizationSlug,
        required: true,
        index: true,
        label: 'Organization',
        admin: {
          description: 'The organization that the user is being invited to.',
          readOnly: true,
        },
      },
      {
        name: 'role',
        type: 'text',
        required: true,
        label: 'Role',
        admin: {
          description: 'The role of the user being invited.',
          readOnly: true,
        },
      },
      {
        name: 'status',
        type: 'text',
        required: true,
        defaultValue: 'pending',
        label: 'Status',
        admin: {
          description: 'The status of the invitation.',
          readOnly: true,
        },
      },
      {
        name: 'expiresAt',
        type: 'date',
        required: true,
        label: 'Expires At',
        admin: {
          description: 'The date and time when the invitation will expire.',
          readOnly: true,
        },
      },
      ...getTimestampFields(),
    ],
  }

  return invitationCollection
}
