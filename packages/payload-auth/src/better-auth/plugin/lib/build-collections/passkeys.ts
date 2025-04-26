import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '../../types'
import { baseSlugs, baPluginSlugs, baModelKey, baModelFieldKeys } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'

export function buildPasskeysCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const passkeySlug = baPluginSlugs.passkeys
  const userSlug = pluginOptions.users?.slug ?? baseSlugs.users

  let passkeyCollection: CollectionConfig = {
    slug: passkeySlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'name',
      description: 'Passkeys are used to authenticate users',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth'
    },
    access: {
      ...getAdminAccess(pluginOptions)
    },
    custom: {
      betterAuthModelKey: baModelKey.passkey
    },
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Name',
        admin: {
          readOnly: true,
          description: 'The name of the passkey'
        },
        custom: {
          betterAuthFieldKey: 'name'
        }
      },
      {
        name: 'publicKey',
        type: 'text',
        required: true,
        index: true,
        label: 'Public Key',
        admin: {
          readOnly: true,
          description: 'The public key of the passkey'
        },
        custom: {
          betterAuthFieldKey: 'publicKey'
        }
      },
      {
        name: 'user',
        type: 'relationship',
        relationTo: userSlug,
        required: true,
        index: true,
        label: 'User',
        admin: {
          readOnly: true,
          description: 'The user that the passkey belongs to'
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.passkey.userId
        }
      },
      {
        name: 'credentialID',
        type: 'text',
        required: true,
        unique: true,
        label: 'Credential ID',
        admin: {
          readOnly: true,
          description: 'The unique identifier of the registered credential'
        },
        custom: {
          betterAuthFieldKey: 'credentialID'
        }
      },
      {
        name: 'counter',
        type: 'number',
        required: true,
        label: 'Counter',
        admin: {
          readOnly: true,
          description: 'The counter of the passkey'
        },
        custom: {
          betterAuthFieldKey: 'counter'
        }
      },
      {
        name: 'deviceType',
        type: 'text',
        required: true,
        label: 'Device Type',
        admin: {
          readOnly: true,
          description: 'The type of device used to register the passkey'
        },
        custom: {
          betterAuthFieldKey: 'deviceType'
        }
      },
      {
        name: 'backedUp',
        type: 'checkbox',
        required: true,
        label: 'Backed Up',
        admin: {
          readOnly: true,
          description: 'Whether the passkey is backed up'
        },
        custom: {
          betterAuthFieldKey: 'backedUp'
        }
      },
      {
        name: 'transports',
        type: 'text',
        required: true,
        label: 'Transports',
        admin: {
          readOnly: true,
          description: 'The transports used to register the passkey'
        },
        custom: {
          betterAuthFieldKey: 'transports'
        }
      },
      ...getTimestampFields()
    ]
  }

  if (pluginOptions.pluginCollectionOverrides?.passkeys) {
    passkeyCollection = pluginOptions.pluginCollectionOverrides.passkeys({
      collection: passkeyCollection
    })
  }

  return passkeyCollection
}
