import type { BetterAuthPluginOptions } from '../../types'
import { baModelKey } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { FieldAttribute } from 'better-auth/db'
import type { Field, CollectionConfig } from 'payload'

export function buildOauthApplicationsCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const oauthApplicationSlug = getDeafultCollectionSlug({ modelKey: baModelKey.oauthApplication, pluginOptions })

  const fieldOverrides: Record<string, (field: FieldAttribute) => Partial<Field>> = {
    clientId: () => ({
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Unique identifier for each OAuth client' }
    }),
    clientSecret: () => ({
      admin: { readOnly: true, description: 'Secret key for the OAuth client' }
    }),
    name: () => ({
      index: true,
      admin: { description: 'Name of the OAuth application' }
    }),
    redirectURLs: () => ({
      admin: { description: 'Comma-separated list of redirect URLs' }
    }),
    metadata: () => ({
      admin: { readOnly: true, description: 'Additional metadata for the OAuth application' }
    }),
    type: () => ({
      admin: { readOnly: true, description: 'Type of OAuth client (e.g., web, mobile)' }
    }),
    disabled: () => ({
      defaultValue: false,
      admin: { description: 'Indicates if the client is disabled' }
    }),
    icon: () => ({
      admin: { description: 'Icon of the OAuth application' }
    }),
    user: () => ({
      admin: { readOnly: true, description: 'ID of the user who owns the client. (optional)' }
    })
  }

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    model: baModelKey.oauthApplication,
    betterAuthOptions: pluginOptions.betterAuthOptions ?? {},
    additionalProperties: fieldOverrides
  })

  let oauthApplicationCollection: CollectionConfig = {
    slug: oauthApplicationSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'name',
      description: 'OAuth applications are custom OAuth clients',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    custom: {
      betterAuthModelKey: baModelKey.oauthApplication
    },
    fields: [...collectionFields, ...getTimestampFields()]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.oauthApplications === 'function') {
    oauthApplicationCollection = pluginOptions.pluginCollectionOverrides.oauthApplications({
      collection: oauthApplicationCollection
    })
  }

  return oauthApplicationCollection
}
