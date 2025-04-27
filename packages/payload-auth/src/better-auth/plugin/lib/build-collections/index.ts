import type { CollectionConfig } from 'payload'
import { baModelKey, baseSlugs } from '../../constants'
import { getBetterAuthSchema } from '../../helpers/get-better-auth-schema'
import { CollectionSchemaMap } from '../../helpers/get-collection-schema-map'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { BetterAuthPluginOptions, BuildCollectionProps, BuildSchema } from '../../types'
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
    [baModelKey.user]: (props: BuildCollectionProps) => buildUsersCollection(props),
    [baModelKey.account]: (props: BuildCollectionProps) => buildAccountsCollection(props),
    [baModelKey.session]: (props: BuildCollectionProps) => buildSessionsCollection(props),
    [baModelKey.verification]: (props: BuildCollectionProps) => buildVerificationsCollection(props),
    [baseSlugs.adminInvitations]: (props: BuildCollectionProps) => buildAdminInvitationsCollection(props),
    [baModelKey.organization]: (props: BuildCollectionProps) => buildOrganizationsCollection(props),
    [baModelKey.member]: (props: BuildCollectionProps) => buildMembersCollection(props),
    [baModelKey.invitation]: (props: BuildCollectionProps) => buildInvitationsCollection(props),
    [baModelKey.team]: (props: BuildCollectionProps) => buildTeamsCollection(props),
    [baModelKey.jwks]: (props: BuildCollectionProps) => buildJwksCollection(props),
    [baModelKey.apikey]: (props: BuildCollectionProps) => buildApiKeysCollection(props),
    [baModelKey.twoFactor]: (props: BuildCollectionProps) => buildTwoFactorsCollection(props),
    [baModelKey.oauthAccessToken]: (props: BuildCollectionProps) => buildOauthAccessTokensCollection(props),
    [baModelKey.oauthApplication]: (props: BuildCollectionProps) => buildOauthApplicationsCollection(props),
    [baModelKey.oauthConsent]: (props: BuildCollectionProps) => buildOauthConsentsCollection(props),
    [baModelKey.passkey]: (props: BuildCollectionProps) => buildPasskeysCollection(props),
    [baModelKey.ssoProvider]: (props: BuildCollectionProps) => buildSsoProvidersCollection(props),
    [baModelKey.subscription]: (props: BuildCollectionProps) => buildSubscriptionsCollection(props)
  }

  const collectionMap: Record<string, CollectionConfig> = {}
  Object.entries(collectionSchemaMap).forEach(([modelKey, { collectionSlug }]) => {
    const builder = collectionBuilders[modelKey as keyof typeof collectionBuilders]
    if (builder) {
      collectionMap[collectionSlug] = builder({
        incomingCollections,
        pluginOptions,
        schema: getModelSchema(modelKey)
      })
    }
  })

  // Add adminInvitations collection as it's not in the collectionSchemaMap
  const adminInvitationsSlug = getDeafultCollectionSlug({
    modelKey: baseSlugs.adminInvitations,
    pluginOptions
  })
  collectionMap[adminInvitationsSlug] = collectionBuilders[baseSlugs.adminInvitations]({
    incomingCollections,
    pluginOptions,
    schema: {
      fields: {},
      order: 0
    }
  })

  // Then add incoming collections that don't conflict with required ones
  incomingCollections.forEach((c) => {
    if (!collectionMap[c.slug]) {
      collectionMap[c.slug] = c
    }
  })

  return collectionMap
}
