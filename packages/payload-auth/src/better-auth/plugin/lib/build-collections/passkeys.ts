import { baModelFieldKeysToFieldNames, baModelKey, defaults } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getSchemaCollectionSlug, getSchemaFieldName } from './utils/collection-schema'
import { assertAllSchemaFields } from './utils/collection-schema'
import { isAdminOrCurrentUserWithRoles } from './utils/payload-access'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'
import type { Passkey } from '@/better-auth/generated-types'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'
import type { CollectionConfig } from 'payload'

export function buildPasskeysCollection({ incomingCollections, pluginOptions, resolvedSchemas }: BuildCollectionProps): CollectionConfig {
  const passkeySlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.passkey)
  const passkeySchema = resolvedSchemas[baModelKey.passkey]
  const userIdFieldName = passkeySchema?.fields?.userId?.fieldName ?? baModelFieldKeysToFieldNames.passkey.userId
  const adminRoles = pluginOptions.users?.adminRoles ?? [defaults.adminRole]

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
      name: 'credentialId',
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
    schema: passkeySchema,
    additionalProperties: fieldOverrides
  })

  let passkeyCollection: CollectionConfig = {
    ...existingPasskeyCollection,
    slug: passkeySlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.passkey, 'name'),
      description: 'Passkeys are used to authenticate users',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingPasskeyCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      read: isAdminOrCurrentUserWithRoles({
        idField: userIdFieldName,
        adminRoles
      }),
      delete: isAdminOrCurrentUserWithRoles({
        idField: userIdFieldName,
        adminRoles
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

  assertAllSchemaFields(passkeyCollection, passkeySchema)

  return passkeyCollection
}
