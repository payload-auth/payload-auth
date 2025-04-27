import { checkPluginExists } from '@/better-auth/plugin/helpers/check-plugin-exists'
import { getDeafultCollectionSlug } from '@/better-auth/plugin/helpers/get-collection-slug'
import { baModelKey, defaults, supportedBAPluginIds } from '../../../constants'
import { getAllRoleOptions } from '../../../helpers/get-all-roles'
import { assertAllSchemaFields } from '../utils/assert-schema-fields'
import { isAdminOrCurrentUserUpdateWithAllowedFields, isAdminOrCurrentUserWithRoles, isAdminWithRoles } from '../utils/payload-access'
import { getPayloadFieldsFromBetterAuthSchema } from '../utils/transform-better-auth-field-to-payload-field'
import { betterAuthStrategy } from './better-auth-strategy'
import {
  getGenerateInviteUrlEndpoint,
  getRefreshTokenEndpoint,
  getSendInviteUrlEndpoint,
  getSetAdminRoleEndpoint,
  getSignupEndpoint
} from './endpoints'
import {
  getSyncAccountHook,
  getAfterLoginHook,
  getAfterLogoutHook,
  getBeforeDeleteHook,
  getBeforeLoginHook,
  getOnVerifiedChangeHook
} from './hooks'

import type { CollectionConfig } from 'payload'
import type { FieldRule } from '../utils/model-field-transformations'
import type { BuildCollectionProps, FieldOverrides } from '../../../types'
import type { User } from '@/better-auth/generated-types'

export function buildUsersCollection({ incomingCollections, pluginOptions, schema }: BuildCollectionProps): CollectionConfig {
  const userSlug = getDeafultCollectionSlug({ modelKey: baModelKey.user, pluginOptions })
  const adminRoles = pluginOptions.users?.adminRoles ?? [defaults.adminRole]
  const allRoleOptions = getAllRoleOptions(pluginOptions)
  const hasUsernamePlugin = checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.username)
  const existingUserCollection = incomingCollections.find((collection) => collection.slug === userSlug) as CollectionConfig | undefined

  // TODO: REVIEW THIS
  const allowedFields = pluginOptions.users?.allowedFields ?? ['name']

  const userFieldRules: FieldRule[] = [
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

  const fieldOverrides: FieldOverrides<keyof User> = {
    role: (field) => ({
      type: 'select',
      options: allRoleOptions,
      defaultValue: field.defaultValue ?? defaults.userRole,
      saveToJWT: true,
      admin: { description: 'The role of the user' }
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

  const collectionFields = getPayloadFieldsFromBetterAuthSchema({
    schema,
    fieldRules: userFieldRules,
    additionalProperties: fieldOverrides
  })

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
                    userSlug
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
      admin: ({ req }) => adminRoles.includes((req.user?.role as string) ?? 'user'),
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
      getSendInviteUrlEndpoint(pluginOptions),
      getSignupEndpoint(pluginOptions)
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
    fields: [...(existingUserCollection?.fields ?? []), ...(collectionFields ?? [])]
  }

  if (pluginOptions.users?.collectionOverrides) {
    usersCollection = pluginOptions.users.collectionOverrides({
      collection: usersCollection
    })
  }

  assertAllSchemaFields(usersCollection, schema)

  return usersCollection
}
