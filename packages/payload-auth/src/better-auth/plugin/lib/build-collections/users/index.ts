import { CollectionConfig } from 'payload'
import type { BetterAuthPluginOptions } from '../../../types'
import { baseSlugs, baModelKey, supportedBAPluginIds } from '../../../constants'
import { isAdminOrCurrentUserUpdateWithAllowedFields, isAdminOrCurrentUserWithRoles, isAdminWithRoles } from '../utils/payload-access'
import { getRefreshTokenEndpoint } from './endpoints/refresh-token'
import { getOnVerifiedChangeHook } from './hooks/on-verified-change'
import { getSyncAccountHook } from './hooks/sync-account'
import { getBeforeLoginHook } from './hooks/before-login'
import { getAfterLoginHook } from './hooks/after-login'
import { getAfterLogoutHook } from './hooks/after-logout'
import { getBeforeDeleteHook } from './hooks/before-delete'
import { betterAuthStrategy } from './better-auth-strategy'
import { getTimestampFields } from '../utils/get-timestamp-fields'
import { getAllRoleOptions } from '../../../helpers/get-all-roles'
import { getSignupEndpoint } from './endpoints/signup'
import { getSetAdminRoleEndpoint } from './endpoints/set-admin-role'
import { getGenerateInviteUrlEndpoint } from './endpoints/generate-invite-url'
import { getSendInviteUrlEndpoint } from './endpoints/send-invite-url'
import { checkPluginExists } from '@/better-auth/plugin/helpers/check-plugin-exists'

export function buildUsersCollection({
  incomingCollections,
  pluginOptions,
  collectionMap
}: {
  incomingCollections: CollectionConfig[]
  pluginOptions: BetterAuthPluginOptions
  collectionMap: Record<string, CollectionConfig>
}): CollectionConfig {
  const userSlug = pluginOptions.users?.slug ?? baseSlugs.users
  const adminRoles = pluginOptions.users?.adminRoles ?? ['admin']
  const allRoleOptions = getAllRoleOptions(pluginOptions)
  const hasUsernamePlugin = checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.username)
  const existingUserCollection = incomingCollections.find((collection) => collection.slug === userSlug) as CollectionConfig | undefined

  // TODO: REVIEW THIS
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
        ...(pluginOptions.disableDefaultPayloadAuth ? [] : [getSyncAccountHook(collectionMap)])
      ],
      beforeLogin: [
        ...(existingUserCollection?.hooks?.beforeLogin ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth ? [] : [getBeforeLoginHook(pluginOptions.betterAuthOptions ?? {})])
      ],
      afterLogin: [
        ...(existingUserCollection?.hooks?.afterLogin ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth ? [] : [getAfterLoginHook(collectionMap)])
      ],
      afterLogout: [...(existingUserCollection?.hooks?.afterLogout ?? []), getAfterLogoutHook(collectionMap)],
      beforeDelete: [...(existingUserCollection?.hooks?.beforeDelete ?? []), getBeforeDeleteHook(collectionMap)]
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
        },
        custom: {
          betterAuthFieldKey: 'name'
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
        },
        custom: {
          betterAuthFieldKey: 'email'
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
        },
        custom: {
          betterAuthFieldKey: 'emailVerified'
        }
      },
      {
        name: 'image',
        type: 'text',
        label: 'Image',
        saveToJWT: false,
        admin: {
          description: 'The image of the user'
        },
        custom: {
          betterAuthFieldKey: 'image'
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
        },
        custom: {
          betterAuthFieldKey: 'role'
        }
      },
      ...getTimestampFields({
        saveUpdatedAtToJWT: false,
        saveCreatedAtToJWT: false
      })
    ]
  }

  if (pluginOptions.betterAuthOptions?.plugins) {
    pluginOptions.betterAuthOptions.plugins.forEach((plugin) => {
      switch (plugin.id) {
        case 'two-factor':
          usersCollection.fields.push({
            name: 'twoFactorEnabled',
            type: 'checkbox',
            defaultValue: false,
            label: 'Two Factor Enabled',
            admin: {
              description: 'Whether the user has two factor authentication enabled',
              components: {
                Field: {
                  path: 'payload-auth/better-auth/plugin/client#TwoFactorAuth'
                }
              }
            },
            custom: {
              betterAuthFieldKey: 'twoFactorEnabled'
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
              },
              custom: {
                betterAuthFieldKey: 'username'
              }
            },
            {
              name: 'displayUsername',
              type: 'text',
              required: false,
              label: 'Display Username',
              admin: {
                description: 'The display username of the user'
              },
              custom: {
                betterAuthFieldKey: 'displayUsername'
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
            },
            custom: {
              betterAuthFieldKey: 'isAnonymous'
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
              },
              custom: {
                betterAuthFieldKey: 'phoneNumber'
              }
            },
            {
              name: 'phoneNumberVerified',
              type: 'checkbox',
              defaultValue: false,
              label: 'Phone Number Verified',
              admin: {
                description: 'Whether the phone number of the user has been verified'
              },
              custom: {
                betterAuthFieldKey: 'phoneNumberVerified'
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
              },
              custom: {
                betterAuthFieldKey: 'banned'
              }
            },
            {
              name: 'banReason',
              type: 'text',
              label: 'Ban Reason',
              admin: {
                description: 'The reason for the ban'
              },
              custom: {
                betterAuthFieldKey: 'banReason'
              }
            },
            {
              name: 'banExpires',
              type: 'date',
              label: 'Ban Expires',
              admin: {
                description: 'The date and time when the ban will expire'
              },
              custom: {
                betterAuthFieldKey: 'banExpires'
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
            },
            custom: {
              betterAuthFieldKey: 'normalizedEmail'
            }
          })
          break
        case 'stripe':
          usersCollection.fields.push({
            name: 'stripeCustomerId',
            type: 'text',
            required: true,
            label: 'Stripe Customer ID',
            admin: {
              description: 'The Stripe customer ID of the user'
            },
            custom: {
              betterAuthFieldKey: 'stripeCustomerId'
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
