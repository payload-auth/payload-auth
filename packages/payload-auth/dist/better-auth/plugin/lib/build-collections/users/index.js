import { checkPluginExists } from "../../../helpers/check-plugin-exists";
import { baModelFieldKeys, baModelKey, defaults, supportedBAPluginIds } from "../../../constants";
import { getAllRoleOptions } from "../../../helpers/get-all-roles";
import { assertAllSchemaFields, getSchemaCollectionSlug, getSchemaFieldName } from "../utils/collection-schema";
import { isAdminOrCurrentUserUpdateWithAllowedFields, isAdminOrCurrentUserWithRoles, isAdminWithRoles } from "../utils/payload-access";
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
                options: allRoleOptions,
                defaultValue: field.defaultValue ?? defaults.userRole,
                saveToJWT: true,
                admin: {
                    description: 'The role of the user'
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
            admin: ({ req })=>adminRoles.includes(req.user?.role ?? 'user'),
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3VzZXJzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNoZWNrUGx1Z2luRXhpc3RzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vaGVscGVycy9jaGVjay1wbHVnaW4tZXhpc3RzJ1xuaW1wb3J0IHsgZ2V0RGVmYXVsdENvbGxlY3Rpb25TbHVnIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vaGVscGVycy9nZXQtY29sbGVjdGlvbi1zbHVnJ1xuaW1wb3J0IHsgYmFNb2RlbEZpZWxkS2V5cywgYmFNb2RlbEtleSwgZGVmYXVsdHMsIHN1cHBvcnRlZEJBUGx1Z2luSWRzIH0gZnJvbSAnLi4vLi4vLi4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgZ2V0QWxsUm9sZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9oZWxwZXJzL2dldC1hbGwtcm9sZXMnXG5pbXBvcnQgeyBhc3NlcnRBbGxTY2hlbWFGaWVsZHMsIGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnLCBnZXRTY2hlbWFGaWVsZE5hbWUgfSBmcm9tICcuLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcbmltcG9ydCB7IGlzQWRtaW5PckN1cnJlbnRVc2VyVXBkYXRlV2l0aEFsbG93ZWRGaWVsZHMsIGlzQWRtaW5PckN1cnJlbnRVc2VyV2l0aFJvbGVzLCBpc0FkbWluV2l0aFJvbGVzIH0gZnJvbSAnLi4vdXRpbHMvcGF5bG9hZC1hY2Nlc3MnXG5pbXBvcnQgeyBnZXRDb2xsZWN0aW9uRmllbGRzIH0gZnJvbSAnLi4vdXRpbHMvdHJhbnNmb3JtLXNjaGVtYS1maWVsZHMtdG8tcGF5bG9hZCdcbmltcG9ydCB7IGJldHRlckF1dGhTdHJhdGVneSB9IGZyb20gJy4vYmV0dGVyLWF1dGgtc3RyYXRlZ3knXG5pbXBvcnQgeyBnZXRHZW5lcmF0ZUludml0ZVVybEVuZHBvaW50LCBnZXRSZWZyZXNoVG9rZW5FbmRwb2ludCwgZ2V0U2VuZEludml0ZVVybEVuZHBvaW50LCBnZXRTZXRBZG1pblJvbGVFbmRwb2ludCB9IGZyb20gJy4vZW5kcG9pbnRzJ1xuaW1wb3J0IHtcbiAgZ2V0U3luY0FjY291bnRIb29rLFxuICBnZXRBZnRlckxvZ2luSG9vayxcbiAgZ2V0QWZ0ZXJMb2dvdXRIb29rLFxuICBnZXRCZWZvcmVEZWxldGVIb29rLFxuICBnZXRCZWZvcmVMb2dpbkhvb2ssXG4gIGdldE9uVmVyaWZpZWRDaGFuZ2VIb29rXG59IGZyb20gJy4vaG9va3MnXG5cbmltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZywgVUlGaWVsZCB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgdHlwZSB7IEZpZWxkUnVsZSB9IGZyb20gJy4uL3V0aWxzL21vZGVsLWZpZWxkLXRyYW5zZm9ybWF0aW9ucydcbmltcG9ydCB0eXBlIHsgQnVpbGRDb2xsZWN0aW9uUHJvcHMsIEZpZWxkT3ZlcnJpZGVzIH0gZnJvbSAnLi4vLi4vLi4vdHlwZXMnXG5pbXBvcnQgdHlwZSB7IFVzZXIgfSBmcm9tICdAL2JldHRlci1hdXRoL2dlbmVyYXRlZC10eXBlcydcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVXNlcnNDb2xsZWN0aW9uKHsgaW5jb21pbmdDb2xsZWN0aW9ucywgcGx1Z2luT3B0aW9ucywgcmVzb2x2ZWRTY2hlbWFzIH06IEJ1aWxkQ29sbGVjdGlvblByb3BzKTogQ29sbGVjdGlvbkNvbmZpZyB7XG4gIGNvbnN0IHVzZXJTbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LnVzZXIpXG4gIGNvbnN0IHBhc3NrZXlTbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LnBhc3NrZXkpXG4gIGNvbnN0IHBhc3NrZXlVc2VySWRGaWVsZE5hbWUgPSBnZXRTY2hlbWFGaWVsZE5hbWUocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LnBhc3NrZXksIGJhTW9kZWxGaWVsZEtleXMucGFzc2tleS51c2VySWQpXG4gIGNvbnN0IHVzZXJTY2hlbWEgPSByZXNvbHZlZFNjaGVtYXNbYmFNb2RlbEtleS51c2VyXVxuICBjb25zdCBhZG1pblJvbGVzID0gcGx1Z2luT3B0aW9ucy51c2Vycz8uYWRtaW5Sb2xlcyA/PyBbZGVmYXVsdHMuYWRtaW5Sb2xlXVxuICBjb25zdCBhbGxSb2xlT3B0aW9ucyA9IGdldEFsbFJvbGVPcHRpb25zKHBsdWdpbk9wdGlvbnMpXG4gIGNvbnN0IGhhc1VzZXJuYW1lUGx1Z2luID0gY2hlY2tQbHVnaW5FeGlzdHMocGx1Z2luT3B0aW9ucy5iZXR0ZXJBdXRoT3B0aW9ucyA/PyB7fSwgc3VwcG9ydGVkQkFQbHVnaW5JZHMudXNlcm5hbWUpXG4gIGNvbnN0IGV4aXN0aW5nVXNlckNvbGxlY3Rpb24gPSBpbmNvbWluZ0NvbGxlY3Rpb25zLmZpbmQoKGNvbGxlY3Rpb24pID0+IGNvbGxlY3Rpb24uc2x1ZyA9PT0gdXNlclNsdWcpIGFzIENvbGxlY3Rpb25Db25maWcgfCB1bmRlZmluZWRcblxuICAvLyBUT0RPOiBSRVZJRVcgVEhJU1xuICBjb25zdCBhbGxvd2VkRmllbGRzID0gcGx1Z2luT3B0aW9ucy51c2Vycz8uYWxsb3dlZEZpZWxkcyA/PyBbJ25hbWUnXVxuXG4gIGNvbnN0IHVzZXJGaWVsZFJ1bGVzOiBGaWVsZFJ1bGVbXSA9IFtcbiAgICB7XG4gICAgICBjb25kaXRpb246IChmaWVsZCkgPT4gZmllbGQuZmllbGROYW1lID09PSAnY3JlYXRlZEF0JyB8fCBmaWVsZC5maWVsZE5hbWUgPT09ICd1cGRhdGVkQXQnLFxuICAgICAgdHJhbnNmb3JtOiAoZmllbGQpID0+ICh7XG4gICAgICAgIC4uLmZpZWxkLFxuICAgICAgICBzYXZlVG9KV1Q6IGZhbHNlLFxuICAgICAgICBhZG1pbjoge1xuICAgICAgICAgIGRpc2FibGVCdWxrRWRpdDogdHJ1ZSxcbiAgICAgICAgICBoaWRkZW46IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgaW5kZXg6IHRydWUsXG4gICAgICAgIGxhYmVsOiAoeyB0IH06IGFueSkgPT4gKGZpZWxkLmZpZWxkTmFtZSA9PT0gJ2NyZWF0ZWRBdCcgPyB0KCdnZW5lcmFsOmNyZWF0ZWRBdCcpIDogdCgnZ2VuZXJhbDp1cGRhdGVkQXQnKSlcbiAgICAgIH0pXG4gICAgfVxuICBdXG5cbiAgY29uc3QgZmllbGRPdmVycmlkZXM6IEZpZWxkT3ZlcnJpZGVzPGtleW9mIFVzZXI+ID0ge1xuICAgIHJvbGU6IChmaWVsZCkgPT4gKHtcbiAgICAgIHR5cGU6ICdzZWxlY3QnLFxuICAgICAgb3B0aW9uczogYWxsUm9sZU9wdGlvbnMsXG4gICAgICBkZWZhdWx0VmFsdWU6IGZpZWxkLmRlZmF1bHRWYWx1ZSA/PyBkZWZhdWx0cy51c2VyUm9sZSxcbiAgICAgIHNhdmVUb0pXVDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnVGhlIHJvbGUgb2YgdGhlIHVzZXInIH1cbiAgICB9KSxcbiAgICBlbWFpbDogKCkgPT4gKHtcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdUaGUgZW1haWwgb2YgdGhlIHVzZXInIH1cbiAgICB9KSxcbiAgICBlbWFpbFZlcmlmaWVkOiAoZmllbGQpID0+ICh7XG4gICAgICBkZWZhdWx0VmFsdWU6IGZpZWxkLmRlZmF1bHRWYWx1ZSA/PyBmYWxzZSxcbiAgICAgIHNhdmVUb0pXVDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgZW1haWwgb2YgdGhlIHVzZXIgaGFzIGJlZW4gdmVyaWZpZWQnIH1cbiAgICB9KSxcbiAgICBuYW1lOiAoKSA9PiAoe1xuICAgICAgc2F2ZVRvSldUOiB0cnVlLFxuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdVc2VycyBjaG9zZW4gZGlzcGxheSBuYW1lJyB9XG4gICAgfSksXG4gICAgaW1hZ2U6ICgpID0+ICh7XG4gICAgICBzYXZlVG9KV1Q6IGZhbHNlLFxuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdUaGUgaW1hZ2Ugb2YgdGhlIHVzZXInIH1cbiAgICB9KSxcbiAgICB0d29GYWN0b3JFbmFibGVkOiAoKSA9PiAoe1xuICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgdXNlciBoYXMgdHdvIGZhY3RvciBhdXRoZW50aWNhdGlvbiBlbmFibGVkJyxcbiAgICAgICAgY29tcG9uZW50czoge1xuICAgICAgICAgIEZpZWxkOiB7XG4gICAgICAgICAgICBwYXRoOiAncGF5bG9hZC1hdXRoL2JldHRlci1hdXRoL3BsdWdpbi9jbGllbnQjVHdvRmFjdG9yQXV0aCdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSxcbiAgICB1c2VybmFtZTogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnVGhlIHVzZXJuYW1lIG9mIHRoZSB1c2VyJyB9XG4gICAgfSksXG4gICAgZGlzcGxheVVzZXJuYW1lOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdUaGUgZGlzcGxheSB1c2VybmFtZSBvZiB0aGUgdXNlcicgfVxuICAgIH0pLFxuICAgIGlzQW5vbnltb3VzOiAoKSA9PiAoe1xuICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgdXNlciBpcyBhbm9ueW1vdXMuJyB9XG4gICAgfSksXG4gICAgcGhvbmVOdW1iZXI6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ1RoZSBwaG9uZSBudW1iZXIgb2YgdGhlIHVzZXInIH1cbiAgICB9KSxcbiAgICBwaG9uZU51bWJlclZlcmlmaWVkOiAoKSA9PiAoe1xuICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgcGhvbmUgbnVtYmVyIG9mIHRoZSB1c2VyIGhhcyBiZWVuIHZlcmlmaWVkJyB9XG4gICAgfSksXG4gICAgYmFubmVkOiAoKSA9PiAoe1xuICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgdXNlciBpcyBiYW5uZWQgZnJvbSB0aGUgcGxhdGZvcm0nIH1cbiAgICB9KSxcbiAgICBiYW5SZWFzb246ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ1RoZSByZWFzb24gZm9yIHRoZSBiYW4nIH1cbiAgICB9KSxcbiAgICBiYW5FeHBpcmVzOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdUaGUgZGF0ZSBhbmQgdGltZSB3aGVuIHRoZSBiYW4gd2lsbCBleHBpcmUnIH1cbiAgICB9KSxcbiAgICBub3JtYWxpemVkRW1haWw6ICgpID0+ICh7XG4gICAgICBhZG1pbjoge1xuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgbm9ybWFsaXplZCBlbWFpbCBvZiB0aGUgdXNlcidcbiAgICAgIH1cbiAgICB9KSxcbiAgICBzdHJpcGVDdXN0b21lcklkOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHtcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIFN0cmlwZSBjdXN0b21lciBJRCBvZiB0aGUgdXNlcidcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgY29sbGVjdGlvbkZpZWxkcyA9IGdldENvbGxlY3Rpb25GaWVsZHMoe1xuICAgIHNjaGVtYTogdXNlclNjaGVtYSxcbiAgICBmaWVsZFJ1bGVzOiB1c2VyRmllbGRSdWxlcyxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmllbGRPdmVycmlkZXNcbiAgfSlcblxuICBsZXQgdXNlcnNDb2xsZWN0aW9uOiBDb2xsZWN0aW9uQ29uZmlnID0ge1xuICAgIC4uLmV4aXN0aW5nVXNlckNvbGxlY3Rpb24sXG4gICAgc2x1ZzogdXNlclNsdWcsXG4gICAgYWRtaW46IHtcbiAgICAgIGRlZmF1bHRDb2x1bW5zOiBbJ2VtYWlsJ10sXG4gICAgICB1c2VBc1RpdGxlOiAnZW1haWwnLFxuICAgICAgZ3JvdXA6IHBsdWdpbk9wdGlvbnM/LmNvbGxlY3Rpb25BZG1pbkdyb3VwID8/ICdBdXRoJyxcbiAgICAgIC4uLmV4aXN0aW5nVXNlckNvbGxlY3Rpb24/LmFkbWluLFxuICAgICAgaGlkZGVuOiBwbHVnaW5PcHRpb25zLnVzZXJzPy5oaWRkZW4gPz8gZmFsc2UsXG4gICAgICBjb21wb25lbnRzOiB7XG4gICAgICAgIERlc2NyaXB0aW9uOiB7XG4gICAgICAgICAgcGF0aDogJ3BheWxvYWQtYXV0aC9iZXR0ZXItYXV0aC9wbHVnaW4vY2xpZW50I0FkbWluSW52aXRlQnV0dG9uJyxcbiAgICAgICAgICBjbGllbnRQcm9wczoge1xuICAgICAgICAgICAgcm9sZXM6IGFsbFJvbGVPcHRpb25zXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB2aWV3czoge1xuICAgICAgICAgIGVkaXQ6IHtcbiAgICAgICAgICAgIGFkbWluQnV0dG9uczoge1xuICAgICAgICAgICAgICB0YWI6IHtcbiAgICAgICAgICAgICAgICBDb21wb25lbnQ6IHtcbiAgICAgICAgICAgICAgICAgIHBhdGg6ICdwYXlsb2FkLWF1dGgvYmV0dGVyLWF1dGgvcGx1Z2luL2NsaWVudCNBZG1pbkJ1dHRvbnMnLFxuICAgICAgICAgICAgICAgICAgY2xpZW50UHJvcHM6IHtcbiAgICAgICAgICAgICAgICAgICAgdXNlclNsdWcsXG4gICAgICAgICAgICAgICAgICAgIGJhc2VVUkw6IHBsdWdpbk9wdGlvbnMuYmV0dGVyQXV0aE9wdGlvbnM/LmJhc2VVUkwsXG4gICAgICAgICAgICAgICAgICAgIGJhc2VQYXRoOiBwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zPy5iYXNlUGF0aFxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29uZGl0aW9uOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAvLyBPbmx5IHNob3cgdGhlIGltcGVyc29uYXRlIGJ1dHRvbiBpZiB0aGUgYWRtaW4gcGx1Z2luIGlzIGVuYWJsZWRcbiAgICAgICAgICAgICAgICAgIHJldHVybiBjaGVja1BsdWdpbkV4aXN0cyhwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zID8/IHt9LCBzdXBwb3J0ZWRCQVBsdWdpbklkcy5hZG1pbilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGFjY2Vzczoge1xuICAgICAgYWRtaW46ICh7IHJlcSB9KSA9PiBhZG1pblJvbGVzLmluY2x1ZGVzKChyZXEudXNlcj8ucm9sZSBhcyBzdHJpbmcpID8/ICd1c2VyJyksXG4gICAgICByZWFkOiBpc0FkbWluT3JDdXJyZW50VXNlcldpdGhSb2xlcyh7IGFkbWluUm9sZXMsIGlkRmllbGQ6ICdpZCcgfSksXG4gICAgICBjcmVhdGU6IGlzQWRtaW5XaXRoUm9sZXMoeyBhZG1pblJvbGVzIH0pLFxuICAgICAgZGVsZXRlOiBpc0FkbWluT3JDdXJyZW50VXNlcldpdGhSb2xlcyh7IGFkbWluUm9sZXMsIGlkRmllbGQ6ICdpZCcgfSksXG4gICAgICB1cGRhdGU6IGlzQWRtaW5PckN1cnJlbnRVc2VyVXBkYXRlV2l0aEFsbG93ZWRGaWVsZHMoe1xuICAgICAgICBhbGxvd2VkRmllbGRzLFxuICAgICAgICBhZG1pblJvbGVzLFxuICAgICAgICB1c2VyU2x1Z1xuICAgICAgfSksXG4gICAgICAuLi4oZXhpc3RpbmdVc2VyQ29sbGVjdGlvbj8uYWNjZXNzID8/IHt9KVxuICAgIH0sXG4gICAgY3VzdG9tOiB7XG4gICAgICAuLi4oZXhpc3RpbmdVc2VyQ29sbGVjdGlvbj8uY3VzdG9tID8/IHt9KSxcbiAgICAgIGJldHRlckF1dGhNb2RlbEtleTogYmFNb2RlbEtleS51c2VyXG4gICAgfSxcbiAgICBlbmRwb2ludHM6IFtcbiAgICAgIC4uLihleGlzdGluZ1VzZXJDb2xsZWN0aW9uPy5lbmRwb2ludHMgPyBleGlzdGluZ1VzZXJDb2xsZWN0aW9uLmVuZHBvaW50cyA6IFtdKSxcbiAgICAgIGdldFJlZnJlc2hUb2tlbkVuZHBvaW50KHVzZXJTbHVnKSxcbiAgICAgIGdldFNldEFkbWluUm9sZUVuZHBvaW50KHBsdWdpbk9wdGlvbnMsIHVzZXJTbHVnKSxcbiAgICAgIGdldEdlbmVyYXRlSW52aXRlVXJsRW5kcG9pbnQoe1xuICAgICAgICByb2xlczogYWxsUm9sZU9wdGlvbnMsXG4gICAgICAgIHBsdWdpbk9wdGlvbnNcbiAgICAgIH0pLFxuICAgICAgZ2V0U2VuZEludml0ZVVybEVuZHBvaW50KHBsdWdpbk9wdGlvbnMpXG4gICAgXSxcbiAgICBob29rczoge1xuICAgICAgYmVmb3JlQ2hhbmdlOiBbXG4gICAgICAgIC4uLihleGlzdGluZ1VzZXJDb2xsZWN0aW9uPy5ob29rcz8uYmVmb3JlQ2hhbmdlID8/IFtdKSxcbiAgICAgICAgLi4uKHBsdWdpbk9wdGlvbnMuZGlzYWJsZURlZmF1bHRQYXlsb2FkQXV0aCA/IFtdIDogW2dldE9uVmVyaWZpZWRDaGFuZ2VIb29rKCldKVxuICAgICAgXSxcbiAgICAgIGFmdGVyQ2hhbmdlOiBbXG4gICAgICAgIC4uLihleGlzdGluZ1VzZXJDb2xsZWN0aW9uPy5ob29rcz8uYWZ0ZXJDaGFuZ2UgPz8gW10pLFxuICAgICAgICAuLi4ocGx1Z2luT3B0aW9ucy5kaXNhYmxlRGVmYXVsdFBheWxvYWRBdXRoID8gW10gOiBbZ2V0U3luY0FjY291bnRIb29rKCldKVxuICAgICAgXSxcbiAgICAgIGJlZm9yZUxvZ2luOiBbXG4gICAgICAgIC4uLihleGlzdGluZ1VzZXJDb2xsZWN0aW9uPy5ob29rcz8uYmVmb3JlTG9naW4gPz8gW10pLFxuICAgICAgICAuLi4ocGx1Z2luT3B0aW9ucy5kaXNhYmxlRGVmYXVsdFBheWxvYWRBdXRoID8gW10gOiBbZ2V0QmVmb3JlTG9naW5Ib29rKHBsdWdpbk9wdGlvbnMuYmV0dGVyQXV0aE9wdGlvbnMgPz8ge30pXSlcbiAgICAgIF0sXG4gICAgICBhZnRlckxvZ2luOiBbXG4gICAgICAgIC4uLihleGlzdGluZ1VzZXJDb2xsZWN0aW9uPy5ob29rcz8uYWZ0ZXJMb2dpbiA/PyBbXSksXG4gICAgICAgIC4uLihwbHVnaW5PcHRpb25zLmRpc2FibGVEZWZhdWx0UGF5bG9hZEF1dGggPyBbXSA6IFtnZXRBZnRlckxvZ2luSG9vaygpXSlcbiAgICAgIF0sXG4gICAgICBhZnRlckxvZ291dDogWy4uLihleGlzdGluZ1VzZXJDb2xsZWN0aW9uPy5ob29rcz8uYWZ0ZXJMb2dvdXQgPz8gW10pLCBnZXRBZnRlckxvZ291dEhvb2soKV0sXG4gICAgICBiZWZvcmVEZWxldGU6IFsuLi4oZXhpc3RpbmdVc2VyQ29sbGVjdGlvbj8uaG9va3M/LmJlZm9yZURlbGV0ZSA/PyBbXSksIGdldEJlZm9yZURlbGV0ZUhvb2soKV1cbiAgICB9LFxuICAgIGF1dGg6IHtcbiAgICAgIC4uLihleGlzdGluZ1VzZXJDb2xsZWN0aW9uICYmIHR5cGVvZiBleGlzdGluZ1VzZXJDb2xsZWN0aW9uLmF1dGggPT09ICdvYmplY3QnID8gZXhpc3RpbmdVc2VyQ29sbGVjdGlvbi5hdXRoIDoge30pLFxuICAgICAgZGlzYWJsZUxvY2FsU3RyYXRlZ3k6IHBsdWdpbk9wdGlvbnMuZGlzYWJsZURlZmF1bHRQYXlsb2FkQXV0aCA/IHRydWUgOiB1bmRlZmluZWQsXG4gICAgICAuLi4oaGFzVXNlcm5hbWVQbHVnaW4gJiYge1xuICAgICAgICBsb2dpbldpdGhVc2VybmFtZToge1xuICAgICAgICAgIGFsbG93RW1haWxMb2dpbjogdHJ1ZSxcbiAgICAgICAgICByZXF1aXJlRW1haWw6IHRydWUsXG4gICAgICAgICAgcmVxdWlyZVVzZXJuYW1lOiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIHN0cmF0ZWdpZXM6IFtiZXR0ZXJBdXRoU3RyYXRlZ3kodXNlclNsdWcpXVxuICAgIH0sXG4gICAgZmllbGRzOiBbXG4gICAgICAuLi4oZXhpc3RpbmdVc2VyQ29sbGVjdGlvbj8uZmllbGRzID8/IFtdKSxcbiAgICAgIC4uLihjb2xsZWN0aW9uRmllbGRzID8/IFtdKSxcbiAgICAgIC4uLihjaGVja1BsdWdpbkV4aXN0cyhwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zID8/IHt9LCBzdXBwb3J0ZWRCQVBsdWdpbklkcy5wYXNza2V5KVxuICAgICAgICA/IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbmFtZTogJ21hbmFnZVBhc3NrZXlzJyxcbiAgICAgICAgICAgICAgdHlwZTogJ3VpJyBhcyBjb25zdCxcbiAgICAgICAgICAgICAgYWRtaW46IHtcbiAgICAgICAgICAgICAgICBkaXNhYmxlQnVsa0VkaXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czoge1xuICAgICAgICAgICAgICAgICAgRmllbGQ6IHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogJ3BheWxvYWQtYXV0aC9iZXR0ZXItYXV0aC9wbHVnaW4vcnNjI1Bhc3NrZXlzJyxcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyUHJvcHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICBwYXNza2V5VXNlcklkRmllbGROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgIHBhc3NrZXlTbHVnLFxuICAgICAgICAgICAgICAgICAgICAgIHBsdWdpbk9wdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBhcyBVSUZpZWxkXG4gICAgICAgICAgXVxuICAgICAgICA6IFtdKVxuICAgIF1cbiAgfVxuXG4gIGlmIChwbHVnaW5PcHRpb25zLnVzZXJzPy5jb2xsZWN0aW9uT3ZlcnJpZGVzKSB7XG4gICAgdXNlcnNDb2xsZWN0aW9uID0gcGx1Z2luT3B0aW9ucy51c2Vycy5jb2xsZWN0aW9uT3ZlcnJpZGVzKHtcbiAgICAgIGNvbGxlY3Rpb246IHVzZXJzQ29sbGVjdGlvblxuICAgIH0pXG4gIH1cblxuICBhc3NlcnRBbGxTY2hlbWFGaWVsZHModXNlcnNDb2xsZWN0aW9uLCB1c2VyU2NoZW1hKVxuXG4gIHJldHVybiB1c2Vyc0NvbGxlY3Rpb25cbn1cbiJdLCJuYW1lcyI6WyJjaGVja1BsdWdpbkV4aXN0cyIsImJhTW9kZWxGaWVsZEtleXMiLCJiYU1vZGVsS2V5IiwiZGVmYXVsdHMiLCJzdXBwb3J0ZWRCQVBsdWdpbklkcyIsImdldEFsbFJvbGVPcHRpb25zIiwiYXNzZXJ0QWxsU2NoZW1hRmllbGRzIiwiZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWciLCJnZXRTY2hlbWFGaWVsZE5hbWUiLCJpc0FkbWluT3JDdXJyZW50VXNlclVwZGF0ZVdpdGhBbGxvd2VkRmllbGRzIiwiaXNBZG1pbk9yQ3VycmVudFVzZXJXaXRoUm9sZXMiLCJpc0FkbWluV2l0aFJvbGVzIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsImJldHRlckF1dGhTdHJhdGVneSIsImdldEdlbmVyYXRlSW52aXRlVXJsRW5kcG9pbnQiLCJnZXRSZWZyZXNoVG9rZW5FbmRwb2ludCIsImdldFNlbmRJbnZpdGVVcmxFbmRwb2ludCIsImdldFNldEFkbWluUm9sZUVuZHBvaW50IiwiZ2V0U3luY0FjY291bnRIb29rIiwiZ2V0QWZ0ZXJMb2dpbkhvb2siLCJnZXRBZnRlckxvZ291dEhvb2siLCJnZXRCZWZvcmVEZWxldGVIb29rIiwiZ2V0QmVmb3JlTG9naW5Ib29rIiwiZ2V0T25WZXJpZmllZENoYW5nZUhvb2siLCJidWlsZFVzZXJzQ29sbGVjdGlvbiIsImluY29taW5nQ29sbGVjdGlvbnMiLCJwbHVnaW5PcHRpb25zIiwicmVzb2x2ZWRTY2hlbWFzIiwidXNlclNsdWciLCJ1c2VyIiwicGFzc2tleVNsdWciLCJwYXNza2V5IiwicGFzc2tleVVzZXJJZEZpZWxkTmFtZSIsInVzZXJJZCIsInVzZXJTY2hlbWEiLCJhZG1pblJvbGVzIiwidXNlcnMiLCJhZG1pblJvbGUiLCJhbGxSb2xlT3B0aW9ucyIsImhhc1VzZXJuYW1lUGx1Z2luIiwiYmV0dGVyQXV0aE9wdGlvbnMiLCJ1c2VybmFtZSIsImV4aXN0aW5nVXNlckNvbGxlY3Rpb24iLCJmaW5kIiwiY29sbGVjdGlvbiIsInNsdWciLCJhbGxvd2VkRmllbGRzIiwidXNlckZpZWxkUnVsZXMiLCJjb25kaXRpb24iLCJmaWVsZCIsImZpZWxkTmFtZSIsInRyYW5zZm9ybSIsInNhdmVUb0pXVCIsImFkbWluIiwiZGlzYWJsZUJ1bGtFZGl0IiwiaGlkZGVuIiwiaW5kZXgiLCJsYWJlbCIsInQiLCJmaWVsZE92ZXJyaWRlcyIsInJvbGUiLCJ0eXBlIiwib3B0aW9ucyIsImRlZmF1bHRWYWx1ZSIsInVzZXJSb2xlIiwiZGVzY3JpcHRpb24iLCJlbWFpbCIsImVtYWlsVmVyaWZpZWQiLCJuYW1lIiwiaW1hZ2UiLCJ0d29GYWN0b3JFbmFibGVkIiwiY29tcG9uZW50cyIsIkZpZWxkIiwicGF0aCIsImRpc3BsYXlVc2VybmFtZSIsImlzQW5vbnltb3VzIiwicGhvbmVOdW1iZXIiLCJwaG9uZU51bWJlclZlcmlmaWVkIiwiYmFubmVkIiwiYmFuUmVhc29uIiwiYmFuRXhwaXJlcyIsIm5vcm1hbGl6ZWRFbWFpbCIsInJlYWRPbmx5Iiwic3RyaXBlQ3VzdG9tZXJJZCIsImNvbGxlY3Rpb25GaWVsZHMiLCJzY2hlbWEiLCJmaWVsZFJ1bGVzIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJ1c2Vyc0NvbGxlY3Rpb24iLCJkZWZhdWx0Q29sdW1ucyIsInVzZUFzVGl0bGUiLCJncm91cCIsImNvbGxlY3Rpb25BZG1pbkdyb3VwIiwiRGVzY3JpcHRpb24iLCJjbGllbnRQcm9wcyIsInJvbGVzIiwidmlld3MiLCJlZGl0IiwiYWRtaW5CdXR0b25zIiwidGFiIiwiQ29tcG9uZW50IiwiYmFzZVVSTCIsImJhc2VQYXRoIiwiYWNjZXNzIiwicmVxIiwiaW5jbHVkZXMiLCJyZWFkIiwiaWRGaWVsZCIsImNyZWF0ZSIsImRlbGV0ZSIsInVwZGF0ZSIsImN1c3RvbSIsImJldHRlckF1dGhNb2RlbEtleSIsImVuZHBvaW50cyIsImhvb2tzIiwiYmVmb3JlQ2hhbmdlIiwiZGlzYWJsZURlZmF1bHRQYXlsb2FkQXV0aCIsImFmdGVyQ2hhbmdlIiwiYmVmb3JlTG9naW4iLCJhZnRlckxvZ2luIiwiYWZ0ZXJMb2dvdXQiLCJiZWZvcmVEZWxldGUiLCJhdXRoIiwiZGlzYWJsZUxvY2FsU3RyYXRlZ3kiLCJ1bmRlZmluZWQiLCJsb2dpbldpdGhVc2VybmFtZSIsImFsbG93RW1haWxMb2dpbiIsInJlcXVpcmVFbWFpbCIsInJlcXVpcmVVc2VybmFtZSIsInN0cmF0ZWdpZXMiLCJmaWVsZHMiLCJzZXJ2ZXJQcm9wcyIsImNvbGxlY3Rpb25PdmVycmlkZXMiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLGlCQUFpQixRQUFRLHVDQUFrRDtBQUVwRixTQUFTQyxnQkFBZ0IsRUFBRUMsVUFBVSxFQUFFQyxRQUFRLEVBQUVDLG9CQUFvQixRQUFRLHFCQUFvQjtBQUNqRyxTQUFTQyxpQkFBaUIsUUFBUSxpQ0FBZ0M7QUFDbEUsU0FBU0MscUJBQXFCLEVBQUVDLHVCQUF1QixFQUFFQyxrQkFBa0IsUUFBUSw2QkFBNEI7QUFDL0csU0FBU0MsMkNBQTJDLEVBQUVDLDZCQUE2QixFQUFFQyxnQkFBZ0IsUUFBUSwwQkFBeUI7QUFDdEksU0FBU0MsbUJBQW1CLFFBQVEsOENBQTZDO0FBQ2pGLFNBQVNDLGtCQUFrQixRQUFRLHlCQUF3QjtBQUMzRCxTQUFTQyw0QkFBNEIsRUFBRUMsdUJBQXVCLEVBQUVDLHdCQUF3QixFQUFFQyx1QkFBdUIsUUFBUSxjQUFhO0FBQ3RJLFNBQ0VDLGtCQUFrQixFQUNsQkMsaUJBQWlCLEVBQ2pC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