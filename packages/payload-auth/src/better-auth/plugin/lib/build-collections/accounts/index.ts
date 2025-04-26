import { CollectionConfig } from 'payload'
import { BetterAuthPluginOptions } from '@/better-auth/plugin/types'
import { baseSlugs, baModelKey, defaults, baModelFieldKeys } from '@/better-auth/plugin/constants'
import { getSyncPasswordToUserHook } from './hooks/sync-password-to-user'
import { isAdminOrCurrentUserWithRoles, isAdminWithRoles } from '../utils/payload-access'
import { getTimestampFields } from '../utils/get-timestamp-fields'

export function buildAccountsCollection({
  incomingCollections,
  pluginOptions,
  collectionMap
}: {
  incomingCollections: CollectionConfig[]
  pluginOptions: BetterAuthPluginOptions
  collectionMap: Record<string, CollectionConfig>
}): CollectionConfig {
  const userSlug = pluginOptions.users?.slug ?? baseSlugs.users
  const accountSlug = pluginOptions.accounts?.slug ?? baseSlugs.accounts
  const adminRoles = pluginOptions.users?.adminRoles ?? [defaults.adminRole]

  const existingAccountCollection = incomingCollections.find((collection) => collection.slug === accountSlug) as
    | CollectionConfig
    | undefined

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
        ...(pluginOptions.disableDefaultPayloadAuth ? [] : [getSyncPasswordToUserHook(collectionMap)])
      ]
    },
    fields: [
      ...(existingAccountCollection?.fields ?? []),
      {
        name: 'user',
        type: 'relationship',
        relationTo: userSlug,
        required: true,
        index: true,
        label: 'User',
        admin: {
          readOnly: true,
          description: 'The user that the account belongs to'
        },
        custom: {
          betterAuthFieldKey: baModelFieldKeys.account.userId
        }
      },
      {
        name: 'accountId',
        type: 'text',
        label: 'Account ID',
        required: true,
        index: true,
        admin: {
          readOnly: true,
          description: 'The id of the account as provided by the SSO or equal to userId for credential accounts'
        },
        custom: {
          betterAuthFieldKey: 'accountId'
        }
      },
      {
        name: 'providerId',
        type: 'text',
        required: true,
        label: 'Provider ID',
        admin: {
          readOnly: true,
          description: 'The id of the provider as provided by the SSO'
        },
        custom: {
          betterAuthFieldKey: 'providerId'
        }
      },
      {
        name: 'accessToken',
        type: 'text',
        label: 'Access Token',
        admin: {
          readOnly: true,
          description: 'The access token of the account. Returned by the provider'
        },
        custom: {
          betterAuthFieldKey: 'accessToken'
        }
      },
      {
        name: 'refreshToken',
        type: 'text',
        label: 'Refresh Token',
        admin: {
          readOnly: true,
          description: 'The refresh token of the account. Returned by the provider'
        },
        custom: {
          betterAuthFieldKey: 'refreshToken'
        }
      },
      {
        name: 'accessTokenExpiresAt',
        type: 'date',
        label: 'Access Token Expires At',
        admin: {
          readOnly: true,
          description: 'The date and time when the access token will expire'
        },
        custom: {
          betterAuthFieldKey: 'accessTokenExpiresAt'
        }
      },
      {
        name: 'refreshTokenExpiresAt',
        type: 'date',
        label: 'Refresh Token Expires At',
        admin: {
          readOnly: true,
          description: 'The date and time when the refresh token will expire'
        },
        custom: {
          betterAuthFieldKey: 'refreshTokenExpiresAt'
        }
      },
      {
        name: 'scope',
        type: 'text',
        label: 'Scope',
        admin: {
          readOnly: true,
          description: 'The scope of the account. Returned by the provider'
        },
        custom: {
          betterAuthFieldKey: 'scope'
        }
      },
      {
        name: 'idToken',
        type: 'text',
        label: 'ID Token',
        admin: {
          readOnly: true,
          description: 'The id token for the account. Returned by the provider'
        },
        custom: {
          betterAuthFieldKey: 'idToken'
        }
      },
      {
        name: 'password',
        type: 'text',
        label: 'Password',
        admin: {
          readOnly: true,
          hidden: true,
          description: 'The hashed password of the account. Mainly used for email and password authentication'
        },
        custom: {
          betterAuthFieldKey: 'password'
        }
      },
      ...getTimestampFields()
    ],
    ...existingAccountCollection
  }

  if (pluginOptions.accounts?.collectionOverrides) {
    accountCollection = pluginOptions.accounts.collectionOverrides({
      collection: accountCollection
    })
  }

  return accountCollection
}
