import type { CollectionConfig } from 'payload'
import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'
import type { Invitation } from '@/better-auth/generated-types'

export function buildInvitationsCollection({ pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const invitationSlug = getDeafultCollectionSlug({ modelKey: baModelKey.invitation, pluginOptions })

  const fieldOverrides: FieldOverrides<keyof Invitation> = {
    email: () => ({
      index: true,
      admin: { readOnly: true, description: 'The email of the user being invited.' }
    }),
    inviterId: () => ({
      admin: { readOnly: true, description: 'The user who invited the user.' }
    }),
    teamId: () => ({
      index: true,
      admin: { readOnly: true, description: 'The team that the user is being invited to.' }
    }),
    organizationId: () => ({
      index: true,
      admin: { readOnly: true, description: 'The organization that the user is being invited to.' }
    }),
    role: () => ({
      admin: { readOnly: true, description: 'The role of the user being invited.' }
    }),
    status: () => ({
      defaultValue: 'pending',
      admin: { readOnly: true, description: 'The status of the invitation.' }
    }),
    expiresAt: () => ({
      admin: { readOnly: true, description: 'The date and time when the invitation will expire.' }
    })
  }

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    schema,
    additionalProperties: fieldOverrides
  })

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
    fields: [...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.invitations === 'function') {
    invitationCollection = pluginOptions.pluginCollectionOverrides.invitations({
      collection: invitationCollection
    })
  }

  return invitationCollection
}
