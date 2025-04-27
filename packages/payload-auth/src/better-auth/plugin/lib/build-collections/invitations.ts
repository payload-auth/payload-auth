import type { FieldAttribute } from 'better-auth/db'
import type { CollectionConfig, Field } from 'payload'
import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { BetterAuthPluginOptions } from '../../types'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { FieldRule } from './utils/model-field-transformations'

export function buildInvitationsCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const invitationSlug = getDeafultCollectionSlug({ modelKey: baModelKey.invitation, pluginOptions })

  const fieldOverrides: Record<string, (field: FieldAttribute) => Partial<Field>> = {
    email: () => ({
      index: true,
      admin: { readOnly: true, description: 'The email of the user being invited.' }
    }),
    inviter: () => ({
      admin: { readOnly: true, description: 'The user who invited the user.' }
    }),
    teamId: () => ({
      index: true,
      admin: { readOnly: true, description: 'The team that the user is being invited to.' }
    }),
    organization: () => ({
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

  const invitationFieldRules: FieldRule[] = [
    {
      model: baModelKey.invitation,
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
    model: baModelKey.invitation,
    betterAuthOptions: pluginOptions.betterAuthOptions ?? {},
    fieldRules: invitationFieldRules,
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
