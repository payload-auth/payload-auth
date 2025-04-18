import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { betterAuthPluginSlugs } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'

export function buildJwksCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }) {
  const jwksSlug = betterAuthPluginSlugs.jwks

  const jwksCollection: CollectionConfig = {
    slug: jwksSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'publicKey',
      description: 'JWKS are used to verify the signature of the JWT token',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    fields: [
      {
        name: 'publicKey',
        type: 'text',
        required: true,
        index: true,
        label: 'Public Key',
        admin: {
          description: 'The public part of the web key'
        }
      },
      {
        name: 'privateKey',
        type: 'text',
        required: true,
        label: 'Private Key',
        admin: {
          description: 'The private part of the web key'
        }
      },
      ...getTimestampFields()
    ]
  }

  return jwksCollection
}
