import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { assertAllSchemaFields, getSchemaCollectionSlug } from "./utils/collection-schema";
export function buildApiKeysCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const apiKeySlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.apikey);
    const apiKeySchema = resolvedSchemas[baModelKey.apikey];
    const existingApiKeyCollection = incomingCollections.find((collection)=>collection.slug === apiKeySlug);
    const fieldOverrides = {
        name: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The name of the API key.'
                }
            }),
        start: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The starting characters of the API key.'
                }
            }),
        prefix: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The API Key prefix. Stored as plain text.'
                }
            }),
        key: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The hashed API key itself.'
                }
            }),
        userId: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The user associated with the API key.'
                }
            }),
        refillInterval: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The interval to refill the key in milliseconds.'
                }
            }),
        refillAmount: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The amount to refill the remaining count of the key.'
                }
            }),
        lastRefillAt: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The date and time when the key was last refilled.'
                }
            }),
        enabled: ()=>({
                defaultValue: true,
                admin: {
                    readOnly: true,
                    description: 'Whether the API key is enabled.'
                }
            }),
        rateLimitEnabled: ()=>({
                defaultValue: true,
                admin: {
                    readOnly: true,
                    description: 'Whether the API key has rate limiting enabled.'
                }
            }),
        rateLimitTimeWindow: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The time window in milliseconds for the rate limit.'
                }
            }),
        rateLimitMax: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The maximum number of requests allowed within the rate limit time window.'
                }
            }),
        requestCount: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The number of requests made within the rate limit time window.'
                }
            }),
        remaining: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The number of requests remaining.'
                }
            }),
        lastRequest: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The date and time of the last request made to the key.'
                }
            }),
        expiresAt: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The date and time of when the API key will expire.'
                }
            }),
        permissions: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The permissions for the API key.'
                }
            }),
        metadata: ()=>({
                type: 'json',
                admin: {
                    readOnly: true,
                    description: 'Any additional metadata you want to store with the key.'
                }
            })
    };
    const apiKeyFieldRules = [
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
    const collectionFields = getCollectionFields({
        schema: apiKeySchema,
        fieldRules: apiKeyFieldRules,
        additionalProperties: fieldOverrides
    });
    let apiKeyCollection = {
        ...existingApiKeyCollection,
        slug: apiKeySlug,
        admin: {
            hidden: pluginOptions.hidePluginCollections ?? false,
            useAsTitle: apiKeySchema?.fields?.name?.fieldName,
            description: 'API keys are used to authenticate requests to the API.',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingApiKeyCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingApiKeyCollection?.access ?? {}
        },
        custom: {
            ...existingApiKeyCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.apikey
        },
        fields: [
            ...existingApiKeyCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.pluginCollectionOverrides?.apiKeys === 'function') {
        apiKeyCollection = pluginOptions.pluginCollectionOverrides.apiKeys({
            collection: apiKeyCollection
        });
    }
    assertAllSchemaFields(apiKeyCollection, apiKeySchema);
    return apiKeyCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL2FwaS1rZXlzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhTW9kZWxLZXkgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnXG5pbXBvcnQgeyBnZXRBZG1pbkFjY2VzcyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvZ2V0LWFkbWluLWFjY2VzcydcbmltcG9ydCB7IGdldENvbGxlY3Rpb25GaWVsZHMgfSBmcm9tICcuL3V0aWxzL3RyYW5zZm9ybS1zY2hlbWEtZmllbGRzLXRvLXBheWxvYWQnXG5pbXBvcnQgeyBhc3NlcnRBbGxTY2hlbWFGaWVsZHMsIGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIH0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcbmltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgdHlwZSB7IEFwaWtleSB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvZ2VuZXJhdGVkLXR5cGVzJ1xuaW1wb3J0IHR5cGUgeyBCdWlsZENvbGxlY3Rpb25Qcm9wcywgRmllbGRPdmVycmlkZXMsIEZpZWxkUnVsZSB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRBcGlLZXlzQ29sbGVjdGlvbih7IGluY29taW5nQ29sbGVjdGlvbnMsIHBsdWdpbk9wdGlvbnMsIHJlc29sdmVkU2NoZW1hcyB9OiBCdWlsZENvbGxlY3Rpb25Qcm9wcyk6IENvbGxlY3Rpb25Db25maWcge1xuICBjb25zdCBhcGlLZXlTbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LmFwaWtleSlcbiAgY29uc3QgYXBpS2V5U2NoZW1hID0gcmVzb2x2ZWRTY2hlbWFzW2JhTW9kZWxLZXkuYXBpa2V5XVxuXG4gIGNvbnN0IGV4aXN0aW5nQXBpS2V5Q29sbGVjdGlvbiA9IGluY29taW5nQ29sbGVjdGlvbnMuZmluZCgoY29sbGVjdGlvbikgPT4gY29sbGVjdGlvbi5zbHVnID09PSBhcGlLZXlTbHVnKSBhcyBDb2xsZWN0aW9uQ29uZmlnIHwgdW5kZWZpbmVkXG5cbiAgY29uc3QgZmllbGRPdmVycmlkZXM6IEZpZWxkT3ZlcnJpZGVzPGtleW9mIEFwaWtleT4gPSB7XG4gICAgbmFtZTogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBuYW1lIG9mIHRoZSBBUEkga2V5LicgfVxuICAgIH0pLFxuICAgIHN0YXJ0OiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIHN0YXJ0aW5nIGNoYXJhY3RlcnMgb2YgdGhlIEFQSSBrZXkuJyB9XG4gICAgfSksXG4gICAgcHJlZml4OiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIEFQSSBLZXkgcHJlZml4LiBTdG9yZWQgYXMgcGxhaW4gdGV4dC4nIH1cbiAgICB9KSxcbiAgICBrZXk6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgaGFzaGVkIEFQSSBrZXkgaXRzZWxmLicgfVxuICAgIH0pLFxuICAgIHVzZXJJZDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSB1c2VyIGFzc29jaWF0ZWQgd2l0aCB0aGUgQVBJIGtleS4nIH1cbiAgICB9KSxcbiAgICByZWZpbGxJbnRlcnZhbDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBpbnRlcnZhbCB0byByZWZpbGwgdGhlIGtleSBpbiBtaWxsaXNlY29uZHMuJyB9XG4gICAgfSksXG4gICAgcmVmaWxsQW1vdW50OiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIGFtb3VudCB0byByZWZpbGwgdGhlIHJlbWFpbmluZyBjb3VudCBvZiB0aGUga2V5LicgfVxuICAgIH0pLFxuICAgIGxhc3RSZWZpbGxBdDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBkYXRlIGFuZCB0aW1lIHdoZW4gdGhlIGtleSB3YXMgbGFzdCByZWZpbGxlZC4nIH1cbiAgICB9KSxcbiAgICBlbmFibGVkOiAoKSA9PiAoe1xuICAgICAgZGVmYXVsdFZhbHVlOiB0cnVlLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgQVBJIGtleSBpcyBlbmFibGVkLicgfVxuICAgIH0pLFxuICAgIHJhdGVMaW1pdEVuYWJsZWQ6ICgpID0+ICh7XG4gICAgICBkZWZhdWx0VmFsdWU6IHRydWUsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdXaGV0aGVyIHRoZSBBUEkga2V5IGhhcyByYXRlIGxpbWl0aW5nIGVuYWJsZWQuJyB9XG4gICAgfSksXG4gICAgcmF0ZUxpbWl0VGltZVdpbmRvdzogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSB0aW1lIHdpbmRvdyBpbiBtaWxsaXNlY29uZHMgZm9yIHRoZSByYXRlIGxpbWl0LicgfVxuICAgIH0pLFxuICAgIHJhdGVMaW1pdE1heDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBtYXhpbXVtIG51bWJlciBvZiByZXF1ZXN0cyBhbGxvd2VkIHdpdGhpbiB0aGUgcmF0ZSBsaW1pdCB0aW1lIHdpbmRvdy4nIH1cbiAgICB9KSxcbiAgICByZXF1ZXN0Q291bnQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgbnVtYmVyIG9mIHJlcXVlc3RzIG1hZGUgd2l0aGluIHRoZSByYXRlIGxpbWl0IHRpbWUgd2luZG93LicgfVxuICAgIH0pLFxuICAgIHJlbWFpbmluZzogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBudW1iZXIgb2YgcmVxdWVzdHMgcmVtYWluaW5nLicgfVxuICAgIH0pLFxuICAgIGxhc3RSZXF1ZXN0OiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIGRhdGUgYW5kIHRpbWUgb2YgdGhlIGxhc3QgcmVxdWVzdCBtYWRlIHRvIHRoZSBrZXkuJyB9XG4gICAgfSksXG4gICAgZXhwaXJlc0F0OiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIGRhdGUgYW5kIHRpbWUgb2Ygd2hlbiB0aGUgQVBJIGtleSB3aWxsIGV4cGlyZS4nIH1cbiAgICB9KSxcbiAgICBwZXJtaXNzaW9uczogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBwZXJtaXNzaW9ucyBmb3IgdGhlIEFQSSBrZXkuJyB9XG4gICAgfSksXG4gICAgbWV0YWRhdGE6ICgpID0+ICh7XG4gICAgICB0eXBlOiAnanNvbicsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdBbnkgYWRkaXRpb25hbCBtZXRhZGF0YSB5b3Ugd2FudCB0byBzdG9yZSB3aXRoIHRoZSBrZXkuJyB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGFwaUtleUZpZWxkUnVsZXM6IEZpZWxkUnVsZVtdID0gW1xuICAgIHtcbiAgICAgIGNvbmRpdGlvbjogKGZpZWxkKSA9PiBmaWVsZC50eXBlID09PSAnZGF0ZScsXG4gICAgICB0cmFuc2Zvcm06IChmaWVsZCkgPT4gKHtcbiAgICAgICAgLi4uZmllbGQsXG4gICAgICAgIHNhdmVUb0pXVDogZmFsc2UsXG4gICAgICAgIGFkbWluOiB7XG4gICAgICAgICAgZGlzYWJsZUJ1bGtFZGl0OiB0cnVlLFxuICAgICAgICAgIGhpZGRlbjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBpbmRleDogdHJ1ZSxcbiAgICAgICAgbGFiZWw6ICh7IHQgfTogYW55KSA9PiB0KCdnZW5lcmFsOnVwZGF0ZWRBdCcpXG4gICAgICB9KVxuICAgIH1cbiAgXVxuXG4gIGNvbnN0IGNvbGxlY3Rpb25GaWVsZHMgPSBnZXRDb2xsZWN0aW9uRmllbGRzKHtcbiAgICBzY2hlbWE6IGFwaUtleVNjaGVtYSxcbiAgICBmaWVsZFJ1bGVzOiBhcGlLZXlGaWVsZFJ1bGVzLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmaWVsZE92ZXJyaWRlc1xuICB9KVxuXG4gIGxldCBhcGlLZXlDb2xsZWN0aW9uOiBDb2xsZWN0aW9uQ29uZmlnID0ge1xuICAgIC4uLmV4aXN0aW5nQXBpS2V5Q29sbGVjdGlvbixcbiAgICBzbHVnOiBhcGlLZXlTbHVnLFxuICAgIGFkbWluOiB7XG4gICAgICBoaWRkZW46IHBsdWdpbk9wdGlvbnMuaGlkZVBsdWdpbkNvbGxlY3Rpb25zID8/IGZhbHNlLFxuICAgICAgdXNlQXNUaXRsZTogYXBpS2V5U2NoZW1hPy5maWVsZHM/Lm5hbWU/LmZpZWxkTmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIGtleXMgYXJlIHVzZWQgdG8gYXV0aGVudGljYXRlIHJlcXVlc3RzIHRvIHRoZSBBUEkuJyxcbiAgICAgIGdyb3VwOiBwbHVnaW5PcHRpb25zPy5jb2xsZWN0aW9uQWRtaW5Hcm91cCA/PyAnQXV0aCcsXG4gICAgICAuLi5leGlzdGluZ0FwaUtleUNvbGxlY3Rpb24/LmFkbWluXG4gICAgfSxcbiAgICBhY2Nlc3M6IHtcbiAgICAgIC4uLmdldEFkbWluQWNjZXNzKHBsdWdpbk9wdGlvbnMpLFxuICAgICAgLi4uKGV4aXN0aW5nQXBpS2V5Q29sbGVjdGlvbj8uYWNjZXNzID8/IHt9KVxuICAgIH0sXG4gICAgY3VzdG9tOiB7XG4gICAgICAuLi4oZXhpc3RpbmdBcGlLZXlDb2xsZWN0aW9uPy5jdXN0b20gPz8ge30pLFxuICAgICAgYmV0dGVyQXV0aE1vZGVsS2V5OiBiYU1vZGVsS2V5LmFwaWtleVxuICAgIH0sXG4gICAgZmllbGRzOiBbLi4uKGV4aXN0aW5nQXBpS2V5Q29sbGVjdGlvbj8uZmllbGRzID8/IFtdKSwgLi4uKGNvbGxlY3Rpb25GaWVsZHMgPz8gW10pXVxuICB9XG5cbiAgaWYgKHR5cGVvZiBwbHVnaW5PcHRpb25zLnBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXM/LmFwaUtleXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBhcGlLZXlDb2xsZWN0aW9uID0gcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzLmFwaUtleXMoe1xuICAgICAgY29sbGVjdGlvbjogYXBpS2V5Q29sbGVjdGlvblxuICAgIH0pXG4gIH1cblxuICBhc3NlcnRBbGxTY2hlbWFGaWVsZHMoYXBpS2V5Q29sbGVjdGlvbiwgYXBpS2V5U2NoZW1hKVxuXG4gIHJldHVybiBhcGlLZXlDb2xsZWN0aW9uXG59XG4iXSwibmFtZXMiOlsiYmFNb2RlbEtleSIsImdldEFkbWluQWNjZXNzIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsImFzc2VydEFsbFNjaGVtYUZpZWxkcyIsImdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIiwiYnVpbGRBcGlLZXlzQ29sbGVjdGlvbiIsImluY29taW5nQ29sbGVjdGlvbnMiLCJwbHVnaW5PcHRpb25zIiwicmVzb2x2ZWRTY2hlbWFzIiwiYXBpS2V5U2x1ZyIsImFwaWtleSIsImFwaUtleVNjaGVtYSIsImV4aXN0aW5nQXBpS2V5Q29sbGVjdGlvbiIsImZpbmQiLCJjb2xsZWN0aW9uIiwic2x1ZyIsImZpZWxkT3ZlcnJpZGVzIiwibmFtZSIsImFkbWluIiwicmVhZE9ubHkiLCJkZXNjcmlwdGlvbiIsInN0YXJ0IiwicHJlZml4Iiwia2V5IiwidXNlcklkIiwicmVmaWxsSW50ZXJ2YWwiLCJyZWZpbGxBbW91bnQiLCJsYXN0UmVmaWxsQXQiLCJlbmFibGVkIiwiZGVmYXVsdFZhbHVlIiwicmF0ZUxpbWl0RW5hYmxlZCIsInJhdGVMaW1pdFRpbWVXaW5kb3ciLCJyYXRlTGltaXRNYXgiLCJyZXF1ZXN0Q291bnQiLCJyZW1haW5pbmciLCJsYXN0UmVxdWVzdCIsImV4cGlyZXNBdCIsInBlcm1pc3Npb25zIiwibWV0YWRhdGEiLCJ0eXBlIiwiYXBpS2V5RmllbGRSdWxlcyIsImNvbmRpdGlvbiIsImZpZWxkIiwidHJhbnNmb3JtIiwic2F2ZVRvSldUIiwiZGlzYWJsZUJ1bGtFZGl0IiwiaGlkZGVuIiwiaW5kZXgiLCJsYWJlbCIsInQiLCJjb2xsZWN0aW9uRmllbGRzIiwic2NoZW1hIiwiZmllbGRSdWxlcyIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwiYXBpS2V5Q29sbGVjdGlvbiIsImhpZGVQbHVnaW5Db2xsZWN0aW9ucyIsInVzZUFzVGl0bGUiLCJmaWVsZHMiLCJmaWVsZE5hbWUiLCJncm91cCIsImNvbGxlY3Rpb25BZG1pbkdyb3VwIiwiYWNjZXNzIiwiY3VzdG9tIiwiYmV0dGVyQXV0aE1vZGVsS2V5IiwicGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcyIsImFwaUtleXMiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFVBQVUsUUFBUSxrQkFBaUI7QUFDNUMsU0FBU0MsY0FBYyxRQUFRLGlDQUFnQztBQUMvRCxTQUFTQyxtQkFBbUIsUUFBUSw2Q0FBNEM7QUFDaEYsU0FBU0MscUJBQXFCLEVBQUVDLHVCQUF1QixRQUFRLDRCQUEyQjtBQUsxRixPQUFPLFNBQVNDLHVCQUF1QixFQUFFQyxtQkFBbUIsRUFBRUMsYUFBYSxFQUFFQyxlQUFlLEVBQXdCO0lBQ2xILE1BQU1DLGFBQWFMLHdCQUF3QkksaUJBQWlCUixXQUFXVSxNQUFNO0lBQzdFLE1BQU1D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