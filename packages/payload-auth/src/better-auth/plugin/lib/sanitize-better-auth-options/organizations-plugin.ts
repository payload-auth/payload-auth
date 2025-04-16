import { baseCollectionSlugs, betterAuthPluginSlugs } from '@/better-auth/plugin/constants'

export function configureOrganizationPlugin(plugin: any) {
  plugin.schema = plugin?.schema ?? {}

  // Initialize missing schema objects
  ;['organization', 'member', 'invitation', 'team', 'session'].forEach((key) => {
    if (!plugin.schema[key]) plugin.schema[key] = {}
  })

  plugin.schema = {
    ...plugin?.schema,
    organization: {
      ...plugin?.schema?.organization,
      modelName: betterAuthPluginSlugs.organizations,
      fields: { ...(plugin?.schema?.organization?.fields ?? {}) }
    },
    member: {
      ...plugin?.schema?.member,
      modelName: betterAuthPluginSlugs.members,
      fields: {
        ...(plugin?.schema?.member?.fields ?? {}),
        organizationId: {
          ...(plugin?.schema?.member?.fields?.organizationId ?? {}),
          fieldName: 'organization'
        },
        userId: {
          ...(plugin?.schema?.member?.fields?.userId ?? {}),
          fieldName: 'user'
        },
        teamId: {
          ...(plugin?.schema?.member?.fields?.teamId ?? {}),
          fieldName: 'team'
        }
      }
    },
    invitation: {
      ...plugin.schema.invitation,
      modelName: betterAuthPluginSlugs.invitations,
      fields: {
        ...(plugin?.schema?.invitation?.fields ?? {}),
        organizationId: {
          ...(plugin?.schema?.invitation?.fields?.organizationId ?? {}),
          fieldName: 'organization'
        },
        inviterId: {
          ...(plugin?.schema?.invitation?.fields?.inviterId ?? {}),
          fieldName: 'inviter'
        },
        teamId: {
          ...(plugin?.schema?.invitation?.fields?.teamId ?? {}),
          fieldName: 'team'
        }
      }
    },
    team: {
      ...plugin.schema.team,
      modelName: betterAuthPluginSlugs.teams,
      fields: {
        ...(plugin?.schema?.team?.fields ?? {}),
        organizationId: {
          ...(plugin?.schema?.team?.fields?.organizationId ?? {}),
          fieldName: 'organization'
        }
      }
    },
    session: {
      ...plugin?.schema?.session,
      modelName: baseCollectionSlugs.sessions,
      fields: {
        ...(plugin?.schema?.session?.fields ?? {}),
        activeOrganizationId: {
          ...(plugin?.schema?.session?.fields?.activeOrganizationId ?? {}),
          fieldName: 'activeOrganization'
        }
      }
    }
  }
}
