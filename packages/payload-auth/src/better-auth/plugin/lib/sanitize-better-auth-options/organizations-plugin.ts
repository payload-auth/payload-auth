import { baModelKey, baModelFieldKeys } from '@/better-auth/plugin/constants'
import { CollectionConfig } from 'payload'
import { getMappedCollection, getMappedField } from '../../helpers/get-collection'

export function configureOrganizationPlugin(plugin: any, collectionMap: Record<string, CollectionConfig>): void {
  const organizationCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.organization })
  const memberCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.member })
  const invitationCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.invitation })
  const teamCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.team })
  const sessionCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.session })

  plugin.schema = plugin?.schema ?? {}

  // Initialize missing schema objects
  Array.from([baModelKey.organization, baModelKey.member, baModelKey.invitation, baModelKey.team, baModelKey.session]).forEach((key) => {
    if (!plugin.schema[key]) plugin.schema[key] = {}
  })

  plugin.schema = {
    ...plugin?.schema,
    organization: {
      ...plugin?.schema?.organization,
      modelName: organizationCollection.slug,
      fields: { ...(plugin?.schema?.organization?.fields ?? {}) }
    },
    member: {
      ...plugin?.schema?.member,
      modelName: memberCollection.slug,
      fields: {
        ...(plugin?.schema?.member?.fields ?? {}),
        organizationId: {
          ...(plugin?.schema?.member?.fields?.organizationId ?? {}),
          fieldName: getMappedField({
            collection: memberCollection,
            betterAuthFieldKey: baModelFieldKeys.member.organizationId
          }).name
        },
        userId: {
          ...(plugin?.schema?.member?.fields?.userId ?? {}),
          fieldName: getMappedField({
            collection: memberCollection,
            betterAuthFieldKey: baModelFieldKeys.member.userId
          }).name
        },
        teamId: {
          ...(plugin?.schema?.member?.fields?.teamId ?? {}),
          fieldName: getMappedField({
            collection: memberCollection,
            betterAuthFieldKey: baModelFieldKeys.member.teamId
          }).name
        }
      }
    },
    invitation: {
      ...plugin.schema.invitation,
      modelName: invitationCollection.slug,
      fields: {
        ...(plugin?.schema?.invitation?.fields ?? {}),
        organizationId: {
          ...(plugin?.schema?.invitation?.fields?.organizationId ?? {}),
          fieldName: getMappedField({
            collection: invitationCollection,
            betterAuthFieldKey: baModelFieldKeys.invitation.organizationId
          }).name
        },
        inviterId: {
          ...(plugin?.schema?.invitation?.fields?.inviterId ?? {}),
          fieldName: getMappedField({
            collection: invitationCollection,
            betterAuthFieldKey: baModelFieldKeys.invitation.inviterId
          }).name
        },
        teamId: {
          ...(plugin?.schema?.invitation?.fields?.teamId ?? {}),
          fieldName: getMappedField({
            collection: invitationCollection,
            betterAuthFieldKey: baModelFieldKeys.invitation.teamId
          }).name
        }
      }
    },
    team: {
      ...plugin.schema.team,
      modelName: teamCollection.slug,
      fields: {
        ...(plugin?.schema?.team?.fields ?? {}),
        organizationId: {
          ...(plugin?.schema?.team?.fields?.organizationId ?? {}),
          fieldName: getMappedField({
            collection: teamCollection,
            betterAuthFieldKey: baModelFieldKeys.team.organizationId
          }).name
        }
      }
    },
    session: {
      ...plugin?.schema?.session,
      modelName: sessionCollection.slug,
      fields: {
        ...(plugin?.schema?.session?.fields ?? {}),
        activeOrganizationId: {
          ...(plugin?.schema?.session?.fields?.activeOrganizationId ?? {}),
          fieldName: getMappedField({
            collection: sessionCollection,
            betterAuthFieldKey: baModelFieldKeys.session.activeOrganizationId
          }).name
        }
      }
    }
  }
}
