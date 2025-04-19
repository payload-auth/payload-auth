import { CollectionConfig } from 'payload'
import type { BetterAuthPluginOptions, SanitizedBetterAuthOptions } from '../../../types'
import { baseCollectionSlugs } from '../../../constants'
import { isAdminOrCurrentUserUpdateWithAllowedFields, isAdminOrCurrentUserWithRoles, isAdminWithRoles } from '../utils/payload-access'
import { getRefreshTokenEndpoint } from './endpoints/refresh-token'
import { onVerifiedChange } from './hooks/on-verified-change'
import { getSyncAccountHook } from './hooks/sync-account'
import { getBeforeLoginHook } from './hooks/before-login'
import { getAfterLoginHook } from './hooks/after-login'
import { getAfterLogoutHook } from './hooks/after-logout'
import { getBeforeDeleteHook } from './hooks/before-delete'
import { betterAuthStrategy } from './better-auth-strategy'
import { getTimestampFields } from '../utils/get-timestamp-fields'
import { getAllRoleOptions } from '../../../helpers/get-all-roles'
import { getGenerateInviteUrlEndpoint } from './endpoints/generate-invite-url'
import { getSendInviteUrlEndpoint } from './endpoints/send-invite-url'
import { checkUsernamePlugin } from '../../../helpers/check-username-plugin'
import { getBeforeCreateUserHook } from './hooks/before-create-user'

