import { baModelFieldKeysToFieldNames, baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'
import { getDeafultCollectionSlug } from '../../helpers/get-collection-slug'
import { assertAllSchemaFields, getSchemaFieldName } from './utils/collection-schema'

import type { CollectionConfig } from 'payload'
import type { Passkey } from '@/better-auth/generated-types'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'
import { isAdminOrCurrentUserWithRoles, isAdminWithRoles } from './utils/payload-access'

export function buildPasskeysCollection({ incomingCollections, pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const passkeySlug = getDeafultCollectionSlug({ modelKey: baModelKey.passkey, pluginOptions })

  const existingPasskeyCollection = incomingCollections.find((collection) => collection.slug === passkeySlug) as
    | CollectionConfig
    | undefined

  const fieldOverrides: FieldOverrides<keyof Passkey> = {
    name: () => ({
      admin: { readOnly: true, description: 'The name of the passkey' }
    }),
    publicKey: () => ({
      index: true,
      admin: { readOnly: true, description: 'The public key of the passkey' }
    }),
    userId: () => ({
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

  const collectionFields = getCollectionFields({
    schema,
    additionalProperties: fieldOverrides
  })

  let passkeyCollection: CollectionConfig = {
    ...existingPasskeyCollection,
    slug: passkeySlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: 'name',
      description: 'Passkeys are used to authenticate users',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingPasskeyCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      read: isAdminOrCurrentUserWithRoles({
        idField: schema?.fields?.userId?.fieldName ?? baModelFieldKeysToFieldNames.passkey.userId,
        adminRoles: pluginOptions.users?.adminRoles ?? ['admin']
      }),
      ...(existingPasskeyCollection?.access ?? {})
    },
    custom: {
      ...(existingPasskeyCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.passkey
    },
    fields: [...(existingPasskeyCollection?.fields ?? []), ...(collectionFields ?? [])]
  }

  if (typeof pluginOptions.pluginCollectionOverrides?.passkeys === 'function') {
    passkeyCollection = pluginOptions.pluginCollectionOverrides.passkeys({
      collection: passkeyCollection
    })
  }

  assertAllSchemaFields(passkeyCollection, schema)

  return passkeyCollection
}
