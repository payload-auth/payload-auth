import { baModelFieldKeys, baModelKey, defaults, supportedBAPluginIds } from '@/better-auth/plugin/constants'
import { configureAdminPlugin } from './admin-plugin'
import { configureApiKeyPlugin } from './api-key-plugin'
import { configureOidcPlugin } from './oidc-plugin'
import { configureOrganizationPlugin } from './organizations-plugin'
import { configurePasskeyPlugin } from './passkey-plugin'
import { configureSsoPlugin } from './sso-plugin'
import { ensurePasswordSetBeforeUserCreate } from './utils/ensure-password-set-before-create'
import { hashPassword, verifyPassword } from './utils/password'
import { saveToJwtMiddleware } from './utils/save-to-jwt-middleware'

import type { BetterAuthPluginOptions, SanitizedBetterAuthOptions } from '@/better-auth/plugin/types'
import type { Config, Payload } from 'payload'
import { buildCollectionSchemaMap, getDefaultCollectionSchemaMap } from '../../helpers/get-collection-schema-map'
import { configureTwoFactorPlugin } from './two-factor-plugin'
import { requireAdminInviteForSignUpMiddleware } from './utils/require-admin-invite-for-sign-up-middleware'

/**
 * Sanitizes the BetterAuth options
 */
export function sanitizeBetterAuthOptions({
  config,
  pluginOptions
}: {
  config: Payload['config'] | Config | Promise<Payload['config'] | Config>
  pluginOptions: BetterAuthPluginOptions
}): SanitizedBetterAuthOptions {
  const baOptions = pluginOptions.betterAuthOptions || {}

  // note we dont have adminInviations in here because it has no relation to better auth
  const collectionOverrides = {
    users: pluginOptions.users?.collectionOverrides,
    accounts: pluginOptions.accounts?.collectionOverrides,
    sessions: pluginOptions.sessions?.collectionOverrides,
    verifications: pluginOptions.verifications?.collectionOverrides,
    ...pluginOptions.pluginCollectionOverrides
  }

  const defaultCollectionSchemaMap = getDefaultCollectionSchemaMap(pluginOptions)
  const collectionSchemaMap = buildCollectionSchemaMap(collectionOverrides, defaultCollectionSchemaMap)

  // Initialize with base configuration
  let res: SanitizedBetterAuthOptions = {
    ...baOptions,
    user: {
      ...(baOptions.user || {}),
      modelName: collectionSchemaMap[baModelKey.user].collectionSlug,
      additionalFields: {
        ...(baOptions.user?.additionalFields || {}),
        role: {
          type: 'string',
          defaultValue: pluginOptions.users?.defaultRole || defaults.userRole,
          input: false
        }
      }
    },
    account: {
      ...(baOptions.account || {}),
      modelName: collectionSchemaMap[baModelKey.account].collectionSlug,
      fields: {
        userId: collectionSchemaMap[baModelKey.account].fields[baModelFieldKeys.account.userId]
      }
    },
    session: {
      ...(baOptions.session || {}),
      modelName: collectionSchemaMap[baModelKey.session].collectionSlug,
      fields: { userId: collectionSchemaMap[baModelKey.session].fields[baModelFieldKeys.session.userId] }
    },
    verification: {
      ...(baOptions.verification || {}),
      modelName: collectionSchemaMap[baModelKey.verification].collectionSlug
    },
    emailAndPassword: {
      ...(baOptions.emailAndPassword || {}),
      enabled: baOptions.emailAndPassword?.enabled ?? true
    }
  }

  // Configure password handling
  if (res.emailAndPassword?.enabled && !pluginOptions.disableDefaultPayloadAuth) {
    res.emailAndPassword.password = {
      ...(res.emailAndPassword.password || {}),
      verify: ({ hash, password }) => verifyPassword({ hash, password }),
      hash: (password) => hashPassword(password)
    }
  }

  // Handle admin invite for sign up
  if (pluginOptions.requireAdminInviteForSignUp) {
    res.socialProviders = res.socialProviders || {}
    res.socialProviders = Object.fromEntries(
      Object.entries(res.socialProviders).map(([provider, config]) => [provider, { ...config, disableImplicitSignUp: true }])
    )
    requireAdminInviteForSignUpMiddleware({
      options: res,
      pluginOptions
    })
  }

  // Handle verification email blocking
  if (pluginOptions.users?.blockFirstBetterAuthVerificationEmail && !pluginOptions.disableDefaultPayloadAuth) {
    const originalSendEmail = baOptions?.emailVerification?.sendVerificationEmail
    if (typeof originalSendEmail === 'function') {
      res.emailVerification = res.emailVerification || {}
      res.emailVerification.sendVerificationEmail = async (data, request) => {
        try {
          const timeSinceCreation = new Date().getTime() - new Date(data.user.createdAt).getTime()
          // Skip if user was created less than a minute ago (rely on Payload's email)
          if (timeSinceCreation >= 60000) {
            await originalSendEmail(data, request)
          }
        } catch (error) {
          console.error('Error sending verification email:', error)
        }
      }
    }
  }

  // Ensure password is set before user creation
  if (!pluginOptions.disableDefaultPayloadAuth) {
    ensurePasswordSetBeforeUserCreate(res)
  }

  // Process plugins
  if (res.plugins?.length) {
    try {
      // Filter to only supported plugins
      const supportedPlugins = res.plugins.filter((plugin) => Object.values(supportedBAPluginIds).includes(plugin.id as any))

      // Log warning for unsupported plugins
      if (supportedPlugins.length !== res.plugins.length) {
        const unsupportedIds = res.plugins
          .filter((p) => !Object.values(supportedBAPluginIds).includes(p.id as any))
          .map((p) => p.id)
          .join(', ')

        console.warn(`Unsupported BetterAuth plugins: ${unsupportedIds}. Supported: ${Object.values(supportedBAPluginIds).join(', ')}`)
      }

      // Configure plugins by type
      const pluginConfigurators = {
        [supportedBAPluginIds.admin]: (p: any) => configureAdminPlugin(p, pluginOptions),
        [supportedBAPluginIds.apiKey]: (p: any) => configureApiKeyPlugin(p, collectionSchemaMap),
        [supportedBAPluginIds.passkey]: (p: any) => configurePasskeyPlugin(p, collectionSchemaMap),
        [supportedBAPluginIds.organization]: (p: any) => configureOrganizationPlugin(p, collectionSchemaMap),
        [supportedBAPluginIds.sso]: (p: any) => configureSsoPlugin(p, collectionSchemaMap),
        [supportedBAPluginIds.oidc]: (p: any) => configureOidcPlugin(p, collectionSchemaMap),
        [supportedBAPluginIds.twoFactor]: (p: any) => configureTwoFactorPlugin(p, collectionSchemaMap)
      }

      supportedPlugins.forEach((plugin) => {
        const configurator = pluginConfigurators[plugin.id as keyof typeof pluginConfigurators]
        if (configurator) configurator(plugin as any)
      })

      res.plugins = supportedPlugins
    } catch (error) {
      throw new Error(`Error sanitizing BetterAuth plugins: ${error}`)
    }
  }

  saveToJwtMiddleware({
    sanitizedOptions: res,
    config,
    collectionSchemaMap
  })

  return res
}
