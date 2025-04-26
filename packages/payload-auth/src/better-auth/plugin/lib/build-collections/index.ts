import { CollectionConfig } from 'payload'
import { baseSlugs, baModelKeyToSlug } from '../../constants'
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

/**
 * Builds the required collections based on the BetterAuth options and plugins
 */
export function buildCollectionMap({
  incomingCollections,
  requiredCollectionSlugs,
  pluginOptions
}: {
  incomingCollections: CollectionConfig[]
  requiredCollectionSlugs: string[]
  pluginOptions: BetterAuthPluginOptions
}): Record<string, CollectionConfig> {
  const buildCollectionMap = {
    [baModelKeyToSlug.user]: () => buildUsersCollection({ incomingCollections, pluginOptions, collectionMap }),
    [baModelKeyToSlug.account]: () => buildAccountsCollection({ incomingCollections, pluginOptions, collectionMap }),
    [baModelKeyToSlug.session]: () => buildSessionsCollection({ incomingCollections, pluginOptions }),
    [baModelKeyToSlug.verification]: () => buildVerificationsCollection({ incomingCollections, pluginOptions }),
    [baseSlugs.adminInvitations]: () => buildAdminInvitationsCollection({ incomingCollections, pluginOptions }),
    [baModelKeyToSlug.organization]: () => buildOrganizationsCollection({ pluginOptions }),
    [baModelKeyToSlug.member]: () => buildMembersCollection({ pluginOptions }),
    [baModelKeyToSlug.invitation]: () => buildInvitationsCollection({ pluginOptions }),
    [baModelKeyToSlug.team]: () => buildTeamsCollection({ pluginOptions }),
    [baModelKeyToSlug.jwks]: () => buildJwksCollection({ pluginOptions }),
    [baModelKeyToSlug.apikey]: () => buildApiKeysCollection({ pluginOptions }),
    [baModelKeyToSlug.twoFactor]: () => buildTwoFactorsCollection({ pluginOptions }),
    [baModelKeyToSlug.oauthAccessToken]: () => buildOauthAccessTokensCollection({ pluginOptions }),
    [baModelKeyToSlug.oauthApplication]: () => buildOauthApplicationsCollection({ pluginOptions }),
    [baModelKeyToSlug.oauthConsent]: () => buildOauthConsentsCollection({ pluginOptions }),
    [baModelKeyToSlug.passkey]: () => buildPasskeysCollection({ pluginOptions }),
    [baModelKeyToSlug.ssoProvider]: () => buildSsoProvidersCollection({ pluginOptions }),
    [baModelKeyToSlug.subscription]: () => buildSubscriptionsCollection({ pluginOptions })
  }

  // Build required collections into a map
  const collectionMap: Record<string, CollectionConfig> = {}

  // First add all required collections
  requiredCollectionSlugs.forEach((slug) => {
    collectionMap[slug] = buildCollectionMap[slug as keyof typeof buildCollectionMap]()
  })

  // Then add incoming collections that don't conflict with required ones
  incomingCollections.forEach((c) => {
    if (!collectionMap[c.slug]) {
      collectionMap[c.slug] = c
    }
  })

  return collectionMap
}
