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
import { set } from '../../utils/set'
import { getSchemaCollectionSlug, getSchemaFieldName } from '../build-collections/utils/collection-schema'

import type { BetterAuthPluginOptions, SanitizedBetterAuthOptions } from '@/better-auth/plugin/types'
import type { Config, Payload } from 'payload'
import type { CollectionSchemaMap } from '../../helpers/get-collection-schema-map'
import { configureTwoFactorPlugin } from './two-factor-plugin'
import { requireAdminInviteForSignUpMiddleware } from './utils/require-admin-invite-for-sign-up-middleware'

/**
 * Sanitizes the BetterAuth options
 */
export function sanitizeBetterAuthOptions({
  config,
  pluginOptions,
  collectionSchemaMap
}: {
  config: Payload['config'] | Config | Promise<Payload['config'] | Config>
  pluginOptions: BetterAuthPluginOptions
  collectionSchemaMap: CollectionSchemaMap
}): SanitizedBetterAuthOptions {

  const betterAuthOptions: SanitizedBetterAuthOptions = { ...(pluginOptions.betterAuthOptions ?? {}) }

  set(betterAuthOptions, `${baModelKey.user}.modelName`, getSchemaCollectionSlug(collectionSchemaMap, baModelKey.user))
  set(betterAuthOptions, `${baModelKey.user}.additionalFields.role`, {
    type: 'string',
    defaultValue: pluginOptions.users?.defaultRole || defaults.userRole,
    input: false,
  })
  
  const baseModels = [baModelKey.account, baModelKey.session, baModelKey.verification] as const
  baseModels.forEach((model) =>
    set(betterAuthOptions, `${model}.modelName`, getSchemaCollectionSlug(collectionSchemaMap, model))
  )
  set(betterAuthOptions, `${baModelKey.account}.fields.userId`, getSchemaFieldName(collectionSchemaMap, baModelKey.account, baModelFieldKeys.account.userId))
  set(betterAuthOptions, `${baModelKey.session}.fields.userId`, getSchemaFieldName(collectionSchemaMap, baModelKey.session, baModelFieldKeys.session.userId))

  set(betterAuthOptions, `emailAndPassword.enabled`, betterAuthOptions.emailAndPassword?.enabled ?? true)

  // Configure password handling
  if (betterAuthOptions.emailAndPassword?.enabled && !pluginOptions.disableDefaultPayloadAuth) {
    betterAuthOptions.emailAndPassword.password = {
      ...(betterAuthOptions.emailAndPassword.password || {}),
      verify: ({ hash, password }) => verifyPassword({ hash, password }),
      hash: (password) => hashPassword(password)
    }
  }

  // Handle admin invite for sign up
  if (pluginOptions.requireAdminInviteForSignUp) {
    betterAuthOptions.socialProviders = betterAuthOptions.socialProviders || {}
    betterAuthOptions.socialProviders = Object.fromEntries(
      Object.entries(betterAuthOptions.socialProviders).map(([provider, config]) => [provider, { ...config, disableImplicitSignUp: true }])
    )
    requireAdminInviteForSignUpMiddleware({
      options: betterAuthOptions,
      pluginOptions
    })
  }

  // Handle verification email blocking
  if (pluginOptions.users?.blockFirstBetterAuthVerificationEmail && !pluginOptions.disableDefaultPayloadAuth) {
    const originalSendEmail = betterAuthOptions?.emailVerification?.sendVerificationEmail
    if (typeof originalSendEmail === 'function') {
      betterAuthOptions.emailVerification = betterAuthOptions.emailVerification || {}
      betterAuthOptions.emailVerification.sendVerificationEmail = async (data, request) => {
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
    ensurePasswordSetBeforeUserCreate(betterAuthOptions)
  }

  // Process plugins
  if (betterAuthOptions.plugins?.length) {
    try {
      // Filter to only supported plugins
      const supportedPlugins = betterAuthOptions.plugins.filter((plugin) => Object.values(supportedBAPluginIds).includes(plugin.id as any))

      // Log warning for unsupported plugins
      if (supportedPlugins.length !== betterAuthOptions.plugins.length) {
        const unsupportedIds = betterAuthOptions.plugins
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

      betterAuthOptions.plugins = supportedPlugins
    } catch (error) {
      throw new Error(`Error sanitizing BetterAuth plugins: ${error}`)
    }
  }

  saveToJwtMiddleware({
    sanitizedOptions: betterAuthOptions,
    config,
    collectionSchemaMap
  })

  return betterAuthOptions
}