export function buildUsersCollection({
  incomingCollections,
  pluginOptions,
  betterAuthOptions
}: {
  incomingCollections: CollectionConfig[]
  pluginOptions: BetterAuthPluginOptions
  betterAuthOptions: SanitizedBetterAuthOptions
}) {
  const userSlug = pluginOptions.users?.slug ?? baseCollectionSlugs.users
  const accountSlug = pluginOptions.accounts?.slug ?? baseCollectionSlugs.accounts
  const sessionSlug = pluginOptions.sessions?.slug ?? baseCollectionSlugs.sessions
  const verificationsSlug = pluginOptions.verifications?.slug ?? baseCollectionSlugs.verifications
  const adminInviteCollectionSlug = pluginOptions.adminInvitations?.slug ?? baseCollectionSlugs.adminInvitations
  const baPlugins = betterAuthOptions.plugins ?? null
  const adminRoles = pluginOptions.users?.adminRoles ?? ['admin']
  const allRoleOptions = getAllRoleOptions(pluginOptions)
  const hasUsernamePlugin = checkUsernamePlugin(betterAuthOptions)
  const existingUserCollection = incomingCollections.find((collection) => collection.slug === userSlug) as CollectionConfig | undefined

  const allowedFields = pluginOptions.users?.allowedFields ?? ['name']

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
                  return (baPlugins && baPlugins.some((plugin) => plugin.id === 'admin')) ?? false
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
    endpoints: [
      ...(existingUserCollection?.endpoints ? existingUserCollection.endpoints : []),
      getRefreshTokenEndpoint(userSlug),
      getGenerateInviteUrlEndpoint({
        roles: allRoleOptions,
        pluginOptions
      }),
      getSendInviteUrlEndpoint(pluginOptions)
    ],
    hooks: {
      beforeChange: [
        ...(existingUserCollection?.hooks?.beforeChange ?? []),
        getBeforeCreateUserHook(adminInviteCollectionSlug),
        ...(pluginOptions.disableDefaultPayloadAuth ? [] : [onVerifiedChange])
      ],
      afterChange: [
        ...(existingUserCollection?.hooks?.afterChange ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth
          ? []
          : [
              getSyncAccountHook({
                userSlug,
                accountSlug
              })
            ])
      ],
      beforeLogin: [
        ...(existingUserCollection?.hooks?.beforeLogin ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth ? [] : [getBeforeLoginHook()])
      ],
      afterLogin: [
        ...(existingUserCollection?.hooks?.afterLogin ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth
          ? []
          : [
              getAfterLoginHook({
                sessionsCollectionSlug: sessionSlug,
                usersCollectionSlug: userSlug
              })
            ])
      ],
      afterLogout: [...(existingUserCollection?.hooks?.afterLogout ?? []), getAfterLogoutHook({ sessionsCollectionSlug: sessionSlug })],
      beforeDelete: [
        ...(existingUserCollection?.hooks?.beforeDelete ?? []),
        getBeforeDeleteHook({
          accountsSlug: accountSlug,
          sessionsSlug: sessionSlug,
          verificationsSlug: verificationsSlug
        })
      ]
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
      {
        name: 'name',
        type: 'text',
        label: 'Name',
        saveToJWT: true,
        admin: {
          description: 'Users chosen display name'
        }
      },
      {
        name: 'email',
        type: 'text',
        required: true,
        unique: true,
        index: true,
        label: 'Email',
        admin: {
          description: 'The email of the user'
        }
      },
      {
        name: 'emailVerified',
        type: 'checkbox',
        required: true,
        defaultValue: false,
        saveToJWT: true,
        label: 'Email Verified',
        admin: {
          description: 'Whether the email of the user has been verified'
        }
      },
      {
        name: 'image',
        type: 'text',
        label: 'Image',
        saveToJWT: true,
        admin: {
          description: 'The image of the user'
        }
      },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        required: true,
        defaultValue: pluginOptions.users?.defaultRole ?? 'user',
        saveToJWT: true,
        options: allRoleOptions,
        admin: {
          description: 'The role of the user'
        }
      },
      ...getTimestampFields({
        saveUpdatedAtToJWT: false,
        saveCreatedAtToJWT: false
      })
    ]
  }

  if (baPlugins) {
    baPlugins.forEach((plugin) => {
      switch (plugin.id) {
        case 'two-factor':
          usersCollection.fields.push({
            name: 'twoFactorEnabled',
            type: 'checkbox',
            defaultValue: false,
            label: 'Two Factor Enabled',
            admin: {
              description: 'Whether the user has two factor authentication enabled'
            }
          })
          break
        case 'username':
          usersCollection.fields.push(
            {
              name: 'username',
              type: 'text',
              unique: true,
              required: false, // TODO: decide if this should be required, will have to tell users they need to add ui for it.
              label: 'Username',
              admin: {
                description: 'The username of the user'
              }
            },
            {
              name: 'displayUsername',
              type: 'text',
              required: false,
              label: 'Display Username',
              admin: {
                description: 'The display username of the user'
              }
            }
          )
          break
        case 'anonymous':
          usersCollection.fields.push({
            name: 'isAnonymous',
            type: 'checkbox',
            defaultValue: false,
            label: 'Is Anonymous',
            admin: {
              description: 'Whether the user is anonymous.'
            }
          })
          break
        case 'phone-number':
          usersCollection.fields.push(
            {
              name: 'phoneNumber',
              type: 'text',
              label: 'Phone Number',
              admin: {
                description: 'The phone number of the user'
              }
            },
            {
              name: 'phoneNumberVerified',
              type: 'checkbox',
              defaultValue: false,
              label: 'Phone Number Verified',
              admin: {
                description: 'Whether the phone number of the user has been verified'
              }
            }
          )
          break
        case 'admin':
          usersCollection.fields.push(
            {
              name: 'banned',
              type: 'checkbox',
              defaultValue: false,
              label: 'Banned',
              admin: {
                description: 'Whether the user is banned from the platform'
              }
            },
            {
              name: 'banReason',
              type: 'text',
              label: 'Ban Reason',
              admin: {
                description: 'The reason for the ban'
              }
            },
            {
              name: 'banExpires',
              type: 'date',
              label: 'Ban Expires',
              admin: {
                description: 'The date and time when the ban will expire'
              }
            }
          )
          break
        case 'harmony-email':
          usersCollection.fields.push({
            name: 'normalizedEmail',
            type: 'text',
            required: false,
            unique: true,
            admin: {
              readOnly: true,
              description: 'The normalized email of the user'
            }
          })
          break
        default:
          break
      }
    })
  }

  if (pluginOptions.users?.collectionOverrides) {
    usersCollection = pluginOptions.users.collectionOverrides({
      collection: usersCollection
    })
  }

  return usersCollection
}
