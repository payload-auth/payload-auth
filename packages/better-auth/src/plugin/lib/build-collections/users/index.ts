import { CollectionConfig } from 'payload'
import type { BetterAuthPluginOptions, SanitizedBetterAuthOptions } from '../../../types'
import { baseCollectionSlugs } from '../../config'
import {
  isAdminOrCurrentUserUpdateWithAllowedFields,
  isAdminOrCurrentUserWithRoles,
  isAdminWithRoles,
} from '../utils/payload-access'
import { getRefreshTokenEndpoint } from './endpoints/refresh-token'
import { onVerifiedChange } from './hooks/on-verified-change'
import { getSyncAccountHook } from './hooks/sync-account'
import { getBeforeLoginHook } from './hooks/before-login'
import { getAfterLoginHook } from './hooks/after-login'
import { getAfterLogoutHook } from './hooks/after-logout'
import { getAfterDeleteHook } from './hooks/after-delete'
import { betterAuthStrategy } from './better-auth-strategy'
import { getTimestampFields } from '../utils/get-timestamp-fields'

export function buildUsersCollection({
  incomingCollections,
  pluginOptions,
  sanitizedBAOptions,
}: {
  incomingCollections: CollectionConfig[]
  pluginOptions: BetterAuthPluginOptions
  sanitizedBAOptions: SanitizedBetterAuthOptions
}) {
  const userSlug = pluginOptions.users?.slug ?? baseCollectionSlugs.users
  const accountSlug = pluginOptions.accounts?.slug ?? baseCollectionSlugs.accounts
  const sessionSlug = pluginOptions.sessions?.slug ?? baseCollectionSlugs.sessions
  const baPlugins = sanitizedBAOptions.plugins ?? null
  const adminRoles = pluginOptions.users?.adminRoles ?? ['admin']

  const existingUserCollection = incomingCollections.find(
    (collection) => collection.slug === userSlug,
  ) as CollectionConfig | undefined

  const allowedFields = pluginOptions.users?.allowedFields ?? ['name']

  let usersCollection: CollectionConfig = {
    ...existingUserCollection,
    slug: userSlug,
    admin: {
      defaultColumns: ['email'],
      useAsTitle: 'email',
      ...existingUserCollection?.admin,
      hidden: pluginOptions.users?.hidden ?? false,
      components: {
        views: {
          edit: {
            adminButtons: {
              tab: {
                Component: {
                  path: 'payload-auth/better-auth/plugin/client#AdminButtons',
                  clientProps: () => {
                    return {
                      userSlug,
                    }
                  },
                },
                condition: () => {
                  // Only show the impersonate button if the admin plugin is enabled
                  return (baPlugins && baPlugins.some((plugin) => plugin.id === 'admin')) ?? false
                },
              },
            },
          },
        },
      },
    },
    access: {
      admin: ({ req }) => adminRoles.includes((req.user?.role as string) ?? 'user'),
      read: isAdminOrCurrentUserWithRoles({ adminRoles, idField: 'id' }),
      create: isAdminWithRoles({ adminRoles }),
      delete: isAdminOrCurrentUserWithRoles({ adminRoles, idField: 'id' }),
      update: isAdminOrCurrentUserUpdateWithAllowedFields({
        allowedFields,
        adminRoles,
        userSlug,
      }),
      ...(existingUserCollection?.access ?? {}),
    },
    endpoints: [
      ...(existingUserCollection?.endpoints ? existingUserCollection.endpoints : []),
      getRefreshTokenEndpoint({ userSlug }),
    ],
    hooks: {
      beforeChange: [
        ...(existingUserCollection?.hooks?.beforeChange ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth ? [] : [onVerifiedChange]),
      ],
      afterChange: [
        ...(existingUserCollection?.hooks?.afterChange ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth
          ? []
          : [
              getSyncAccountHook({
                userSlug,
                accountSlug,
              }),
            ]),
      ],
      beforeLogin: [
        ...(existingUserCollection?.hooks?.beforeLogin ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth ? [] : [getBeforeLoginHook()]),
      ],
      afterLogin: [
        ...(existingUserCollection?.hooks?.afterLogin ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth
          ? []
          : [
              getAfterLoginHook({
                sessionsCollectionSlug: sessionSlug,
                usersCollectionSlug: userSlug,
              }),
            ]),
      ],
      afterLogout: [
        ...(existingUserCollection?.hooks?.afterLogout ?? []),
        getAfterLogoutHook({ sessionsCollectionSlug: sessionSlug }),
      ],
      afterDelete: [...(existingUserCollection?.hooks?.afterDelete ?? []), getAfterDeleteHook],
    },
    auth: {
      ...(existingUserCollection && typeof existingUserCollection.auth === 'object'
        ? existingUserCollection.auth
        : {}),
      disableLocalStrategy: pluginOptions.disableDefaultPayloadAuth ? true : undefined,
      strategies: [betterAuthStrategy(adminRoles, userSlug)],
    },
    fields: [
      ...(existingUserCollection?.fields ?? []),
      //   {
      //     name: 'betterAuthAdminButtons',
      //     type: 'ui',
      //     admin: {
      //       position: 'sidebar',
      //       components: {
      //         Field: {
      //           path: 'payload-auth/better-auth/plugin/client#AdminButtons',
      //           clientProps: () => {
      //             return {
      //               userSlug,
      //             }
      //           },
      //         },
      //       },
      //       condition: () => {
      //         // Only show the impersonate button if the admin plugin is enabled
      //         return (baPlugins && baPlugins.some((plugin) => plugin.id === 'admin')) ?? false
      //       },
      //     },
      //   },
      {
        name: 'name',
        type: 'text',
        label: 'Name',
        saveToJWT: true,
        admin: {
          description: 'Users chosen display name',
        },
      },
      {
        name: 'email',
        type: 'text',
        required: true,
        unique: true,
        index: true,
        label: 'Email',
        admin: {
          description: 'The email of the user',
        },
      },
      {
        name: 'emailVerified',
        type: 'checkbox',
        required: true,
        defaultValue: false,
        saveToJWT: true,
        label: 'Email Verified',
        admin: {
          description: 'Whether the email of the user has been verified',
        },
      },
      {
        name: 'image',
        type: 'text',
        label: 'Image',
        saveToJWT: true,
        admin: {
          description: 'The image of the user',
        },
      },
      {
        name: 'role',
        type: 'select',
        required: true,
        defaultValue: 'user',
        saveToJWT: true,
        options: [
          ...(
            pluginOptions.users?.roles ?? [
              { label: 'Admin', value: 'admin' },
              { label: 'User', value: 'user' },
            ]
          ).map((role) => {
            if (typeof role === 'string') {
              return {
                label: role.charAt(0).toUpperCase() + role.slice(1),
                value: role,
              }
            }
            return role
          }),
        ],
        label: 'Role',
        admin: {
          description: 'The role of the user',
        },
      },
      ...getTimestampFields({ saveUpdatedAtToJWT: false, saveCreatedAtToJWT: false }),
    ],
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
              description: 'Whether the user has two factor authentication enabled',
            },
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
                description: 'The username of the user',
              },
            },
            {
              name: 'displayUsername',
              type: 'text',
              required: true,
              label: 'Display Username',
              admin: {
                description: 'The display username of the user',
              },
            },
          )
          break
        case 'anonymous':
          usersCollection.fields.push({
            name: 'isAnonymous',
            type: 'checkbox',
            defaultValue: false,
            label: 'Is Anonymous',
            admin: {
              description: 'Whether the user is anonymous.',
            },
          })
          break
        case 'phone-number':
          usersCollection.fields.push(
            {
              name: 'phoneNumber',
              type: 'text',
              label: 'Phone Number',
              admin: {
                description: 'The phone number of the user',
              },
            },
            {
              name: 'phoneNumberVerified',
              type: 'checkbox',
              defaultValue: false,
              label: 'Phone Number Verified',
              admin: {
                description: 'Whether the phone number of the user has been verified',
              },
            },
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
                description: 'Whether the user is banned from the platform',
              },
            },
            {
              name: 'banReason',
              type: 'text',
              label: 'Ban Reason',
              admin: {
                description: 'The reason for the ban',
              },
            },
            {
              name: 'banExpires',
              type: 'date',
              label: 'Ban Expires',
              admin: {
                description: 'The date and time when the ban will expire',
              },
            },
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
              description: 'The normalized email of the user',
            },
          })
          break
        default:
          break
      }
    })
  }

  if (pluginOptions.users?.collectionOverrides) {
    usersCollection = pluginOptions.users.collectionOverrides({ collection: usersCollection })
  }

  return usersCollection
}
