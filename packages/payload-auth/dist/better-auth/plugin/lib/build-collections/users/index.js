import { checkPluginExists } from "../../../helpers/check-plugin-exists";
import { baModelFieldKeys, baModelKey, defaults, supportedBAPluginIds } from "../../../constants";
import { getAllRoleOptions } from "../../../helpers/get-all-roles";
import { assertAllSchemaFields, getSchemaCollectionSlug, getSchemaFieldName } from "../utils/collection-schema";
import { hasAdminRoles, isAdminOrCurrentUserUpdateWithAllowedFields, isAdminOrCurrentUserWithRoles, isAdminWithRoles } from "../utils/payload-access";
import { getCollectionFields } from "../utils/transform-schema-fields-to-payload";
import { betterAuthStrategy } from "./better-auth-strategy";
import { getGenerateInviteUrlEndpoint, getRefreshTokenEndpoint, getSendInviteUrlEndpoint, getSetAdminRoleEndpoint } from "./endpoints";
import { getSyncAccountHook, getAfterLoginHook, getAfterLogoutHook, getBeforeDeleteHook, getBeforeLoginHook, getOnVerifiedChangeHook } from "./hooks";
export function buildUsersCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const userSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.user);
    const passkeySlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.passkey);
    const passkeyUserIdFieldName = getSchemaFieldName(resolvedSchemas, baModelKey.passkey, baModelFieldKeys.passkey.userId);
    const userSchema = resolvedSchemas[baModelKey.user];
    const adminRoles = pluginOptions.users?.adminRoles ?? [
        defaults.adminRole
    ];
    const allRoleOptions = getAllRoleOptions(pluginOptions);
    const hasUsernamePlugin = checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.username);
    const existingUserCollection = incomingCollections.find((collection)=>collection.slug === userSlug);
    // TODO: REVIEW THIS
    const allowedFields = pluginOptions.users?.allowedFields ?? [
        'name'
    ];
    const userFieldRules = [
        {
            condition: (field)=>field.fieldName === 'createdAt' || field.fieldName === 'updatedAt',
            transform: (field)=>({
                    ...field,
                    saveToJWT: false,
                    admin: {
                        disableBulkEdit: true,
                        hidden: true
                    },
                    index: true,
                    label: ({ t })=>field.fieldName === 'createdAt' ? t('general:createdAt') : t('general:updatedAt')
                })
        }
    ];
    const fieldOverrides = {
        role: (field)=>({
                type: 'select',
                hasMany: true,
                options: allRoleOptions,
                defaultValue: field.defaultValue ?? defaults.userRole,
                saveToJWT: true,
                admin: {
                    description: 'The role/ roles of the user'
                }
            }),
        email: ()=>({
                index: true,
                admin: {
                    description: 'The email of the user'
                }
            }),
        emailVerified: (field)=>({
                defaultValue: field.defaultValue ?? false,
                saveToJWT: true,
                admin: {
                    description: 'Whether the email of the user has been verified'
                }
            }),
        name: ()=>({
                saveToJWT: true,
                admin: {
                    description: 'Users chosen display name'
                }
            }),
        image: ()=>({
                saveToJWT: false,
                admin: {
                    description: 'The image of the user'
                }
            }),
        twoFactorEnabled: ()=>({
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
        username: ()=>({
                admin: {
                    description: 'The username of the user'
                }
            }),
        displayUsername: ()=>({
                admin: {
                    description: 'The display username of the user'
                }
            }),
        isAnonymous: ()=>({
                defaultValue: false,
                admin: {
                    description: 'Whether the user is anonymous.'
                }
            }),
        phoneNumber: ()=>({
                admin: {
                    description: 'The phone number of the user'
                }
            }),
        phoneNumberVerified: ()=>({
                defaultValue: false,
                admin: {
                    description: 'Whether the phone number of the user has been verified'
                }
            }),
        banned: ()=>({
                defaultValue: false,
                admin: {
                    description: 'Whether the user is banned from the platform'
                }
            }),
        banReason: ()=>({
                admin: {
                    description: 'The reason for the ban'
                }
            }),
        banExpires: ()=>({
                admin: {
                    description: 'The date and time when the ban will expire'
                }
            }),
        normalizedEmail: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The normalized email of the user'
                }
            }),
        stripeCustomerId: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The Stripe customer ID of the user'
                }
            })
    };
    const collectionFields = getCollectionFields({
        schema: userSchema,
        fieldRules: userFieldRules,
        additionalProperties: fieldOverrides
    });
    let usersCollection = {
        ...existingUserCollection,
        slug: userSlug,
        admin: {
            defaultColumns: [
                'email'
            ],
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
                                condition: ()=>{
                                    // Only show the impersonate button if the admin plugin is enabled
                                    return checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.admin);
                                }
                            }
                        }
                    }
                }
            }
        },
        access: {
            admin: hasAdminRoles(adminRoles),
            read: isAdminOrCurrentUserWithRoles({
                adminRoles,
                idField: 'id'
            }),
            create: isAdminWithRoles({
                adminRoles
            }),
            delete: isAdminOrCurrentUserWithRoles({
                adminRoles,
                idField: 'id'
            }),
            update: isAdminOrCurrentUserUpdateWithAllowedFields({
                allowedFields,
                adminRoles,
                userSlug
            }),
            ...existingUserCollection?.access ?? {}
        },
        custom: {
            ...existingUserCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.user
        },
        endpoints: [
            ...existingUserCollection?.endpoints ? existingUserCollection.endpoints : [],
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
                ...existingUserCollection?.hooks?.beforeChange ?? [],
                ...pluginOptions.disableDefaultPayloadAuth ? [] : [
                    getOnVerifiedChangeHook()
                ]
            ],
            afterChange: [
                ...existingUserCollection?.hooks?.afterChange ?? [],
                ...pluginOptions.disableDefaultPayloadAuth ? [] : [
                    getSyncAccountHook()
                ]
            ],
            beforeLogin: [
                ...existingUserCollection?.hooks?.beforeLogin ?? [],
                ...pluginOptions.disableDefaultPayloadAuth ? [] : [
                    getBeforeLoginHook(pluginOptions.betterAuthOptions ?? {})
                ]
            ],
            afterLogin: [
                ...existingUserCollection?.hooks?.afterLogin ?? [],
                ...pluginOptions.disableDefaultPayloadAuth ? [] : [
                    getAfterLoginHook()
                ]
            ],
            afterLogout: [
                ...existingUserCollection?.hooks?.afterLogout ?? [],
                getAfterLogoutHook()
            ],
            beforeDelete: [
                ...existingUserCollection?.hooks?.beforeDelete ?? [],
                getBeforeDeleteHook()
            ]
        },
        auth: {
            ...existingUserCollection && typeof existingUserCollection.auth === 'object' ? existingUserCollection.auth : {},
            disableLocalStrategy: pluginOptions.disableDefaultPayloadAuth ? true : undefined,
            ...hasUsernamePlugin && {
                loginWithUsername: {
                    allowEmailLogin: true,
                    requireEmail: true,
                    requireUsername: false
                }
            },
            strategies: [
                betterAuthStrategy(userSlug)
            ]
        },
        fields: [
            ...existingUserCollection?.fields ?? [],
            ...collectionFields ?? [],
            ...checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.passkey) ? [
                {
                    name: 'managePasskeys',
                    type: 'ui',
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
                }
            ] : []
        ]
    };
    if (pluginOptions.users?.collectionOverrides) {
        usersCollection = pluginOptions.users.collectionOverrides({
            collection: usersCollection
        });
    }
    assertAllSchemaFields(usersCollection, userSchema);
    return usersCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3VzZXJzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNoZWNrUGx1Z2luRXhpc3RzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vaGVscGVycy9jaGVjay1wbHVnaW4tZXhpc3RzJ1xuaW1wb3J0IHsgYmFNb2RlbEZpZWxkS2V5cywgYmFNb2RlbEtleSwgZGVmYXVsdHMsIHN1cHBvcnRlZEJBUGx1Z2luSWRzIH0gZnJvbSAnLi4vLi4vLi4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgZ2V0QWxsUm9sZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9oZWxwZXJzL2dldC1hbGwtcm9sZXMnXG5pbXBvcnQgeyBhc3NlcnRBbGxTY2hlbWFGaWVsZHMsIGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnLCBnZXRTY2hlbWFGaWVsZE5hbWUgfSBmcm9tICcuLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcbmltcG9ydCB7XG4gIGhhc0FkbWluUm9sZXMsXG4gIGlzQWRtaW5PckN1cnJlbnRVc2VyVXBkYXRlV2l0aEFsbG93ZWRGaWVsZHMsXG4gIGlzQWRtaW5PckN1cnJlbnRVc2VyV2l0aFJvbGVzLFxuICBpc0FkbWluV2l0aFJvbGVzXG59IGZyb20gJy4uL3V0aWxzL3BheWxvYWQtYWNjZXNzJ1xuaW1wb3J0IHsgZ2V0Q29sbGVjdGlvbkZpZWxkcyB9IGZyb20gJy4uL3V0aWxzL3RyYW5zZm9ybS1zY2hlbWEtZmllbGRzLXRvLXBheWxvYWQnXG5pbXBvcnQgeyBiZXR0ZXJBdXRoU3RyYXRlZ3kgfSBmcm9tICcuL2JldHRlci1hdXRoLXN0cmF0ZWd5J1xuaW1wb3J0IHsgZ2V0R2VuZXJhdGVJbnZpdGVVcmxFbmRwb2ludCwgZ2V0UmVmcmVzaFRva2VuRW5kcG9pbnQsIGdldFNlbmRJbnZpdGVVcmxFbmRwb2ludCwgZ2V0U2V0QWRtaW5Sb2xlRW5kcG9pbnQgfSBmcm9tICcuL2VuZHBvaW50cydcbmltcG9ydCB7XG4gIGdldFN5bmNBY2NvdW50SG9vayxcbiAgZ2V0QWZ0ZXJMb2dpbkhvb2ssXG4gIGdldEFmdGVyTG9nb3V0SG9vayxcbiAgZ2V0QmVmb3JlRGVsZXRlSG9vayxcbiAgZ2V0QmVmb3JlTG9naW5Ib29rLFxuICBnZXRPblZlcmlmaWVkQ2hhbmdlSG9va1xufSBmcm9tICcuL2hvb2tzJ1xuXG5pbXBvcnQgdHlwZSB7IENvbGxlY3Rpb25Db25maWcsIFVJRmllbGQgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHR5cGUgeyBCdWlsZENvbGxlY3Rpb25Qcm9wcywgRmllbGRPdmVycmlkZXMsIEZpZWxkUnVsZSB9IGZyb20gJy4uLy4uLy4uL3R5cGVzJ1xuaW1wb3J0IHR5cGUgeyBVc2VyIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9nZW5lcmF0ZWQtdHlwZXMnXG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFVzZXJzQ29sbGVjdGlvbih7IGluY29taW5nQ29sbGVjdGlvbnMsIHBsdWdpbk9wdGlvbnMsIHJlc29sdmVkU2NoZW1hcyB9OiBCdWlsZENvbGxlY3Rpb25Qcm9wcyk6IENvbGxlY3Rpb25Db25maWcge1xuICBjb25zdCB1c2VyU2x1ZyA9IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS51c2VyKVxuICBjb25zdCBwYXNza2V5U2x1ZyA9IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS5wYXNza2V5KVxuICBjb25zdCBwYXNza2V5VXNlcklkRmllbGROYW1lID0gZ2V0U2NoZW1hRmllbGROYW1lKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS5wYXNza2V5LCBiYU1vZGVsRmllbGRLZXlzLnBhc3NrZXkudXNlcklkKVxuICBjb25zdCB1c2VyU2NoZW1hID0gcmVzb2x2ZWRTY2hlbWFzW2JhTW9kZWxLZXkudXNlcl1cbiAgY29uc3QgYWRtaW5Sb2xlcyA9IHBsdWdpbk9wdGlvbnMudXNlcnM/LmFkbWluUm9sZXMgPz8gW2RlZmF1bHRzLmFkbWluUm9sZV1cbiAgY29uc3QgYWxsUm9sZU9wdGlvbnMgPSBnZXRBbGxSb2xlT3B0aW9ucyhwbHVnaW5PcHRpb25zKVxuICBjb25zdCBoYXNVc2VybmFtZVBsdWdpbiA9IGNoZWNrUGx1Z2luRXhpc3RzKHBsdWdpbk9wdGlvbnMuYmV0dGVyQXV0aE9wdGlvbnMgPz8ge30sIHN1cHBvcnRlZEJBUGx1Z2luSWRzLnVzZXJuYW1lKVxuICBjb25zdCBleGlzdGluZ1VzZXJDb2xsZWN0aW9uID0gaW5jb21pbmdDb2xsZWN0aW9ucy5maW5kKChjb2xsZWN0aW9uKSA9PiBjb2xsZWN0aW9uLnNsdWcgPT09IHVzZXJTbHVnKSBhcyBDb2xsZWN0aW9uQ29uZmlnIHwgdW5kZWZpbmVkXG5cbiAgLy8gVE9ETzogUkVWSUVXIFRISVNcbiAgY29uc3QgYWxsb3dlZEZpZWxkcyA9IHBsdWdpbk9wdGlvbnMudXNlcnM/LmFsbG93ZWRGaWVsZHMgPz8gWyduYW1lJ11cblxuICBjb25zdCB1c2VyRmllbGRSdWxlczogRmllbGRSdWxlW10gPSBbXG4gICAge1xuICAgICAgY29uZGl0aW9uOiAoZmllbGQpID0+IGZpZWxkLmZpZWxkTmFtZSA9PT0gJ2NyZWF0ZWRBdCcgfHwgZmllbGQuZmllbGROYW1lID09PSAndXBkYXRlZEF0JyxcbiAgICAgIHRyYW5zZm9ybTogKGZpZWxkKSA9PiAoe1xuICAgICAgICAuLi5maWVsZCxcbiAgICAgICAgc2F2ZVRvSldUOiBmYWxzZSxcbiAgICAgICAgYWRtaW46IHtcbiAgICAgICAgICBkaXNhYmxlQnVsa0VkaXQ6IHRydWUsXG4gICAgICAgICAgaGlkZGVuOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgICBsYWJlbDogKHsgdCB9OiBhbnkpID0+IChmaWVsZC5maWVsZE5hbWUgPT09ICdjcmVhdGVkQXQnID8gdCgnZ2VuZXJhbDpjcmVhdGVkQXQnKSA6IHQoJ2dlbmVyYWw6dXBkYXRlZEF0JykpXG4gICAgICB9KVxuICAgIH1cbiAgXVxuXG4gIGNvbnN0IGZpZWxkT3ZlcnJpZGVzOiBGaWVsZE92ZXJyaWRlczxrZXlvZiBVc2VyPiA9IHtcbiAgICByb2xlOiAoZmllbGQpID0+ICh7XG4gICAgICB0eXBlOiAnc2VsZWN0JyxcbiAgICAgIGhhc01hbnk6IHRydWUsXG4gICAgICBvcHRpb25zOiBhbGxSb2xlT3B0aW9ucyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogZmllbGQuZGVmYXVsdFZhbHVlID8/IGRlZmF1bHRzLnVzZXJSb2xlLFxuICAgICAgc2F2ZVRvSldUOiB0cnVlLFxuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdUaGUgcm9sZS8gcm9sZXMgb2YgdGhlIHVzZXInIH1cbiAgICB9KSxcbiAgICBlbWFpbDogKCkgPT4gKHtcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdUaGUgZW1haWwgb2YgdGhlIHVzZXInIH1cbiAgICB9KSxcbiAgICBlbWFpbFZlcmlmaWVkOiAoZmllbGQpID0+ICh7XG4gICAgICBkZWZhdWx0VmFsdWU6IGZpZWxkLmRlZmF1bHRWYWx1ZSA/PyBmYWxzZSxcbiAgICAgIHNhdmVUb0pXVDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgZW1haWwgb2YgdGhlIHVzZXIgaGFzIGJlZW4gdmVyaWZpZWQnIH1cbiAgICB9KSxcbiAgICBuYW1lOiAoKSA9PiAoe1xuICAgICAgc2F2ZVRvSldUOiB0cnVlLFxuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdVc2VycyBjaG9zZW4gZGlzcGxheSBuYW1lJyB9XG4gICAgfSksXG4gICAgaW1hZ2U6ICgpID0+ICh7XG4gICAgICBzYXZlVG9KV1Q6IGZhbHNlLFxuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdUaGUgaW1hZ2Ugb2YgdGhlIHVzZXInIH1cbiAgICB9KSxcbiAgICB0d29GYWN0b3JFbmFibGVkOiAoKSA9PiAoe1xuICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgdXNlciBoYXMgdHdvIGZhY3RvciBhdXRoZW50aWNhdGlvbiBlbmFibGVkJyxcbiAgICAgICAgY29tcG9uZW50czoge1xuICAgICAgICAgIEZpZWxkOiB7XG4gICAgICAgICAgICBwYXRoOiAncGF5bG9hZC1hdXRoL2JldHRlci1hdXRoL3BsdWdpbi9jbGllbnQjVHdvRmFjdG9yQXV0aCdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSxcbiAgICB1c2VybmFtZTogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnVGhlIHVzZXJuYW1lIG9mIHRoZSB1c2VyJyB9XG4gICAgfSksXG4gICAgZGlzcGxheVVzZXJuYW1lOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdUaGUgZGlzcGxheSB1c2VybmFtZSBvZiB0aGUgdXNlcicgfVxuICAgIH0pLFxuICAgIGlzQW5vbnltb3VzOiAoKSA9PiAoe1xuICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgdXNlciBpcyBhbm9ueW1vdXMuJyB9XG4gICAgfSksXG4gICAgcGhvbmVOdW1iZXI6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ1RoZSBwaG9uZSBudW1iZXIgb2YgdGhlIHVzZXInIH1cbiAgICB9KSxcbiAgICBwaG9uZU51bWJlclZlcmlmaWVkOiAoKSA9PiAoe1xuICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgcGhvbmUgbnVtYmVyIG9mIHRoZSB1c2VyIGhhcyBiZWVuIHZlcmlmaWVkJyB9XG4gICAgfSksXG4gICAgYmFubmVkOiAoKSA9PiAoe1xuICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgdXNlciBpcyBiYW5uZWQgZnJvbSB0aGUgcGxhdGZvcm0nIH1cbiAgICB9KSxcbiAgICBiYW5SZWFzb246ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ1RoZSByZWFzb24gZm9yIHRoZSBiYW4nIH1cbiAgICB9KSxcbiAgICBiYW5FeHBpcmVzOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdUaGUgZGF0ZSBhbmQgdGltZSB3aGVuIHRoZSBiYW4gd2lsbCBleHBpcmUnIH1cbiAgICB9KSxcbiAgICBub3JtYWxpemVkRW1haWw6ICgpID0+ICh7XG4gICAgICBhZG1pbjoge1xuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgbm9ybWFsaXplZCBlbWFpbCBvZiB0aGUgdXNlcidcbiAgICAgIH1cbiAgICB9KSxcbiAgICBzdHJpcGVDdXN0b21lcklkOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHtcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIFN0cmlwZSBjdXN0b21lciBJRCBvZiB0aGUgdXNlcidcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgY29sbGVjdGlvbkZpZWxkcyA9IGdldENvbGxlY3Rpb25GaWVsZHMoe1xuICAgIHNjaGVtYTogdXNlclNjaGVtYSxcbiAgICBmaWVsZFJ1bGVzOiB1c2VyRmllbGRSdWxlcyxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmllbGRPdmVycmlkZXNcbiAgfSlcblxuICBsZXQgdXNlcnNDb2xsZWN0aW9uOiBDb2xsZWN0aW9uQ29uZmlnID0ge1xuICAgIC4uLmV4aXN0aW5nVXNlckNvbGxlY3Rpb24sXG4gICAgc2x1ZzogdXNlclNsdWcsXG4gICAgYWRtaW46IHtcbiAgICAgIGRlZmF1bHRDb2x1bW5zOiBbJ2VtYWlsJ10sXG4gICAgICB1c2VBc1RpdGxlOiAnZW1haWwnLFxuICAgICAgZ3JvdXA6IHBsdWdpbk9wdGlvbnM/LmNvbGxlY3Rpb25BZG1pbkdyb3VwID8/ICdBdXRoJyxcbiAgICAgIC4uLmV4aXN0aW5nVXNlckNvbGxlY3Rpb24/LmFkbWluLFxuICAgICAgaGlkZGVuOiBwbHVnaW5PcHRpb25zLnVzZXJzPy5oaWRkZW4gPz8gZmFsc2UsXG4gICAgICBjb21wb25lbnRzOiB7XG4gICAgICAgIERlc2NyaXB0aW9uOiB7XG4gICAgICAgICAgcGF0aDogJ3BheWxvYWQtYXV0aC9iZXR0ZXItYXV0aC9wbHVnaW4vY2xpZW50I0FkbWluSW52aXRlQnV0dG9uJyxcbiAgICAgICAgICBjbGllbnRQcm9wczoge1xuICAgICAgICAgICAgcm9sZXM6IGFsbFJvbGVPcHRpb25zXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgIGVkaXQ6IHtcbiAgICAgICAgICAgIGFkbWluQnV0dG9uczoge1xuICAgICAgICAgICAgICB0YWI6IHtcbiAgICAgICAgICAgICAgICBDb21wb25lbnQ6IHtcbiAgICAgICAgICAgICAgICAgIHBhdGg6ICdwYXlsb2FkLWF1dGgvYmV0dGVyLWF1dGgvcGx1Z2luL2NsaWVudCNBZG1pbkJ1dHRvbnMnLFxuICAgICAgICAgICAgICAgICAgY2xpZW50UHJvcHM6IHtcbiAgICAgICAgICAgICAgICAgICAgdXNlclNsdWcsXG4gICAgICAgICAgICAgICAgICAgIGJhc2VVUkw6IHBsdWdpbk9wdGlvbnMuYmV0dGVyQXV0aE9wdGlvbnM/LmJhc2VVUkwsXG4gICAgICAgICAgICAgICAgICAgIGJhc2VQYXRoOiBwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zPy5iYXNlUGF0aFxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29uZGl0aW9uOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAvLyBPbmx5IHNob3cgdGhlIGltcGVyc29uYXRlIGJ1dHRvbiBpZiB0aGUgYWRtaW4gcGx1Z2luIGlzIGVuYWJsZWRcbiAgICAgICAgICAgICAgICAgIHJldHVybiBjaGVja1BsdWdpbkV4aXN0cyhwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zID8/IHt9LCBzdXBwb3J0ZWRCQVBsdWdpbklkcy5hZG1pbilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGFjY2Vzczoge1xuICAgICAgYWRtaW46IGhhc0FkbWluUm9sZXMoYWRtaW5Sb2xlcyksXG4gICAgICByZWFkOiBpc0FkbWluT3JDdXJyZW50VXNlcldpdGhSb2xlcyh7IGFkbWluUm9sZXMsIGlkRmllbGQ6ICdpZCcgfSksXG4gICAgICBjcmVhdGU6IGlzQWRtaW5XaXRoUm9sZXMoeyBhZG1pblJvbGVzIH0pLFxuICAgICAgZGVsZXRlOiBpc0FkbWluT3JDdXJyZW50VXNlcldpdGhSb2xlcyh7IGFkbWluUm9sZXMsIGlkRmllbGQ6ICdpZCcgfSksXG4gICAgICB1cGRhdGU6IGlzQWRtaW5PckN1cnJlbnRVc2VyVXBkYXRlV2l0aEFsbG93ZWRGaWVsZHMoe1xuICAgICAgICBhbGxvd2VkRmllbGRzLFxuICAgICAgICBhZG1pblJvbGVzLFxuICAgICAgICB1c2VyU2x1Z1xuICAgICAgfSksXG4gICAgICAuLi4oZXhpc3RpbmdVc2VyQ29sbGVjdGlvbj8uYWNjZXNzID8/IHt9KVxuICAgIH0sXG4gICAgY3VzdG9tOiB7XG4gICAgICAuLi4oZXhpc3RpbmdVc2VyQ29sbGVjdGlvbj8uY3VzdG9tID8/IHt9KSxcbiAgICAgIGJldHRlckF1dGhNb2RlbEtleTogYmFNb2RlbEtleS51c2VyXG4gICAgfSxcbiAgICBlbmRwb2ludHM6IFtcbiAgICAgIC4uLihleGlzdGluZ1VzZXJDb2xsZWN0aW9uPy5lbmRwb2ludHMgPyBleGlzdGluZ1VzZXJDb2xsZWN0aW9uLmVuZHBvaW50cyA6IFtdKSxcbiAgICAgIGdldFJlZnJlc2hUb2tlbkVuZHBvaW50KHVzZXJTbHVnKSxcbiAgICAgIGdldFNldEFkbWluUm9sZUVuZHBvaW50KHBsdWdpbk9wdGlvbnMsIHVzZXJTbHVnKSxcbiAgICAgIGdldEdlbmVyYXRlSW52aXRlVXJsRW5kcG9pbnQoe1xuICAgICAgICByb2xlczogYWxsUm9sZU9wdGlvbnMsXG4gICAgICAgIHBsdWdpbk9wdGlvbnNcbiAgICAgIH0pLFxuICAgICAgZ2V0U2VuZEludml0ZVVybEVuZHBvaW50KHBsdWdpbk9wdGlvbnMpXG4gICAgXSxcbiAgICBob29rczoge1xuICAgICAgYmVmb3JlQ2hhbmdlOiBbXG4gICAgICAgIC4uLihleGlzdGluZ1VzZXJDb2xsZWN0aW9uPy5ob29rcz8uYmVmb3JlQ2hhbmdlID8/IFtdKSxcbiAgICAgICAgLi4uKHBsdWdpbk9wdGlvbnMuZGlzYWJsZURlZmF1bHRQYXlsb2FkQXV0aCA/IFtdIDogW2dldE9uVmVyaWZpZWRDaGFuZ2VIb29rKCldKVxuICAgICAgXSxcbiAgICAgIGFmdGVyQ2hhbmdlOiBbXG4gICAgICAgIC4uLihleGlzdGluZ1VzZXJDb2xsZWN0aW9uPy5ob29rcz8uYWZ0ZXJDaGFuZ2UgPz8gW10pLFxuICAgICAgICAuLi4ocGx1Z2luT3B0aW9ucy5kaXNhYmxlRGVmYXVsdFBheWxvYWRBdXRoID8gW10gOiBbZ2V0U3luY0FjY291bnRIb29rKCldKVxuICAgICAgXSxcbiAgICAgIGJlZm9yZUxvZ2luOiBbXG4gICAgICAgIC4uLihleGlzdGluZ1VzZXJDb2xsZWN0aW9uPy5ob29rcz8uYmVmb3JlTG9naW4gPz8gW10pLFxuICAgICAgICAuLi4ocGx1Z2luT3B0aW9ucy5kaXNhYmxlRGVmYXVsdFBheWxvYWRBdXRoID8gW10gOiBbZ2V0QmVmb3JlTG9naW5Ib29rKHBsdWdpbk9wdGlvbnMuYmV0dGVyQXV0aE9wdGlvbnMgPz8ge30pXSlcbiAgICAgIF0sXG4gICAgICBhZnRlckxvZ2luOiBbXG4gICAgICAgIC4uLihleGlzdGluZ1VzZXJDb2xsZWN0aW9uPy5ob29rcz8uYWZ0ZXJMb2dpbiA/PyBbXSksXG4gICAgICAgIC4uLihwbHVnaW5PcHRpb25zLmRpc2FibGVEZWZhdWx0UGF5bG9hZEF1dGggPyBbXSA6IFtnZXRBZnRlckxvZ2luSG9vaygpXSlcbiAgICAgIF0sXG4gICAgICBhZnRlckxvZ291dDogWy4uLihleGlzdGluZ1VzZXJDb2xsZWN0aW9uPy5ob29rcz8uYWZ0ZXJMb2dvdXQgPz8gW10pLCBnZXRBZnRlckxvZ291dEhvb2soKV0sXG4gICAgICBiZWZvcmVEZWxldGU6IFsuLi4oZXhpc3RpbmdVc2VyQ29sbGVjdGlvbj8uaG9va3M/LmJlZm9yZURlbGV0ZSA/PyBbXSksIGdldEJlZm9yZURlbGV0ZUhvb2soKV1cbiAgICB9LFxuICAgIGF1dGg6IHtcbiAgICAgIC4uLihleGlzdGluZ1VzZXJDb2xsZWN0aW9uICYmIHR5cGVvZiBleGlzdGluZ1VzZXJDb2xsZWN0aW9uLmF1dGggPT09ICdvYmplY3QnID8gZXhpc3RpbmdVc2VyQ29sbGVjdGlvbi5hdXRoIDoge30pLFxuICAgICAgZGlzYWJsZUxvY2FsU3RyYXRlZ3k6IHBsdWdpbk9wdGlvbnMuZGlzYWJsZURlZmF1bHRQYXlsb2FkQXV0aCA/IHRydWUgOiB1bmRlZmluZWQsXG4gICAgICAuLi4oaGFzVXNlcm5hbWVQbHVnaW4gJiYge1xuICAgICAgICBsb2dpbldpdGhVc2VybmFtZToge1xuICAgICAgICAgIGFsbG93RW1haWxMb2dpbjogdHJ1ZSxcbiAgICAgICAgICByZXF1aXJlRW1haWw6IHRydWUsXG4gICAgICAgICAgcmVxdWlyZVVzZXJuYW1lOiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIHN0cmF0ZWdpZXM6IFtiZXR0ZXJBdXRoU3RyYXRlZ3kodXNlclNsdWcpXVxuICAgIH0sXG4gICAgZmllbGRzOiBbXG4gICAgICAuLi4oZXhpc3RpbmdVc2VyQ29sbGVjdGlvbj8uZmllbGRzID8/IFtdKSxcbiAgICAgIC4uLihjb2xsZWN0aW9uRmllbGRzID8/IFtdKSxcbiAgICAgIC4uLihjaGVja1BsdWdpbkV4aXN0cyhwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zID8/IHt9LCBzdXBwb3J0ZWRCQVBsdWdpbklkcy5wYXNza2V5KVxuICAgICAgICA/IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbmFtZTogJ21hbmFnZVBhc3NrZXlzJyxcbiAgICAgICAgICAgICAgdHlwZTogJ3VpJyBhcyBjb25zdCxcbiAgICAgICAgICAgICAgYWRtaW46IHtcbiAgICAgICAgICAgICAgICBkaXNhYmxlQnVsa0VkaXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czoge1xuICAgICAgICAgICAgICAgICAgRmllbGQ6IHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogJ3BheWxvYWQtYXV0aC9iZXR0ZXItYXV0aC9wbHVnaW4vcnNjI1Bhc3NrZXlzJyxcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyUHJvcHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICBwYXNza2V5VXNlcklkRmllbGROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgIHBhc3NrZXlTbHVnLFxuICAgICAgICAgICAgICAgICAgICAgIHBsdWdpbk9wdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBhcyBVSUZpZWxkXG4gICAgICAgICAgXVxuICAgICAgICA6IFtdKVxuICAgIF1cbiAgfVxuXG4gIGlmIChwbHVnaW5PcHRpb25zLnVzZXJzPy5jb2xsZWN0aW9uT3ZlcnJpZGVzKSB7XG4gICAgdXNlcnNDb2xsZWN0aW9uID0gcGx1Z2luT3B0aW9ucy51c2Vycy5jb2xsZWN0aW9uT3ZlcnJpZGVzKHtcbiAgICAgIGNvbGxlY3Rpb246IHVzZXJzQ29sbGVjdGlvblxuICAgIH0pXG4gIH1cblxuICBhc3NlcnRBbGxTY2hlbWFGaWVsZHModXNlcnNDb2xsZWN0aW9uLCB1c2VyU2NoZW1hKVxuXG4gIHJldHVybiB1c2Vyc0NvbGxlY3Rpb25cbn1cbiJdLCJuYW1lcyI6WyJjaGVja1BsdWdpbkV4aXN0cyIsImJhTW9kZWxGaWVsZEtleXMiLCJiYU1vZGVsS2V5IiwiZGVmYXVsdHMiLCJzdXBwb3J0ZWRCQVBsdWdpbklkcyIsImdldEFsbFJvbGVPcHRpb25zIiwiYXNzZXJ0QWxsU2NoZW1hRmllbGRzIiwiZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWciLCJnZXRTY2hlbWFGaWVsZE5hbWUiLCJoYXNBZG1pblJvbGVzIiwiaXNBZG1pbk9yQ3VycmVudFVzZXJVcGRhdGVXaXRoQWxsb3dlZEZpZWxkcyIsImlzQWRtaW5PckN1cnJlbnRVc2VyV2l0aFJvbGVzIiwiaXNBZG1pbldpdGhSb2xlcyIsImdldENvbGxlY3Rpb25GaWVsZHMiLCJiZXR0ZXJBdXRoU3RyYXRlZ3kiLCJnZXRHZW5lcmF0ZUludml0ZVVybEVuZHBvaW50IiwiZ2V0UmVmcmVzaFRva2VuRW5kcG9pbnQiLCJnZXRTZW5kSW52aXRlVXJsRW5kcG9pbnQiLCJnZXRTZXRBZG1pblJvbGVFbmRwb2ludCIsImdldFN5bmNBY2NvdW50SG9vayIsImdldEFmdGVyTG9naW5Ib29rIiwiZ2V0QWZ0ZXJMb2dvdXRIb29rIiwiZ2V0QmVmb3JlRGVsZXRlSG9vayIsImdldEJlZm9yZUxvZ2luSG9vayIsImdldE9uVmVyaWZpZWRDaGFuZ2VIb29rIiwiYnVpbGRVc2Vyc0NvbGxlY3Rpb24iLCJpbmNvbWluZ0NvbGxlY3Rpb25zIiwicGx1Z2luT3B0aW9ucyIsInJlc29sdmVkU2NoZW1hcyIsInVzZXJTbHVnIiwidXNlciIsInBhc3NrZXlTbHVnIiwicGFzc2tleSIsInBhc3NrZXlVc2VySWRGaWVsZE5hbWUiLCJ1c2VySWQiLCJ1c2VyU2NoZW1hIiwiYWRtaW5Sb2xlcyIsInVzZXJzIiwiYWRtaW5Sb2xlIiwiYWxsUm9sZU9wdGlvbnMiLCJoYXNVc2VybmFtZVBsdWdpbiIsImJldHRlckF1dGhPcHRpb25zIiwidXNlcm5hbWUiLCJleGlzdGluZ1VzZXJDb2xsZWN0aW9uIiwiZmluZCIsImNvbGxlY3Rpb24iLCJzbHVnIiwiYWxsb3dlZEZpZWxkcyIsInVzZXJGaWVsZFJ1bGVzIiwiY29uZGl0aW9uIiwiZmllbGQiLCJmaWVsZE5hbWUiLCJ0cmFuc2Zvcm0iLCJzYXZlVG9KV1QiLCJhZG1pbiIsImRpc2FibGVCdWxrRWRpdCIsImhpZGRlbiIsImluZGV4IiwibGFiZWwiLCJ0IiwiZmllbGRPdmVycmlkZXMiLCJyb2xlIiwidHlwZSIsImhhc01hbnkiLCJvcHRpb25zIiwiZGVmYXVsdFZhbHVlIiwidXNlclJvbGUiLCJkZXNjcmlwdGlvbiIsImVtYWlsIiwiZW1haWxWZXJpZmllZCIsIm5hbWUiLCJpbWFnZSIsInR3b0ZhY3RvckVuYWJsZWQiLCJjb21wb25lbnRzIiwiRmllbGQiLCJwYXRoIiwiZGlzcGxheVVzZXJuYW1lIiwiaXNBbm9ueW1vdXMiLCJwaG9uZU51bWJlciIsInBob25lTnVtYmVyVmVyaWZpZWQiLCJiYW5uZWQiLCJiYW5SZWFzb24iLCJiYW5FeHBpcmVzIiwibm9ybWFsaXplZEVtYWlsIiwicmVhZE9ubHkiLCJzdHJpcGVDdXN0b21lcklkIiwiY29sbGVjdGlvbkZpZWxkcyIsInNjaGVtYSIsImZpZWxkUnVsZXMiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInVzZXJzQ29sbGVjdGlvbiIsImRlZmF1bHRDb2x1bW5zIiwidXNlQXNUaXRsZSIsImdyb3VwIiwiY29sbGVjdGlvbkFkbWluR3JvdXAiLCJEZXNjcmlwdGlvbiIsImNsaWVudFByb3BzIiwicm9sZXMiLCJ2aWV3cyIsImVkaXQiLCJhZG1pbkJ1dHRvbnMiLCJ0YWIiLCJDb21wb25lbnQiLCJiYXNlVVJMIiwiYmFzZVBhdGgiLCJhY2Nlc3MiLCJyZWFkIiwiaWRGaWVsZCIsImNyZWF0ZSIsImRlbGV0ZSIsInVwZGF0ZSIsImN1c3RvbSIsImJldHRlckF1dGhNb2RlbEtleSIsImVuZHBvaW50cyIsImhvb2tzIiwiYmVmb3JlQ2hhbmdlIiwiZGlzYWJsZURlZmF1bHRQYXlsb2FkQXV0aCIsImFmdGVyQ2hhbmdlIiwiYmVmb3JlTG9naW4iLCJhZnRlckxvZ2luIiwiYWZ0ZXJMb2dvdXQiLCJiZWZvcmVEZWxldGUiLCJhdXRoIiwiZGlzYWJsZUxvY2FsU3RyYXRlZ3kiLCJ1bmRlZmluZWQiLCJsb2dpbldpdGhVc2VybmFtZSIsImFsbG93RW1haWxMb2dpbiIsInJlcXVpcmVFbWFpbCIsInJlcXVpcmVVc2VybmFtZSIsInN0cmF0ZWdpZXMiLCJmaWVsZHMiLCJzZXJ2ZXJQcm9wcyIsImNvbGxlY3Rpb25PdmVycmlkZXMiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLGlCQUFpQixRQUFRLHVDQUFrRDtBQUNwRixTQUFTQyxnQkFBZ0IsRUFBRUMsVUFBVSxFQUFFQyxRQUFRLEVBQUVDLG9CQUFvQixRQUFRLHFCQUFvQjtBQUNqRyxTQUFTQyxpQkFBaUIsUUFBUSxpQ0FBZ0M7QUFDbEUsU0FBU0MscUJBQXFCLEVBQUVDLHVCQUF1QixFQUFFQyxrQkFBa0IsUUFBUSw2QkFBNEI7QUFDL0csU0FDRUMsYUFBYSxFQUNiQywyQ0FBMkMsRUFDM0NDLDZCQUE2QixFQUM3QkMsZ0JBQWdCLFFBQ1gsMEJBQXlCO0FBQ2hDLFNBQVNDLG1CQUFtQixRQUFRLDhDQUE2QztBQUNqRixTQUFTQyxrQkFBa0IsUUFBUSx5QkFBd0I7QUFDM0QsU0FBU0MsNEJBQTRCLEVBQUVDLHVCQUF1QixFQUFFQyx3QkFBd0IsRUFBRUMsdUJBQXVCLFFBQVEsY0FBYTtBQUN0SSxTQUNFQyxrQkFBa0IsRUFDbEJDLGlCQUFpQixFQUNqQkMsa0JBQWtCLEVBQ2xCQyxtQkFBbUIsRUFDbkJDLGtCQUFrQixFQUNsQkMsdUJBQXVCLFFBQ2xCLFVBQVM7QUFNaEIsT0FBTyxTQUFTQyxxQkFBcUIsRUFBRUMsbUJBQW1CLEVBQUVDLGFBQWEsRUFBRUMsZUFB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