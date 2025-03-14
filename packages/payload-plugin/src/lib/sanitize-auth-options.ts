import type { AdminOptions } from 'better-auth/plugins/admin'
import type { PasskeyOptions } from 'better-auth/plugins/passkey'
import type { OrganizationOptions } from 'better-auth/plugins/organization'
import type { PayloadBetterAuthPluginOptions, SanitizedBetterAuthOptions } from '../types.js'
import { supportedBetterAuthPluginIds, betterAuthPluginSlugs } from './config.js'

/**
 * Sanitizes the BetterAuth options
 */
export function sanitizeBetterAuthOptions(
  options: PayloadBetterAuthPluginOptions,
): SanitizedBetterAuthOptions {
  const baOptions = options.betterAuthOptions
  const userCollectionSlug = options.users?.slug ?? 'users'
  const accountCollectionSlug = options.accounts?.slug ?? 'accounts'
  const sessionCollectionSlug = options.sessions?.slug ?? 'sessions'
  const verificationCollectionSlug = options.verifications?.slug ?? 'verifications'

  const res: SanitizedBetterAuthOptions = { ...baOptions }

  res.user = {
    ...baOptions?.user,
    modelName: userCollectionSlug,
  }

  res.account = {
    ...baOptions?.account,
    modelName: accountCollectionSlug,
    fields: {
      userId: 'user',
    },
  }

  res.session = {
    ...baOptions?.session,
    modelName: sessionCollectionSlug,
    fields: {
      userId: 'user',
    },
  }

  res.verification = {
    ...baOptions?.verification,
    modelName: verificationCollectionSlug,
  }

  if (res.plugins) {
    try {
      const supportedPlugins = res.plugins.filter((plugin) => {
        return supportedBetterAuthPluginIds.includes(
          plugin.id as (typeof supportedBetterAuthPluginIds)[number],
        )
      })

      if (supportedPlugins.length !== res.plugins.length) {
        console.warn(
          `Unsupported BetterAuth plugins detected: ${res.plugins
            .filter(
              (p) =>
                !supportedBetterAuthPluginIds.includes(
                  p.id as (typeof supportedBetterAuthPluginIds)[number],
                ),
            )
            .map((p) => p.id)
            .join(', ')}. Supported plugins are: ${supportedBetterAuthPluginIds.join(', ')}. 
            These plugins will be ignored.`,
        )
      }

      // Add the schema to the supported plugins
      if (supportedPlugins.length > 0) {
        supportedPlugins.forEach((plugin) => {
          const pluginId = plugin.id as (typeof supportedBetterAuthPluginIds)[number]

          switch (pluginId) {
            case 'admin':
              ;(plugin as AdminOptions & { id: string }).schema = {
                ...plugin.schema,
                user: {
                  modelName: userCollectionSlug,
                  fields: { ...(plugin.schema?.user?.fields ?? {}) },
                },
                session: {
                  modelName: sessionCollectionSlug,
                  fields: { ...(plugin.schema?.session?.fields ?? {}) },
                },
              }
              ;(plugin as AdminOptions & { id: string }).adminRoles =
                options.users?.adminRoles ?? undefined
              break
            case 'api-key':
              // @ts-ignore They havent exported the types for this
              plugin.schema.apikey = {
                modelName: betterAuthPluginSlugs.apiKeys,
                // @ts-ignore They havent exported the types for this
                fields: { ...(plugin.schema?.apikey?.fields ?? {}), userId: 'user' },
              }
              break
            case 'passkey':
              ;(plugin as PasskeyOptions & { id: string }).schema = {
                ...plugin.schema,
                passkey: {
                  ...(plugin.schema?.passkey ?? {}),
                  modelName: betterAuthPluginSlugs.passkeys,
                  fields: { ...(plugin.schema?.passkey?.fields ?? {}), userId: 'user' },
                },
              }
              break
            case 'organization':
              const orgPlugin = plugin as OrganizationOptions & { id: string }
              orgPlugin.schema = {
                ...orgPlugin.schema,
                session: {
                  fields: {
                    activeOrganizationId: 'activeOrganization',
                  },
                },
                team: {
                  ...(orgPlugin.schema?.team ?? {}),
                  modelName: betterAuthPluginSlugs.teams,
                  fields: {
                    ...(orgPlugin.schema?.team?.fields ?? {}),
                    organizationId: 'organization',
                  },
                },
                organization: {
                  ...(orgPlugin.schema?.organization ?? {}),
                  modelName: betterAuthPluginSlugs.organizations,
                  fields: { ...(orgPlugin.schema?.organization?.fields ?? {}) },
                },
                member: {
                  ...(orgPlugin.schema?.member ?? {}),
                  modelName: betterAuthPluginSlugs.members,
                  fields: {
                    ...(orgPlugin.schema?.member?.fields ?? {}),
                    teamId: 'team',
                    organizationId: 'organization',
                    userId: 'user',
                  },
                },
                invitation: {
                  ...(orgPlugin.schema?.invitation ?? {}),
                  modelName: betterAuthPluginSlugs.invitations,
                  fields: {
                    ...(orgPlugin.schema?.invitation?.fields ?? {}),
                    organizationId: 'organization',
                    inviterId: 'inviter',
                    teamId: 'team',
                  },
                },
              }
              Object.assign(plugin, orgPlugin)
              break
            default:
              break
          }
        })
      }
      // Make sure only the supported plugins are used
      res.plugins = [...supportedPlugins]
    } catch (error) {
      throw new Error(`Error sanitizing BetterAuth plugins: ${error}`)
    }
  }

  return res
}
