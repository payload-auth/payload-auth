import type { CollectionConfig } from 'payload'
import { baModelKey, baseSlugs } from '../../constants'
import { getBetterAuthSchema } from '../../helpers/get-better-auth-schema'
import { CollectionSchemaMap } from '../../helpers/get-collection-schema-map'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { BetterAuthPluginOptions } from '../../types'
import { buildAccountsCollection } from './accounts/index'
import { buildAdminInvitationsCollection } from './admin-invitations'
import { buildApiKeysCollection } from './api-keys'
import { buildInvitationsCollection } from './invitations'
import { buildJwksCollection } from './jwks'
import { buildMembersCollection } from './members'
import { buildOauthAccessTokensCollection } from './oauth-access-tokens'
import { buildOauthApplicationsCollection } from './oauth-applications'
import { buildOauthConsentsCollection } from './oauth-consents'
import { buildOrganizationsCollection } from './organizations'
import { buildPasskeysCollection } from './passkeys'
import { buildSessionsCollection } from './sessions'
import { buildSsoProvidersCollection } from './sso-providers'
import { buildSubscriptionsCollection } from './subscriptions'
import { buildTeamsCollection } from './teams'
import { buildTwoFactorsCollection } from './two-factors'
import { buildUsersCollection } from './users/index'
import { buildVerificationsCollection } from './verifications'

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
  const schema = getBetterAuthSchema(pluginOptions.betterAuthOptions ?? {})

  const getModelSchema = (modelKey: string) => schema[collectionSchemaMap[modelKey as keyof CollectionSchemaMap]?.collectionSlug]

  const collectionBuilders = {
    [baModelKey.user]: () =>
      buildUsersCollection({
        incomingCollections,
        pluginOptions,
        schema: getModelSchema(baModelKey.user)
      }),
    [baModelKey.account]: () =>
      buildAccountsCollection({
        incomingCollections,
        pluginOptions,
        schema: getModelSchema(baModelKey.account)
      }),
    [baModelKey.session]: () =>
      buildSessionsCollection({
        incomingCollections,
        pluginOptions,
        schema: getModelSchema(baModelKey.session)
      }),
    [baModelKey.verification]: () =>
      buildVerificationsCollection({
        incomingCollections,
        pluginOptions,
        schema: getModelSchema(baModelKey.verification)
      }),
    [baseSlugs.adminInvitations]: () =>
      buildAdminInvitationsCollection({
        incomingCollections,
        pluginOptions
      }),
    [baModelKey.organization]: () =>
      buildOrganizationsCollection({
        pluginOptions,
        schema: getModelSchema(baModelKey.organization)
      }),
    [baModelKey.member]: () =>
      buildMembersCollection({
        pluginOptions,
        schema: getModelSchema(baModelKey.member)
      }),
    [baModelKey.invitation]: () =>
      buildInvitationsCollection({
        pluginOptions,
        schema: getModelSchema(baModelKey.invitation)
      }),
    [baModelKey.team]: () =>
      buildTeamsCollection({
        pluginOptions,
        schema: getModelSchema(baModelKey.team)
      }),
    [baModelKey.jwks]: () =>
      buildJwksCollection({
        pluginOptions,
        schema: getModelSchema(baModelKey.jwks)
      }),
    [baModelKey.apikey]: () =>
      buildApiKeysCollection({
        pluginOptions,
        schema: getModelSchema(baModelKey.apikey)
      }),
    [baModelKey.twoFactor]: () =>
      buildTwoFactorsCollection({
        pluginOptions,
        schema: getModelSchema(baModelKey.twoFactor)
      }),
    [baModelKey.oauthAccessToken]: () =>
      buildOauthAccessTokensCollection({
        pluginOptions,
        schema: getModelSchema(baModelKey.oauthAccessToken)
      }),
    [baModelKey.oauthApplication]: () =>
      buildOauthApplicationsCollection({
        pluginOptions,
        schema: getModelSchema(baModelKey.oauthApplication)
      }),
    [baModelKey.oauthConsent]: () =>
      buildOauthConsentsCollection({
        pluginOptions,
        schema: getModelSchema(baModelKey.oauthConsent)
      }),
    [baModelKey.passkey]: () =>
      buildPasskeysCollection({
        pluginOptions,
        schema: getModelSchema(baModelKey.passkey)
      }),
    [baModelKey.ssoProvider]: () =>
      buildSsoProvidersCollection({
        pluginOptions,
        schema: getModelSchema(baModelKey.ssoProvider)
      }),
    [baModelKey.subscription]: () =>
      buildSubscriptionsCollection({
        pluginOptions,
        schema: getModelSchema(baModelKey.subscription)
      })
  }

  const collectionMap: Record<string, CollectionConfig> = {}
  Object.entries(collectionSchemaMap).forEach(([modelKey, { collectionSlug }]) => {
    const builder = collectionBuilders[modelKey as keyof typeof collectionBuilders]
    if (builder) {
      collectionMap[collectionSlug] = builder()
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
