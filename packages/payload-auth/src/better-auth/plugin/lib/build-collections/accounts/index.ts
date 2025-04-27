import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '@/better-auth/plugin/types'
import { baModelKey, defaults } from '@/better-auth/plugin/constants'
import { getSyncPasswordToUserHook } from './hooks/sync-password-to-user'
import { isAdminOrCurrentUserWithRoles, isAdminWithRoles } from '../utils/payload-access'
import { getTimestampFields } from '../utils/get-timestamp-fields'
import { getPayloadFieldsFromBetterAuthSchema } from '../utils/transform-better-auth-field-to-payload-field'
import { getDeafultCollectionSlug } from '@/better-auth/plugin/helpers/get-collection-slug'
import type { FieldAttribute } from 'better-auth/db'
import type { Field } from 'payload'
import { FieldRule } from '../utils/model-field-transformations'
import type { BuildCollectionPropsWithIncoming } from '@/better-auth/plugin/types'

export function buildAccountsCollection({
  incomingCollections,
  pluginOptions,
  schema
}: BuildCollectionPropsWithIncoming): CollectionConfig {
  const accountSlug = getDeafultCollectionSlug({ modelKey: baModelKey.account, pluginOptions })
  const adminRoles = pluginOptions.users?.adminRoles ?? [defaults.adminRole]

  const existingAccountCollection = incomingCollections.find((collection) => collection.slug === accountSlug) as
    | CollectionConfig
    | undefined

  const accountFieldRules: FieldRule[] = [
    {
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

  const fieldOverrides: Record<string, (field: FieldAttribute) => Partial<Field>> = {
    userId: () => ({
      index: true,
      admin: {
        readOnly: true,
        description: 'The user that the account belongs to'
      }
    }),
    accountId: () => ({
      index: true,
      admin: {
        readOnly: true,
        description: 'The id of the account as provided by the SSO or equal to userId for credential accounts'
      }
    }),
    providerId: () => ({
      admin: {
        readOnly: true,
        description: 'The id of the provider as provided by the SSO'
      }
    }),
    accessToken: () => ({
      admin: {
        readOnly: true,
        description: 'The access token of the account. Returned by the provider'
      }
    }),
    refreshToken: () => ({
      admin: {
        readOnly: true,
        description: 'The refresh token of the account. Returned by the provider'
      }
    }),
    accessTokenExpiresAt: () => ({
      admin: {
        readOnly: true,
        description: 'The date and time when the access token will expire'
      }
    }),
    refreshTokenExpiresAt: () => ({
      admin: {
        readOnly: true,
        description: 'The date and time when the refresh token will expire'
      }
    }),
    scope: () => ({
      admin: {
        readOnly: true,
        description: 'The scope of the account. Returned by the provider'
      }
    }),
    idToken: () => ({
      admin: {
        readOnly: true,
        description: 'The id token for the account. Returned by the provider'
      }
    }),
    password: () => ({
      admin: {
        readOnly: true,
        hidden: true,
        description: 'The hashed password of the account. Mainly used for email and password authentication'
      }
    })
  }

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    schema,
    fieldRules: accountFieldRules,
    additionalProperties: fieldOverrides
  })

  let accountCollection: CollectionConfig = {
    slug: accountSlug,
    admin: {
      useAsTitle: 'accountId',
      description: 'Accounts are used to store user accounts for authentication providers',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingAccountCollection?.admin,
      hidden: pluginOptions.accounts?.hidden
    },
    access: {
      create: isAdminWithRoles({ adminRoles }),
      delete: isAdminWithRoles({ adminRoles }),
      read: isAdminOrCurrentUserWithRoles({ adminRoles, idField: 'user' }),
      update: isAdminWithRoles({ adminRoles }),
      ...(existingAccountCollection?.access ?? {})
    },
    custom: {
      betterAuthModelKey: baModelKey.account
    },
    hooks: {
      afterChange: [
        ...(existingAccountCollection?.hooks?.afterChange ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth ? [] : [getSyncPasswordToUserHook(pluginOptions)])
      ]
    },
    fields: [...(existingAccountCollection?.fields ?? []), ...(collectionFields ?? [])],
    ...existingAccountCollection
  }

  if (typeof pluginOptions.accounts?.collectionOverrides === 'function') {
    accountCollection = pluginOptions.accounts.collectionOverrides({
      collection: accountCollection
    })
  }

  return accountCollection
}
