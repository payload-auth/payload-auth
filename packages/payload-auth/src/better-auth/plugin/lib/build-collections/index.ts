import type { CollectionConfig, FlattenedField } from 'payload'
import { baseSlugs, baModelKeyToSlug, baModelKey } from '../../constants'
import type { BetterAuthPluginOptions } from '../../types'
import { buildUsersCollection } from './users/index'
import { buildAccountsCollection } from './accounts/index'
import { buildSessionsCollection } from './sessions'
import { buildVerificationsCollection } from './verifications'
import { buildOrganizationsCollection } from './organizations'
import { buildMembersCollection } from './members'
import { buildInvitationsCollection } from './invitations'
import { buildTeamsCollection } from './teams'
import { buildJwksCollection } from './jwks'
import { buildApiKeysCollection } from './api-keys'
import { buildTwoFactorsCollection } from './two-factors'
import { buildOauthApplicationsCollection } from './oauth-applications'
import { buildOauthAccessTokensCollection } from './oauth-access-tokens'
import { buildOauthConsentsCollection } from './oauth-consents'
import { buildPasskeysCollection } from './passkeys'
import { buildSsoProvidersCollection } from './sso-providers'
import { buildAdminInvitationsCollection } from './admin-invitations'
import { buildSubscriptionsCollection } from './subscriptions'
import { getSchema } from 'better-auth/db'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import { CollectionSchemaMap } from '../../helpers/get-collection-schema-map'

/**
 * Builds the required collections based on the BetterAuth options and plugins
 */
export function buildCollectionMap({
  collectionSchemaMap,
  incomingCollections,
  pluginOptions
}: {
  collectionSchemaMap: CollectionSchemaMap
  incomingCollections: CollectionConfig[]
  pluginOptions: BetterAuthPluginOptions
}): Record<string, CollectionConfig> {
  const schema = getSchema(pluginOptions.betterAuthOptions ?? {})

  const userSchema = schema[collectionSchemaMap[baModelKey.user]?.collectionSlug]
  const accountSchema = schema[collectionSchemaMap[baModelKey.account]?.collectionSlug]
  const sessionSchema = schema[collectionSchemaMap[baModelKey.session]?.collectionSlug]
  const verificationSchema = schema[collectionSchemaMap[baModelKey.verification]?.collectionSlug]
  const organizationSchema = schema[collectionSchemaMap[baModelKey.organization]?.collectionSlug]
  const memberSchema = schema[collectionSchemaMap[baModelKey.member]?.collectionSlug]
  const invitationSchema = schema[collectionSchemaMap[baModelKey.invitation]?.collectionSlug]
  const teamSchema = schema[collectionSchemaMap[baModelKey.team]?.collectionSlug]
  const jwksSchema = schema[collectionSchemaMap[baModelKey.jwks]?.collectionSlug]
  const apiKeySchema = schema[collectionSchemaMap[baModelKey.apikey]?.collectionSlug]
  const twoFactorSchema = schema[collectionSchemaMap[baModelKey.twoFactor]?.collectionSlug]
  const oauthAccessTokenSchema = schema[collectionSchemaMap[baModelKey.oauthAccessToken]?.collectionSlug]
  const oauthApplicationSchema = schema[collectionSchemaMap[baModelKey.oauthApplication]?.collectionSlug]
  const oauthConsentSchema = schema[collectionSchemaMap[baModelKey.oauthConsent]?.collectionSlug]
  const passkeySchema = schema[collectionSchemaMap[baModelKey.passkey]?.collectionSlug]
  const ssoProviderSchema = schema[collectionSchemaMap[baModelKey.ssoProvider]?.collectionSlug]
  const subscriptionSchema = schema[collectionSchemaMap[baModelKey.subscription]?.collectionSlug]

  const collectionBuilders = {
    [baModelKey.user]: () => buildUsersCollection({ incomingCollections, pluginOptions, schema: userSchema }),
    [baModelKey.account]: () => buildAccountsCollection({ incomingCollections, pluginOptions, schema: accountSchema }),
    [baModelKey.session]: () => buildSessionsCollection({ incomingCollections, pluginOptions, schema: sessionSchema }),
    [baModelKey.verification]: () => buildVerificationsCollection({ incomingCollections, pluginOptions, schema: verificationSchema }),
    [baseSlugs.adminInvitations]: () => buildAdminInvitationsCollection({ incomingCollections, pluginOptions }),
    [baModelKey.organization]: () => buildOrganizationsCollection({ pluginOptions, schema: organizationSchema }),
    [baModelKey.member]: () => buildMembersCollection({ pluginOptions, schema: memberSchema }),
    [baModelKey.invitation]: () => buildInvitationsCollection({ pluginOptions, schema: invitationSchema }),
    [baModelKey.team]: () => buildTeamsCollection({ pluginOptions, schema: teamSchema }),
    [baModelKey.jwks]: () => buildJwksCollection({ pluginOptions, schema: jwksSchema }),
    [baModelKey.apikey]: () => buildApiKeysCollection({ pluginOptions, schema: apiKeySchema }),
    [baModelKey.twoFactor]: () => buildTwoFactorsCollection({ pluginOptions, schema: twoFactorSchema }),
    [baModelKey.oauthAccessToken]: () => buildOauthAccessTokensCollection({ pluginOptions, schema: oauthAccessTokenSchema }),
    [baModelKey.oauthApplication]: () => buildOauthApplicationsCollection({ pluginOptions, schema: oauthApplicationSchema }),
    [baModelKey.oauthConsent]: () => buildOauthConsentsCollection({ pluginOptions, schema: oauthConsentSchema }),
    [baModelKey.passkey]: () => buildPasskeysCollection({ pluginOptions, schema: passkeySchema }),
    [baModelKey.ssoProvider]: () => buildSsoProvidersCollection({ pluginOptions, schema: ssoProviderSchema }),
    [baModelKey.subscription]: () => buildSubscriptionsCollection({ pluginOptions, schema: subscriptionSchema })
  }

  const collectionMap: Record<string, CollectionConfig> = {}

  Object.entries(collectionSchemaMap).forEach(([modelKey, { collectionSlug, fields }]) => {
    if (collectionBuilders[modelKey as keyof typeof collectionBuilders]) {
      collectionMap[collectionSlug] = collectionBuilders[modelKey as keyof typeof collectionBuilders]()
    }
  })

  // Add adminInvitations collection as it's not in the collectionSchemaMap
  const adminInvitationsSlug = getDeafultCollectionSlug({
    modelKey: baseSlugs.adminInvitations,
    pluginOptions
  })
  collectionMap[adminInvitationsSlug] = collectionBuilders[baseSlugs.adminInvitations]()

  // Then add incoming collections that don't conflict with required ones
  incomingCollections.forEach((c) => {
    if (!collectionMap[c.slug]) {
      collectionMap[c.slug] = c
    }
  })

  return collectionMap
}
