import type { BetterAuthPluginOptions } from '../../types'
import { baModelKey } from '../../constants'
import { getTimestampFields } from './utils/get-timestamp-fields'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getPayloadFieldsFromBetterAuthSchema } from './utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import type { FieldAttribute } from 'better-auth/db'
import type { Field, CollectionConfig } from 'payload'
import { FieldRule } from './utils/model-field-transformations'

export function buildPasskeysCollection({ pluginOptions }: { pluginOptions: BetterAuthPluginOptions }): CollectionConfig {
  const passkeySlug = getDeafultCollectionSlug({ modelKey: baModelKey.passkey, pluginOptions })

  const fieldOverrides: Record<string, (field: FieldAttribute) => Partial<Field>> = {
    name: () => ({
      admin: { readOnly: true, description: 'The name of the passkey' }
    }),
    publicKey: () => ({
      index: true,
      admin: { readOnly: true, description: 'The public key of the passkey' }
    }),
    user: () => ({
      index: true,
      admin: { readOnly: true, description: 'The user that the passkey belongs to' }
    }),
    credentialID: () => ({
      admin: { readOnly: true, description: 'The unique identifier of the registered credential' }
    }),
    counter: () => ({
      required: true,
      admin: { readOnly: true, description: 'The counter of the passkey' }
    }),
    deviceType: () => ({
      required: true,
      admin: { readOnly: true, description: 'The type of device used to register the passkey' }
    }),
    backedUp: () => ({
      required: true,
      admin: { readOnly: true, description: 'Whether the passkey is backed up' }
    }),
    transports: () => ({
      required: true,
      admin: { readOnly: true, description: 'The transports used to register the passkey' }
    })
  }

  const passkeyFieldRules: FieldRule[] = [
    {
      model: baModelKey.passkey,
      condition: (field) => field.type === 'date',
      transform: (field) => ({
        ...field,
        saveToJWT: false,
        admin: {
          disableBulkEdit: true,
          hidden: true
        },
        index: true,
        label: ({ t }: any) => t('general:updatedAt')
      })
    }
  ]

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    model: baModelKey.passkey,
    betterAuthOptions: pluginOptions.betterAuthOptions ?? {},
    fieldRules: passkeyFieldRules,
    additionalProperties: fieldOverrides
  })

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
    fields: [...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.passkeys === 'function') {
    passkeyCollection = pluginOptions.pluginCollectionOverrides.passkeys({
      collection: passkeyCollection
    })
  }

  return passkeyCollection
}
