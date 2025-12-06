import { checkPluginExists } from '@/better-auth/plugin/helpers/check-plugin-exists'
import { baModelFieldKeys, baModelKey, defaults, supportedBAPluginIds } from '../../../constants'
import { getAllRoleOptions } from '../../../helpers/get-all-roles'
import { assertAllSchemaFields, getSchemaCollectionSlug, getSchemaFieldName } from '../utils/collection-schema'
import {
  hasAdminRoles,
  isAdminOrCurrentUserUpdateWithAllowedFields,
  isAdminOrCurrentUserWithRoles,
  isAdminWithRoles
} from '../utils/payload-access'
import { getCollectionFields } from '../utils/transform-schema-fields-to-payload'
import { betterAuthStrategy } from './better-auth-strategy'
import { getGenerateInviteUrlEndpoint, getRefreshTokenEndpoint, getSendInviteUrlEndpoint, getSetAdminRoleEndpoint } from './endpoints'
import {
  getSyncAccountHook,
  getAfterLoginHook,
  getAfterLogoutHook,
  getBeforeDeleteHook,
  getBeforeLoginHook,
  getOnVerifiedChangeHook
} from './hooks'

import type { CollectionConfig, JoinField, UIField } from 'payload'
import type { BuildCollectionProps, FieldOverrides, FieldRule } from '../../../types'
import type { User } from '@/better-auth/generated-types'

