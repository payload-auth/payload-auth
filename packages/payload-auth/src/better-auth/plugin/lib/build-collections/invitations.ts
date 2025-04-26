import type { CollectionConfig } from 'payload'
import type { BetterAuthPluginOptions } from '../../types'
import { baPluginSlugs, baseSlugs, baModelKey, baModelFieldKeys } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'

export function buildInvitationsCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const invitationSlug = baPluginSlugs.invitations
  const userSlug = pluginOptions.users?.slug ?? baseSlugs.users
  const organizationSlug = baPluginSlugs.organizations

  let invitationCollection: CollectionConfig = {
    slug: invitationSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'email',
      description: 'Invitations to join an organization',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    custom: {
      betterAuthModelKey: baModelKey.invitation
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
          readOnly: true
        },
        custom: {
          betterAuthFieldKey: 'email'
        }
      },
      {
        name: 'inviter',
        type: 'relationship',
        relationTo: userSlug,
        required: true,
        label: 'Inviter',
        admin: {
          description: 'The user who invited the user.',
          readOnly: true
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.invitation.inviterId
        }
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
          readOnly: true
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.invitation.organizationId
        }
      },
      {
        name: 'role',
        type: 'text',
        required: true,
        label: 'Role',
        admin: {
          description: 'The role of the user being invited.',
          readOnly: true
        },
        custom: {
          betterAuthFieldKey: 'role'
        }
      },
      {
        name: 'status',
        type: 'text',
        required: true,
        defaultValue: 'pending',
        label: 'Status',
        admin: {
          description: 'The status of the invitation.',
          readOnly: true
        },
        custom: {
          betterAuthFieldKey: 'status'
        }
      },
      {
        name: 'expiresAt',
        type: 'date',
        required: true,
        label: 'Expires At',
        admin: {
          description: 'The date and time when the invitation will expire.',
          readOnly: true
        },
        custom: {
          betterAuthFieldKey: 'expiresAt'
        }
      },
      ...getTimestampFields()
    ]
  }

  if (pluginOptions.pluginCollectionOverrides?.invitations) {
    invitationCollection = pluginOptions.pluginCollectionOverrides.invitations({
      collection: invitationCollection
    })
  }

  return invitationCollection
}
