import { baModelKey, defaults } from "../../../constants";
import { assertAllSchemaFields, getSchemaFieldName } from "../utils/collection-schema";
import { isAdminOrCurrentUserWithRoles, isAdminWithRoles } from "../utils/payload-access";
import { getCollectionFields } from "../utils/transform-schema-fields-to-payload";
import { getSyncPasswordToUserHook } from "./hooks/sync-password-to-user";
import { getSchemaCollectionSlug } from "../utils/collection-schema";
export function buildAccountsCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const accountSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.account);
    const accountSchema = resolvedSchemas[baModelKey.account];
    const adminRoles = pluginOptions.users?.adminRoles ?? [
        defaults.adminRole
    ];
    const existingAccountCollection = incomingCollections.find((collection)=>collection.slug === accountSlug);
    const accountFieldRules = [
        {
            condition: (field)=>field.type === 'date',
            transform: (field)=>({
                    ...field,
                    saveToJWT: false,
                    admin: {
                        disableBulkEdit: true,
                        hidden: true
                    },
                    index: true,
                    label: 'general:updatedAt'
                })
        }
    ];
    const fieldOverrides = {
        userId: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The user that the account belongs to'
                }
            }),
        accountId: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The id of the account as provided by the SSO or equal to userId for credential accounts'
                }
            }),
        providerId: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The id of the provider as provided by the SSO'
                }
            }),
        accessToken: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The access token of the account. Returned by the provider'
                }
            }),
        refreshToken: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The refresh token of the account. Returned by the provider'
                }
            }),
        accessTokenExpiresAt: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The date and time when the access token will expire'
                }
            }),
        refreshTokenExpiresAt: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The date and time when the refresh token will expire'
                }
            }),
        scope: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The scope of the account. Returned by the provider'
                }
            }),
        idToken: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The id token for the account. Returned by the provider'
                }
            }),
        password: ()=>({
                admin: {
                    readOnly: true,
                    hidden: true,
                    description: 'The hashed password of the account. Mainly used for email and password authentication'
                }
            })
    };
    const collectionFields = getCollectionFields({
        schema: accountSchema,
        fieldRules: accountFieldRules,
        additionalProperties: fieldOverrides
    });
    let accountCollection = {
        slug: accountSlug,
        admin: {
            useAsTitle: 'accountId',
            description: 'Accounts are used to store user accounts for authentication providers',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingAccountCollection?.admin,
            hidden: pluginOptions.accounts?.hidden
        },
        access: {
            create: isAdminWithRoles({
                adminRoles
            }),
            delete: isAdminWithRoles({
                adminRoles
            }),
            read: isAdminOrCurrentUserWithRoles({
                adminRoles,
                idField: getSchemaFieldName(resolvedSchemas, baModelKey.account, 'userId')
            }),
            update: isAdminWithRoles({
                adminRoles
            }),
            ...existingAccountCollection?.access ?? {}
        },
        custom: {
            ...existingAccountCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.account
        },
        hooks: {
            afterChange: [
                ...existingAccountCollection?.hooks?.afterChange ?? [],
                ...pluginOptions.disableDefaultPayloadAuth ? [] : [
                    getSyncPasswordToUserHook(resolvedSchemas)
                ]
            ]
        },
        fields: [
            ...existingAccountCollection?.fields ?? [],
            ...collectionFields ?? []
        ],
        ...existingAccountCollection
    };
    if (typeof pluginOptions.accounts?.collectionOverrides === 'function') {
        accountCollection = pluginOptions.accounts.collectionOverrides({
            collection: accountCollection
        });
    }
    assertAllSchemaFields(accountCollection, accountSchema);
    return accountCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL2FjY291bnRzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhTW9kZWxLZXksIGRlZmF1bHRzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgYXNzZXJ0QWxsU2NoZW1hRmllbGRzLCBnZXRTY2hlbWFGaWVsZE5hbWUgfSBmcm9tICcuLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcbmltcG9ydCB7IGlzQWRtaW5PckN1cnJlbnRVc2VyV2l0aFJvbGVzLCBpc0FkbWluV2l0aFJvbGVzIH0gZnJvbSAnLi4vdXRpbHMvcGF5bG9hZC1hY2Nlc3MnXG5pbXBvcnQgeyBnZXRDb2xsZWN0aW9uRmllbGRzIH0gZnJvbSAnLi4vdXRpbHMvdHJhbnNmb3JtLXNjaGVtYS1maWVsZHMtdG8tcGF5bG9hZCdcbmltcG9ydCB7IGdldFN5bmNQYXNzd29yZFRvVXNlckhvb2sgfSBmcm9tICcuL2hvb2tzL3N5bmMtcGFzc3dvcmQtdG8tdXNlcidcbmltcG9ydCB0eXBlIHsgQWNjb3VudCB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvZ2VuZXJhdGVkLXR5cGVzJ1xuaW1wb3J0IHR5cGUgeyBCdWlsZENvbGxlY3Rpb25Qcm9wcywgRmllbGRPdmVycmlkZXMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi90eXBlcydcbmltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyB9IGZyb20gJy4uL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuaW1wb3J0IHR5cGUgeyBGaWVsZFJ1bGUgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi90eXBlcydcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQWNjb3VudHNDb2xsZWN0aW9uKHsgaW5jb21pbmdDb2xsZWN0aW9ucywgcGx1Z2luT3B0aW9ucywgcmVzb2x2ZWRTY2hlbWFzIH06IEJ1aWxkQ29sbGVjdGlvblByb3BzKTogQ29sbGVjdGlvbkNvbmZpZyB7XG4gIGNvbnN0IGFjY291bnRTbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LmFjY291bnQpXG4gIGNvbnN0IGFjY291bnRTY2hlbWEgPSByZXNvbHZlZFNjaGVtYXNbYmFNb2RlbEtleS5hY2NvdW50XVxuICBjb25zdCBhZG1pblJvbGVzID0gcGx1Z2luT3B0aW9ucy51c2Vycz8uYWRtaW5Sb2xlcyA/PyBbZGVmYXVsdHMuYWRtaW5Sb2xlXVxuXG4gIGNvbnN0IGV4aXN0aW5nQWNjb3VudENvbGxlY3Rpb24gPSBpbmNvbWluZ0NvbGxlY3Rpb25zLmZpbmQoKGNvbGxlY3Rpb24pID0+IGNvbGxlY3Rpb24uc2x1ZyA9PT0gYWNjb3VudFNsdWcpIGFzXG4gICAgfCBDb2xsZWN0aW9uQ29uZmlnXG4gICAgfCB1bmRlZmluZWRcblxuICBjb25zdCBhY2NvdW50RmllbGRSdWxlczogRmllbGRSdWxlW10gPSBbXG4gICAge1xuICAgICAgY29uZGl0aW9uOiAoZmllbGQpID0+IGZpZWxkLnR5cGUgPT09ICdkYXRlJyxcbiAgICAgIHRyYW5zZm9ybTogKGZpZWxkKSA9PiAoe1xuICAgICAgICAuLi5maWVsZCxcbiAgICAgICAgc2F2ZVRvSldUOiBmYWxzZSxcbiAgICAgICAgYWRtaW46IHtcbiAgICAgICAgICBkaXNhYmxlQnVsa0VkaXQ6IHRydWUsXG4gICAgICAgICAgaGlkZGVuOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgICBsYWJlbDogJ2dlbmVyYWw6dXBkYXRlZEF0J1xuICAgICAgfSlcbiAgICB9XG4gIF1cblxuICBjb25zdCBmaWVsZE92ZXJyaWRlczogRmllbGRPdmVycmlkZXM8a2V5b2YgQWNjb3VudD4gPSB7XG4gICAgdXNlcklkOiAoKSA9PiAoe1xuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBhZG1pbjoge1xuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgdXNlciB0aGF0IHRoZSBhY2NvdW50IGJlbG9uZ3MgdG8nXG4gICAgICB9XG4gICAgfSksXG4gICAgYWNjb3VudElkOiAoKSA9PiAoe1xuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBhZG1pbjoge1xuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgaWQgb2YgdGhlIGFjY291bnQgYXMgcHJvdmlkZWQgYnkgdGhlIFNTTyBvciBlcXVhbCB0byB1c2VySWQgZm9yIGNyZWRlbnRpYWwgYWNjb3VudHMnXG4gICAgICB9XG4gICAgfSksXG4gICAgcHJvdmlkZXJJZDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBpZCBvZiB0aGUgcHJvdmlkZXIgYXMgcHJvdmlkZWQgYnkgdGhlIFNTTydcbiAgICAgIH1cbiAgICB9KSxcbiAgICBhY2Nlc3NUb2tlbjogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBhY2Nlc3MgdG9rZW4gb2YgdGhlIGFjY291bnQuIFJldHVybmVkIGJ5IHRoZSBwcm92aWRlcidcbiAgICAgIH1cbiAgICB9KSxcbiAgICByZWZyZXNoVG9rZW46ICgpID0+ICh7XG4gICAgICBhZG1pbjoge1xuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgcmVmcmVzaCB0b2tlbiBvZiB0aGUgYWNjb3VudC4gUmV0dXJuZWQgYnkgdGhlIHByb3ZpZGVyJ1xuICAgICAgfVxuICAgIH0pLFxuICAgIGFjY2Vzc1Rva2VuRXhwaXJlc0F0OiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHtcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGRhdGUgYW5kIHRpbWUgd2hlbiB0aGUgYWNjZXNzIHRva2VuIHdpbGwgZXhwaXJlJ1xuICAgICAgfVxuICAgIH0pLFxuICAgIHJlZnJlc2hUb2tlbkV4cGlyZXNBdDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBkYXRlIGFuZCB0aW1lIHdoZW4gdGhlIHJlZnJlc2ggdG9rZW4gd2lsbCBleHBpcmUnXG4gICAgICB9XG4gICAgfSksXG4gICAgc2NvcGU6ICgpID0+ICh7XG4gICAgICBhZG1pbjoge1xuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgc2NvcGUgb2YgdGhlIGFjY291bnQuIFJldHVybmVkIGJ5IHRoZSBwcm92aWRlcidcbiAgICAgIH1cbiAgICB9KSxcbiAgICBpZFRva2VuOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHtcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGlkIHRva2VuIGZvciB0aGUgYWNjb3VudC4gUmV0dXJuZWQgYnkgdGhlIHByb3ZpZGVyJ1xuICAgICAgfVxuICAgIH0pLFxuICAgIHBhc3N3b3JkOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHtcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIGhpZGRlbjogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgaGFzaGVkIHBhc3N3b3JkIG9mIHRoZSBhY2NvdW50LiBNYWlubHkgdXNlZCBmb3IgZW1haWwgYW5kIHBhc3N3b3JkIGF1dGhlbnRpY2F0aW9uJ1xuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBjb2xsZWN0aW9uRmllbGRzID0gZ2V0Q29sbGVjdGlvbkZpZWxkcyh7XG4gICAgc2NoZW1hOiBhY2NvdW50U2NoZW1hLFxuICAgIGZpZWxkUnVsZXM6IGFjY291bnRGaWVsZFJ1bGVzLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmaWVsZE92ZXJyaWRlc1xuICB9KVxuXG4gIGxldCBhY2NvdW50Q29sbGVjdGlvbjogQ29sbGVjdGlvbkNvbmZpZyA9IHtcbiAgICBzbHVnOiBhY2NvdW50U2x1ZyxcbiAgICBhZG1pbjoge1xuICAgICAgdXNlQXNUaXRsZTogJ2FjY291bnRJZCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FjY291bnRzIGFyZSB1c2VkIHRvIHN0b3JlIHVzZXIgYWNjb3VudHMgZm9yIGF1dGhlbnRpY2F0aW9uIHByb3ZpZGVycycsXG4gICAgICBncm91cDogcGx1Z2luT3B0aW9ucz8uY29sbGVjdGlvbkFkbWluR3JvdXAgPz8gJ0F1dGgnLFxuICAgICAgLi4uZXhpc3RpbmdBY2NvdW50Q29sbGVjdGlvbj8uYWRtaW4sXG4gICAgICBoaWRkZW46IHBsdWdpbk9wdGlvbnMuYWNjb3VudHM/LmhpZGRlblxuICAgIH0sXG4gICAgYWNjZXNzOiB7XG4gICAgICBjcmVhdGU6IGlzQWRtaW5XaXRoUm9sZXMoeyBhZG1pblJvbGVzIH0pLFxuICAgICAgZGVsZXRlOiBpc0FkbWluV2l0aFJvbGVzKHsgYWRtaW5Sb2xlcyB9KSxcbiAgICAgIHJlYWQ6IGlzQWRtaW5PckN1cnJlbnRVc2VyV2l0aFJvbGVzKHsgYWRtaW5Sb2xlcywgaWRGaWVsZDogZ2V0U2NoZW1hRmllbGROYW1lKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS5hY2NvdW50LCAndXNlcklkJykgfSksXG4gICAgICB1cGRhdGU6IGlzQWRtaW5XaXRoUm9sZXMoeyBhZG1pblJvbGVzIH0pLFxuICAgICAgLi4uKGV4aXN0aW5nQWNjb3VudENvbGxlY3Rpb24/LmFjY2VzcyA/PyB7fSlcbiAgICB9LFxuICAgIGN1c3RvbToge1xuICAgICAgLi4uKGV4aXN0aW5nQWNjb3VudENvbGxlY3Rpb24/LmN1c3RvbSA/PyB7fSksXG4gICAgICBiZXR0ZXJBdXRoTW9kZWxLZXk6IGJhTW9kZWxLZXkuYWNjb3VudFxuICAgIH0sXG4gICAgaG9va3M6IHtcbiAgICAgIGFmdGVyQ2hhbmdlOiBbXG4gICAgICAgIC4uLihleGlzdGluZ0FjY291bnRDb2xsZWN0aW9uPy5ob29rcz8uYWZ0ZXJDaGFuZ2UgPz8gW10pLFxuICAgICAgICAuLi4ocGx1Z2luT3B0aW9ucy5kaXNhYmxlRGVmYXVsdFBheWxvYWRBdXRoID8gW10gOiBbZ2V0U3luY1Bhc3N3b3JkVG9Vc2VySG9vayhyZXNvbHZlZFNjaGVtYXMpXSlcbiAgICAgIF1cbiAgICB9LFxuICAgIGZpZWxkczogWy4uLihleGlzdGluZ0FjY291bnRDb2xsZWN0aW9uPy5maWVsZHMgPz8gW10pLCAuLi4oY29sbGVjdGlvbkZpZWxkcyA/PyBbXSldLFxuICAgIC4uLmV4aXN0aW5nQWNjb3VudENvbGxlY3Rpb25cbiAgfVxuXG4gIGlmICh0eXBlb2YgcGx1Z2luT3B0aW9ucy5hY2NvdW50cz8uY29sbGVjdGlvbk92ZXJyaWRlcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGFjY291bnRDb2xsZWN0aW9uID0gcGx1Z2luT3B0aW9ucy5hY2NvdW50cy5jb2xsZWN0aW9uT3ZlcnJpZGVzKHtcbiAgICAgIGNvbGxlY3Rpb246IGFjY291bnRDb2xsZWN0aW9uXG4gICAgfSlcbiAgfVxuXG4gIGFzc2VydEFsbFNjaGVtYUZpZWxkcyhhY2NvdW50Q29sbGVjdGlvbiwgYWNjb3VudFNjaGVtYSlcblxuICByZXR1cm4gYWNjb3VudENvbGxlY3Rpb25cbn1cbiJdLCJuYW1lcyI6WyJiYU1vZGVsS2V5IiwiZGVmYXVsdHMiLCJhc3NlcnRBbGxTY2hlbWFGaWVsZHMiLCJnZXRTY2hlbWFGaWVsZE5hbWUiLCJpc0FkbWluT3JDdXJyZW50VXNlcldpdGhSb2xlcyIsImlzQWRtaW5XaXRoUm9sZXMiLCJnZXRDb2xsZWN0aW9uRmllbGRzIiwiZ2V0U3luY1Bhc3N3b3JkVG9Vc2VySG9vayIsImdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIiwiYnVpbGRBY2NvdW50c0NvbGxlY3Rpb24iLCJpbmNvbWluZ0NvbGxlY3Rpb25zIiwicGx1Z2luT3B0aW9ucyIsInJlc29sdmVkU2NoZW1hcyIsImFjY291bnRTbHVnIiwiYWNjb3VudCIsImFjY291bnRTY2hlbWEiLCJhZG1pblJvbGVzIiwidXNlcnMiLCJhZG1pblJvbGUiLCJleGlzdGluZ0FjY291bnRDb2xsZWN0aW9uIiwiZmluZCIsImNvbGxlY3Rpb24iLCJzbHVnIiwiYWNjb3VudEZpZWxkUnVsZXMiLCJjb25kaXRpb24iLCJmaWVsZCIsInR5cGUiLCJ0cmFuc2Zvcm0iLCJzYXZlVG9KV1QiLCJhZG1pbiIsImRpc2FibGVCdWxrRWRpdCIsImhpZGRlbiIsImluZGV4IiwibGFiZWwiLCJmaWVsZE92ZXJyaWRlcyIsInVzZXJJZCIsInJlYWRPbmx5IiwiZGVzY3JpcHRpb24iLCJhY2NvdW50SWQiLCJwcm92aWRlcklkIiwiYWNjZXNzVG9rZW4iLCJyZWZyZXNoVG9rZW4iLCJhY2Nlc3NUb2tlbkV4cGlyZXNBdCIsInJlZnJlc2hUb2tlbkV4cGlyZXNBdCIsInNjb3BlIiwiaWRUb2tlbiIsInBhc3N3b3JkIiwiY29sbGVjdGlvbkZpZWxkcyIsInNjaGVtYSIsImZpZWxkUnVsZXMiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsImFjY291bnRDb2xsZWN0aW9uIiwidXNlQXNUaXRsZSIsImdyb3VwIiwiY29sbGVjdGlvbkFkbWluR3JvdXAiLCJhY2NvdW50cyIsImFjY2VzcyIsImNyZWF0ZSIsImRlbGV0ZSIsInJlYWQiLCJpZEZpZWxkIiwidXBkYXRlIiwiY3VzdG9tIiwiYmV0dGVyQXV0aE1vZGVsS2V5IiwiaG9va3MiLCJhZnRlckNoYW5nZSIsImRpc2FibGVEZWZhdWx0UGF5bG9hZEF1dGgiLCJmaWVsZHMiLCJjb2xsZWN0aW9uT3ZlcnJpZGVzIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxVQUFVLEVBQUVDLFFBQVEsUUFBUSxxQkFBZ0M7QUFDckUsU0FBU0Ms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