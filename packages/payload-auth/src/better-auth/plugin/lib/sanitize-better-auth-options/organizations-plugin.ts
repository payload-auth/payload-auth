import { baModelKey, baModelFieldKeys } from '@/better-auth/plugin/constants'
import type { CollectionConfig } from 'payload'
import { getMappedCollection, getMappedField } from '../../helpers/get-collection'
import { CollectionSchemaMap } from '../../helpers/get-collection-schema-map'

export function configureOrganizationPlugin(plugin: any, collectionSchemaMap: CollectionSchemaMap): void {
  plugin.schema = plugin?.schema ?? {}

  // Initialize missing schema objects
  Array.from([baModelKey.organization, baModelKey.member, baModelKey.invitation, baModelKey.team, baModelKey.session]).forEach((key) => {
    if (!plugin.schema[key]) plugin.schema[key] = {}
  })

  plugin.schema = {
    ...plugin?.schema,
    organization: {
      ...plugin?.schema?.organization,
      modelName: collectionSchemaMap[baModelKey.organization].collectionSlug,
      fields: { ...(plugin?.schema?.organization?.fields ?? {}) }
    },
    member: {
      ...plugin?.schema?.member,
      modelName: collectionSchemaMap[baModelKey.member].collectionSlug,
      fields: {
        ...(plugin?.schema?.member?.fields ?? {}),
        organizationId: {
          ...(plugin?.schema?.member?.fields?.organizationId ?? {}),
          fieldName: collectionSchemaMap[baModelKey.member].fields[baModelFieldKeys.member.organizationId]
        },
        userId: {
          ...(plugin?.schema?.member?.fields?.userId ?? {}),
          fieldName: collectionSchemaMap[baModelKey.member].fields[baModelFieldKeys.member.userId]
        },
        teamId: {
          ...(plugin?.schema?.member?.fields?.teamId ?? {}),
          fieldName: collectionSchemaMap[baModelKey.member].fields[baModelFieldKeys.member.teamId]
        }
      }
    },
    invitation: {
      ...plugin.schema.invitation,
      modelName: collectionSchemaMap[baModelKey.invitation].collectionSlug,
      fields: {
        ...(plugin?.schema?.invitation?.fields ?? {}),
        organizationId: {
          ...(plugin?.schema?.invitation?.fields?.organizationId ?? {}),
          fieldName: collectionSchemaMap[baModelKey.invitation].fields[baModelFieldKeys.invitation.organizationId]
        },
        inviterId: {
          ...(plugin?.schema?.invitation?.fields?.inviterId ?? {}),
          fieldName: collectionSchemaMap[baModelKey.invitation].fields[baModelFieldKeys.invitation.inviterId]
        },
        teamId: {
          ...(plugin?.schema?.invitation?.fields?.teamId ?? {}),
          fieldName: collectionSchemaMap[baModelKey.invitation].fields[baModelFieldKeys.invitation.teamId]
        }
      }
    },
    team: {
      ...plugin.schema.team,
      modelName: collectionSchemaMap[baModelKey.team].collectionSlug,
      fields: {
        ...(plugin?.schema?.team?.fields ?? {}),
        organizationId: {
          ...(plugin?.schema?.team?.fields?.organizationId ?? {}),
          fieldName: collectionSchemaMap[baModelKey.team].fields[baModelFieldKeys.team.organizationId]
        }
      }
    },
    session: {
      ...plugin?.schema?.session,
      modelName: collectionSchemaMap[baModelKey.session].collectionSlug,
      fields: {
        ...(plugin?.schema?.session?.fields ?? {}),
        activeOrganizationId: {
          ...(plugin?.schema?.session?.fields?.activeOrganizationId ?? {}),
          fieldName: collectionSchemaMap[baModelKey.session].fields[baModelFieldKeys.session.activeOrganizationId]
        }
      }
    }
  }
}
