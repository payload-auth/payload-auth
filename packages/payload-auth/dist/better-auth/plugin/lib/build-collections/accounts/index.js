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
                    label: ({ t })=>t('general:updatedAt')
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL2FjY291bnRzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhTW9kZWxLZXksIGRlZmF1bHRzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgYXNzZXJ0QWxsU2NoZW1hRmllbGRzLCBnZXRTY2hlbWFGaWVsZE5hbWUgfSBmcm9tICcuLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcbmltcG9ydCB7IGlzQWRtaW5PckN1cnJlbnRVc2VyV2l0aFJvbGVzLCBpc0FkbWluV2l0aFJvbGVzIH0gZnJvbSAnLi4vdXRpbHMvcGF5bG9hZC1hY2Nlc3MnXG5pbXBvcnQgeyBnZXRDb2xsZWN0aW9uRmllbGRzIH0gZnJvbSAnLi4vdXRpbHMvdHJhbnNmb3JtLXNjaGVtYS1maWVsZHMtdG8tcGF5bG9hZCdcbmltcG9ydCB7IGdldFN5bmNQYXNzd29yZFRvVXNlckhvb2sgfSBmcm9tICcuL2hvb2tzL3N5bmMtcGFzc3dvcmQtdG8tdXNlcidcblxuaW1wb3J0IHR5cGUgeyBBY2NvdW50IH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9nZW5lcmF0ZWQtdHlwZXMnXG5pbXBvcnQgdHlwZSB7IEJ1aWxkQ29sbGVjdGlvblByb3BzLCBGaWVsZE92ZXJyaWRlcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB7IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIH0gZnJvbSAnLi4vdXRpbHMvY29sbGVjdGlvbi1zY2hlbWEnXG5pbXBvcnQgdHlwZSB7IEZpZWxkUnVsZSB9IGZyb20gJy4uL3V0aWxzL21vZGVsLWZpZWxkLXRyYW5zZm9ybWF0aW9ucydcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQWNjb3VudHNDb2xsZWN0aW9uKHsgaW5jb21pbmdDb2xsZWN0aW9ucywgcGx1Z2luT3B0aW9ucywgcmVzb2x2ZWRTY2hlbWFzIH06IEJ1aWxkQ29sbGVjdGlvblByb3BzKTogQ29sbGVjdGlvbkNvbmZpZyB7XG4gIGNvbnN0IGFjY291bnRTbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LmFjY291bnQpXG4gIGNvbnN0IGFjY291bnRTY2hlbWEgPSByZXNvbHZlZFNjaGVtYXNbYmFNb2RlbEtleS5hY2NvdW50XVxuICBjb25zdCBhZG1pblJvbGVzID0gcGx1Z2luT3B0aW9ucy51c2Vycz8uYWRtaW5Sb2xlcyA/PyBbZGVmYXVsdHMuYWRtaW5Sb2xlXVxuXG4gIGNvbnN0IGV4aXN0aW5nQWNjb3VudENvbGxlY3Rpb24gPSBpbmNvbWluZ0NvbGxlY3Rpb25zLmZpbmQoKGNvbGxlY3Rpb24pID0+IGNvbGxlY3Rpb24uc2x1ZyA9PT0gYWNjb3VudFNsdWcpIGFzXG4gICAgfCBDb2xsZWN0aW9uQ29uZmlnXG4gICAgfCB1bmRlZmluZWRcblxuICBjb25zdCBhY2NvdW50RmllbGRSdWxlczogRmllbGRSdWxlW10gPSBbXG4gICAge1xuICAgICAgY29uZGl0aW9uOiAoZmllbGQpID0+IGZpZWxkLnR5cGUgPT09ICdkYXRlJyxcbiAgICAgIHRyYW5zZm9ybTogKGZpZWxkKSA9PiAoe1xuICAgICAgICAuLi5maWVsZCxcbiAgICAgICAgc2F2ZVRvSldUOiBmYWxzZSxcbiAgICAgICAgYWRtaW46IHtcbiAgICAgICAgICBkaXNhYmxlQnVsa0VkaXQ6IHRydWUsXG4gICAgICAgICAgaGlkZGVuOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgICBsYWJlbDogKHsgdCB9OiBhbnkpID0+IHQoJ2dlbmVyYWw6dXBkYXRlZEF0JylcbiAgICAgIH0pXG4gICAgfVxuICBdXG5cbiAgY29uc3QgZmllbGRPdmVycmlkZXM6IEZpZWxkT3ZlcnJpZGVzPGtleW9mIEFjY291bnQ+ID0ge1xuICAgIHVzZXJJZDogKCkgPT4gKHtcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHtcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHVzZXIgdGhhdCB0aGUgYWNjb3VudCBiZWxvbmdzIHRvJ1xuICAgICAgfVxuICAgIH0pLFxuICAgIGFjY291bnRJZDogKCkgPT4gKHtcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHtcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGlkIG9mIHRoZSBhY2NvdW50IGFzIHByb3ZpZGVkIGJ5IHRoZSBTU08gb3IgZXF1YWwgdG8gdXNlcklkIGZvciBjcmVkZW50aWFsIGFjY291bnRzJ1xuICAgICAgfVxuICAgIH0pLFxuICAgIHByb3ZpZGVySWQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjoge1xuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgaWQgb2YgdGhlIHByb3ZpZGVyIGFzIHByb3ZpZGVkIGJ5IHRoZSBTU08nXG4gICAgICB9XG4gICAgfSksXG4gICAgYWNjZXNzVG9rZW46ICgpID0+ICh7XG4gICAgICBhZG1pbjoge1xuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgYWNjZXNzIHRva2VuIG9mIHRoZSBhY2NvdW50LiBSZXR1cm5lZCBieSB0aGUgcHJvdmlkZXInXG4gICAgICB9XG4gICAgfSksXG4gICAgcmVmcmVzaFRva2VuOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHtcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHJlZnJlc2ggdG9rZW4gb2YgdGhlIGFjY291bnQuIFJldHVybmVkIGJ5IHRoZSBwcm92aWRlcidcbiAgICAgIH1cbiAgICB9KSxcbiAgICBhY2Nlc3NUb2tlbkV4cGlyZXNBdDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBkYXRlIGFuZCB0aW1lIHdoZW4gdGhlIGFjY2VzcyB0b2tlbiB3aWxsIGV4cGlyZSdcbiAgICAgIH1cbiAgICB9KSxcbiAgICByZWZyZXNoVG9rZW5FeHBpcmVzQXQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjoge1xuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgZGF0ZSBhbmQgdGltZSB3aGVuIHRoZSByZWZyZXNoIHRva2VuIHdpbGwgZXhwaXJlJ1xuICAgICAgfVxuICAgIH0pLFxuICAgIHNjb3BlOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHtcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHNjb3BlIG9mIHRoZSBhY2NvdW50LiBSZXR1cm5lZCBieSB0aGUgcHJvdmlkZXInXG4gICAgICB9XG4gICAgfSksXG4gICAgaWRUb2tlbjogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBpZCB0b2tlbiBmb3IgdGhlIGFjY291bnQuIFJldHVybmVkIGJ5IHRoZSBwcm92aWRlcidcbiAgICAgIH1cbiAgICB9KSxcbiAgICBwYXNzd29yZDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICBoaWRkZW46IHRydWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGhhc2hlZCBwYXNzd29yZCBvZiB0aGUgYWNjb3VudC4gTWFpbmx5IHVzZWQgZm9yIGVtYWlsIGFuZCBwYXNzd29yZCBhdXRoZW50aWNhdGlvbidcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgY29sbGVjdGlvbkZpZWxkcyA9IGdldENvbGxlY3Rpb25GaWVsZHMoe1xuICAgIHNjaGVtYTogYWNjb3VudFNjaGVtYSxcbiAgICBmaWVsZFJ1bGVzOiBhY2NvdW50RmllbGRSdWxlcyxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmllbGRPdmVycmlkZXNcbiAgfSlcblxuICBsZXQgYWNjb3VudENvbGxlY3Rpb246IENvbGxlY3Rpb25Db25maWcgPSB7XG4gICAgc2x1ZzogYWNjb3VudFNsdWcsXG4gICAgYWRtaW46IHtcbiAgICAgIHVzZUFzVGl0bGU6ICdhY2NvdW50SWQnLFxuICAgICAgZGVzY3JpcHRpb246ICdBY2NvdW50cyBhcmUgdXNlZCB0byBzdG9yZSB1c2VyIGFjY291bnRzIGZvciBhdXRoZW50aWNhdGlvbiBwcm92aWRlcnMnLFxuICAgICAgZ3JvdXA6IHBsdWdpbk9wdGlvbnM/LmNvbGxlY3Rpb25BZG1pbkdyb3VwID8/ICdBdXRoJyxcbiAgICAgIC4uLmV4aXN0aW5nQWNjb3VudENvbGxlY3Rpb24/LmFkbWluLFxuICAgICAgaGlkZGVuOiBwbHVnaW5PcHRpb25zLmFjY291bnRzPy5oaWRkZW5cbiAgICB9LFxuICAgIGFjY2Vzczoge1xuICAgICAgY3JlYXRlOiBpc0FkbWluV2l0aFJvbGVzKHsgYWRtaW5Sb2xlcyB9KSxcbiAgICAgIGRlbGV0ZTogaXNBZG1pbldpdGhSb2xlcyh7IGFkbWluUm9sZXMgfSksXG4gICAgICByZWFkOiBpc0FkbWluT3JDdXJyZW50VXNlcldpdGhSb2xlcyh7IGFkbWluUm9sZXMsIGlkRmllbGQ6IGdldFNjaGVtYUZpZWxkTmFtZShyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkuYWNjb3VudCwgJ3VzZXJJZCcpIH0pLFxuICAgICAgdXBkYXRlOiBpc0FkbWluV2l0aFJvbGVzKHsgYWRtaW5Sb2xlcyB9KSxcbiAgICAgIC4uLihleGlzdGluZ0FjY291bnRDb2xsZWN0aW9uPy5hY2Nlc3MgPz8ge30pXG4gICAgfSxcbiAgICBjdXN0b206IHtcbiAgICAgIC4uLihleGlzdGluZ0FjY291bnRDb2xsZWN0aW9uPy5jdXN0b20gPz8ge30pLFxuICAgICAgYmV0dGVyQXV0aE1vZGVsS2V5OiBiYU1vZGVsS2V5LmFjY291bnRcbiAgICB9LFxuICAgIGhvb2tzOiB7XG4gICAgICBhZnRlckNoYW5nZTogW1xuICAgICAgICAuLi4oZXhpc3RpbmdBY2NvdW50Q29sbGVjdGlvbj8uaG9va3M/LmFmdGVyQ2hhbmdlID8/IFtdKSxcbiAgICAgICAgLi4uKHBsdWdpbk9wdGlvbnMuZGlzYWJsZURlZmF1bHRQYXlsb2FkQXV0aCA/IFtdIDogW2dldFN5bmNQYXNzd29yZFRvVXNlckhvb2socmVzb2x2ZWRTY2hlbWFzKV0pXG4gICAgICBdXG4gICAgfSxcbiAgICBmaWVsZHM6IFsuLi4oZXhpc3RpbmdBY2NvdW50Q29sbGVjdGlvbj8uZmllbGRzID8/IFtdKSwgLi4uKGNvbGxlY3Rpb25GaWVsZHMgPz8gW10pXSxcbiAgICAuLi5leGlzdGluZ0FjY291bnRDb2xsZWN0aW9uXG4gIH1cblxuICBpZiAodHlwZW9mIHBsdWdpbk9wdGlvbnMuYWNjb3VudHM/LmNvbGxlY3Rpb25PdmVycmlkZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBhY2NvdW50Q29sbGVjdGlvbiA9IHBsdWdpbk9wdGlvbnMuYWNjb3VudHMuY29sbGVjdGlvbk92ZXJyaWRlcyh7XG4gICAgICBjb2xsZWN0aW9uOiBhY2NvdW50Q29sbGVjdGlvblxuICAgIH0pXG4gIH1cblxuICBhc3NlcnRBbGxTY2hlbWFGaWVsZHMoYWNjb3VudENvbGxlY3Rpb24sIGFjY291bnRTY2hlbWEpXG5cbiAgcmV0dXJuIGFjY291bnRDb2xsZWN0aW9uXG59XG4iXSwibmFtZXMiOlsiYmFNb2RlbEtleSIsImRlZmF1bHRzIiwiYXNzZXJ0QWxsU2NoZW1hRmllbGRzIiwiZ2V0U2NoZW1hRmllbGROYW1lIiwiaXNBZG1pbk9yQ3VycmVudFVzZXJXaXRoUm9sZXMiLCJpc0FkbWluV2l0aFJvbGVzIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsImdldFN5bmNQYXNzd29yZFRvVXNlckhvb2siLCJnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyIsImJ1aWxkQWNjb3VudHNDb2xsZWN0aW9uIiwiaW5jb21pbmdDb2xsZWN0aW9ucyIsInBsdWdpbk9wdGlvbnMiLCJyZXNvbHZlZFNjaGVtYXMiLCJhY2NvdW50U2x1ZyIsImFjY291bnQiLCJhY2NvdW50U2NoZW1hIiwiYWRtaW5Sb2xlcyIsInVzZXJzIiwiYWRtaW5Sb2xlIiwiZXhpc3RpbmdBY2NvdW50Q29sbGVjdGlvbiIsImZpbmQiLCJjb2xsZWN0aW9uIiwic2x1ZyIsImFjY291bnRGaWVsZFJ1bGVzIiwiY29uZGl0aW9uIiwiZmllbGQiLCJ0eXBlIiwidHJhbnNmb3JtIiwic2F2ZVRvSldUIiwiYWRtaW4iLCJkaXNhYmxlQnVsa0VkaXQiLCJoaWRkZW4iLCJpbmRleCIsImxhYmVsIiwidCIsImZpZWxkT3ZlcnJpZGVzIiwidXNlcklkIiwicmVhZE9ubHkiLCJkZXNjcmlwdGlvbiIsImFjY291bnRJZCIsInByb3ZpZGVySWQiLCJhY2Nlc3NUb2tlbiIsInJlZnJlc2hUb2tlbiIsImFjY2Vzc1Rva2VuRXhwaXJlc0F0IiwicmVmcmVzaFRva2VuRXhwaXJlc0F0Iiwic2NvcGUiLCJpZFRva2VuIiwicGFzc3dvcmQiLCJjb2xsZWN0aW9uRmllbGRzIiwic2NoZW1hIiwiZmllbGRSdWxlcyIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwiYWNjb3VudENvbGxlY3Rpb24iLCJ1c2VBc1RpdGxlIiwiZ3JvdXAiLCJjb2xsZWN0aW9uQWRtaW5Hcm91cCIsImFjY291bnRzIiwiYWNjZXNzIiwiY3JlYXRlIiwiZGVsZXRlIiwicmVhZCIsImlkRmllbGQiLCJ1cGRhdGUiLCJjdXN0b20iLCJiZXR0ZXJBdXRoTW9kZWxLZXkiLCJob29rcyIsImFmdGVyQ2hhbmdlIiwiZGlzYWJsZURlZmF1bHRQYXlsb2FkQXV0aCIsImZpZWxkcyIsImNvbGxlY3Rpb25PdmVycmlkZXMiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFVBQVUs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