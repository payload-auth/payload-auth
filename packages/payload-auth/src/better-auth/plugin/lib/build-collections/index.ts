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
import { getAuthTables } from 'better-auth/db'
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
  const tables = getAuthTables(pluginOptions.betterAuthOptions ?? {})

  // Log the tables model names and field names with their keys
  console.log('BetterAuth Tables:')
  Object.entries(tables).forEach(([modelName, model]) => {
    console.log(`Model: ${modelName}`)
    if (model.fields) {
      console.log('  Fields:')
      Object.entries(model.fields).forEach(([fieldKey, field]) => {
        console.log(`    ${fieldKey}: ${field.fieldName}`)
      })
    }
  })

  const collectionBuilders = {
    [baModelKey.user]: () => buildUsersCollection({ incomingCollections, pluginOptions }),
    [baModelKey.account]: () => buildAccountsCollection({ incomingCollections, pluginOptions }),
    [baModelKey.session]: () => buildSessionsCollection({ incomingCollections, pluginOptions }),
    [baModelKey.verification]: () => buildVerificationsCollection({ incomingCollections, pluginOptions }),
    [baseSlugs.adminInvitations]: () => buildAdminInvitationsCollection({ incomingCollections, pluginOptions }),
    [baModelKey.organization]: () => buildOrganizationsCollection({ pluginOptions }),
    [baModelKey.member]: () => buildMembersCollection({ pluginOptions }),
    [baModelKey.invitation]: () => buildInvitationsCollection({ pluginOptions }),
    [baModelKey.team]: () => buildTeamsCollection({ pluginOptions }),
    [baModelKey.jwks]: () => buildJwksCollection({ pluginOptions }),
    [baModelKey.apikey]: () => buildApiKeysCollection({ pluginOptions }),
    [baModelKey.twoFactor]: () => buildTwoFactorsCollection({ pluginOptions }),
    [baModelKey.oauthAccessToken]: () => buildOauthAccessTokensCollection({ pluginOptions }),
    [baModelKey.oauthApplication]: () => buildOauthApplicationsCollection({ pluginOptions }),
    [baModelKey.oauthConsent]: () => buildOauthConsentsCollection({ pluginOptions }),
    [baModelKey.passkey]: () => buildPasskeysCollection({ pluginOptions }),
    [baModelKey.ssoProvider]: () => buildSsoProvidersCollection({ pluginOptions }),
    [baModelKey.subscription]: () => buildSubscriptionsCollection({ pluginOptions })
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

  console.log('Collection Map:')
  Object.entries(collectionMap).forEach(([slug, collection]) => {
    const relationshipFields = collection.fields?.filter(
      (field) =>
        field.type === 'relationship' || (field.type === 'array' && field.fields?.some((subField) => subField.type === 'relationship'))
    )

    if (relationshipFields && relationshipFields.length > 0) {
      console.log(`Collection ${slug} has relationship fields:`)
      relationshipFields.forEach((field: any) => {
        console.log(
          `  - ${field.name}: ${
            field.type === 'relationship'
              ? `relationTo: ${Array.isArray(field.relationTo) ? field.relationTo.join(', ') : field.relationTo}`
              : 'array with relationship fields'
          }`
        )
      })
    }
  })

  return collectionMap
}