export function buildUsersCollection({ incomingCollections, pluginOptions, resolvedSchemas }: BuildCollectionProps): CollectionConfig {
  const userSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.user)
  const passkeySlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.passkey)
  const sessionSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.session)
  const accountSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.account)
  const passkeyUserIdFieldName = getSchemaFieldName(resolvedSchemas, baModelKey.passkey, baModelFieldKeys.passkey.userId)
  const userSchema = resolvedSchemas[baModelKey.user]
  const adminRoles = pluginOptions.users?.adminRoles ?? [defaults.adminRole]
  const allRoleOptions = getAllRoleOptions(pluginOptions)
  const hasUsernamePlugin = checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.username)
  const existingUserCollection = incomingCollections.find((collection) => collection.slug === userSlug) as CollectionConfig | undefined

  // TODO: REVIEW THIS
  const allowedFields = pluginOptions.users?.allowedFields ?? ['name']

  const userFieldRules: FieldRule[] = [
    {
      condition: (field) => field.fieldName === 'createdAt' || field.fieldName === 'updatedAt',
      transform: (field) => ({
        ...field,
        saveToJWT: false,
        admin: {
          disableBulkEdit: true,
          hidden: true
        },
        index: true,
        label: ({ t }: any) => (field.fieldName === 'createdAt' ? t('general:createdAt') : t('general:updatedAt'))
      })
    }
  ]

  const fieldOverrides: FieldOverrides<keyof User> = {
    role: (field) => ({
      type: 'select',
      hasMany: true,
      options: allRoleOptions,
      defaultValue: field.defaultValue ?? defaults.userRole,
      saveToJWT: true,
      admin: { description: 'The role/ roles of the user' }
    }),
    email: () => ({
      index: true,
      admin: { description: 'The email of the user' }
    }),
    emailVerified: (field) => ({
      defaultValue: field.defaultValue ?? false,
      saveToJWT: true,
      admin: { description: 'Whether the email of the user has been verified' }
    }),
    name: () => ({
      saveToJWT: true,
      admin: { description: 'Users chosen display name' }
    }),
    image: () => ({
      saveToJWT: false,
      admin: { description: 'The image of the user' }
    }),
    twoFactorEnabled: () => ({
      defaultValue: false,
      admin: {
        description: 'Whether the user has two factor authentication enabled',
        components: {
          Field: {
            path: 'payload-auth/better-auth/plugin/client#TwoFactorAuth'
          }
        }
      }
    }),
    username: () => ({
      admin: { description: 'The username of the user' }
    }),
    displayUsername: () => ({
      admin: { description: 'The display username of the user' }
    }),
    isAnonymous: () => ({
      defaultValue: false,
      admin: { description: 'Whether the user is anonymous.' }
    }),
    phoneNumber: () => ({
      admin: { description: 'The phone number of the user' }
    }),
    phoneNumberVerified: () => ({
      defaultValue: false,
      admin: { description: 'Whether the phone number of the user has been verified' }
    }),
    banned: () => ({
      defaultValue: false,
      admin: { description: 'Whether the user is banned from the platform' }
    }),
    banReason: () => ({
      admin: { description: 'The reason for the ban' }
    }),
    banExpires: () => ({
      admin: { description: 'The date and time when the ban will expire' }
    }),
    normalizedEmail: () => ({
      admin: {
        readOnly: true,
        description: 'The normalized email of the user'
      }
    }),
    stripeCustomerId: () => ({
      admin: {
        readOnly: true,
        description: 'The Stripe customer ID of the user'
      }
    })
  }

  const collectionFields = getCollectionFields({
    schema: userSchema,
    fieldRules: userFieldRules,
    additionalProperties: fieldOverrides
  })

  const joinFields: JoinField[] = [
    // Better Auth’s internal adapter renames `account` => `accounts` via
    // `const { account: accounts, ...user } = result`
    // @see https://github.com/better-auth/better-auth/blob/28654734e13dc0bb22d5623722e97b9a8dbc1b37/packages/better-auth/src/db/internal-adapter.ts#L760-L761
    // The join field name must therefore stay exactly `account` to be picked up.
    {
      label: 'Accounts',
      name: baModelKey.account,
      type: 'join',
      hasMany: true,
      collection: accountSlug,
      on: getSchemaFieldName(resolvedSchemas, baModelKey.account, baModelFieldKeys.account.userId),
      maxDepth: 1,
      saveToJWT: false
    },
    // Sessions use the same pattern; keep the singular model key for the join name.
    {
      label: 'Sessions',
      name: baModelKey.session,
      type: 'join',
      hasMany: true,
      collection: sessionSlug,
      on: getSchemaFieldName(resolvedSchemas, baModelKey.session, baModelFieldKeys.session.userId),
      maxDepth: 1,
      saveToJWT: false
    }
  ]

  let usersCollection: CollectionConfig = {
    ...existingUserCollection,
    slug: userSlug,
    admin: {
      defaultColumns: ['email'],
      useAsTitle: 'email',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingUserCollection?.admin,
      hidden: pluginOptions.users?.hidden ?? false,
      components: {
        Description: {
          path: 'payload-auth/better-auth/plugin/client#AdminInviteButton',
          clientProps: {
            roles: allRoleOptions
          }
        },
        views: {
          edit: {
            adminButtons: {
              tab: {
                Component: {
                  path: 'payload-auth/better-auth/plugin/client#AdminButtons',
                  clientProps: {
                    userSlug,
                    baseURL: pluginOptions.betterAuthOptions?.baseURL,
                    basePath: pluginOptions.betterAuthOptions?.basePath
                  }
                },
                condition: () => {
                  // Only show the impersonate button if the admin plugin is enabled
                  return checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.admin)
                }
              }
            }
          }
        }
      }
    },
    access: {
      admin: hasAdminRoles(adminRoles),
      read: isAdminOrCurrentUserWithRoles({ adminRoles, idField: 'id' }),
      create: isAdminWithRoles({ adminRoles }),
      delete: isAdminOrCurrentUserWithRoles({ adminRoles, idField: 'id' }),
      update: isAdminOrCurrentUserUpdateWithAllowedFields({
        allowedFields,
        adminRoles,
        userSlug
      }),
      ...(existingUserCollection?.access ?? {})
    },
    custom: {
      ...(existingUserCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.user
    },
    endpoints: [
      ...(existingUserCollection?.endpoints ? existingUserCollection.endpoints : []),
      getRefreshTokenEndpoint(userSlug),
      getSetAdminRoleEndpoint(pluginOptions, userSlug),
      getGenerateInviteUrlEndpoint({
        roles: allRoleOptions,
        pluginOptions
      }),
      getSendInviteUrlEndpoint(pluginOptions)
    ],
    hooks: {
      beforeChange: [
        ...(existingUserCollection?.hooks?.beforeChange ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth ? [] : [getOnVerifiedChangeHook()])
      ],
      afterChange: [
        ...(existingUserCollection?.hooks?.afterChange ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth ? [] : [getSyncAccountHook()])
      ],
      beforeLogin: [
        ...(existingUserCollection?.hooks?.beforeLogin ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth ? [] : [getBeforeLoginHook(pluginOptions.betterAuthOptions ?? {})])
      ],
      afterLogin: [
        ...(existingUserCollection?.hooks?.afterLogin ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth ? [] : [getAfterLoginHook()])
      ],
      afterLogout: [...(existingUserCollection?.hooks?.afterLogout ?? []), getAfterLogoutHook()],
      beforeDelete: [...(existingUserCollection?.hooks?.beforeDelete ?? []), getBeforeDeleteHook()]
    },
    auth: {
      ...(existingUserCollection && typeof existingUserCollection.auth === 'object' ? existingUserCollection.auth : {}),
      disableLocalStrategy: pluginOptions.disableDefaultPayloadAuth ? true : undefined,
      ...(hasUsernamePlugin && {
        loginWithUsername: {
          allowEmailLogin: true,
          requireEmail: true,
          requireUsername: false
        }
      }),
      strategies: [betterAuthStrategy(userSlug)]
    },
    fields: [
      ...(existingUserCollection?.fields ?? []),
      ...(collectionFields ?? []),
      ...joinFields,
      ...(checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.passkey)
        ? [
            {
              name: 'managePasskeys',
              type: 'ui' as const,
              admin: {
                disableBulkEdit: true,
                components: {
                  Field: {
                    path: 'payload-auth/better-auth/plugin/rsc#Passkeys',
                    serverProps: {
                      passkeyUserIdFieldName,
                      passkeySlug,
                      pluginOptions
                    }
                  }
                }
              }
            } as UIField
          ]
        : [])
    ]
  }

  if (pluginOptions.users?.collectionOverrides) {
    usersCollection = pluginOptions.users.collectionOverrides({
      collection: usersCollection
    })
  }

  assertAllSchemaFields(usersCollection, userSchema)

  return usersCollection
}
