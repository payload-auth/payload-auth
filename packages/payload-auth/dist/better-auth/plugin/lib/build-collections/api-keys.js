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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL2FwaS1rZXlzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhTW9kZWxLZXkgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnXG5pbXBvcnQgeyBnZXRBZG1pbkFjY2VzcyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvZ2V0LWFkbWluLWFjY2VzcydcbmltcG9ydCB7IGdldERlZmF1bHRDb2xsZWN0aW9uU2x1ZyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvZ2V0LWNvbGxlY3Rpb24tc2x1ZydcbmltcG9ydCB7IGdldENvbGxlY3Rpb25GaWVsZHMgfSBmcm9tICcuL3V0aWxzL3RyYW5zZm9ybS1zY2hlbWEtZmllbGRzLXRvLXBheWxvYWQnXG5pbXBvcnQgeyBhc3NlcnRBbGxTY2hlbWFGaWVsZHMsIGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIH0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcblxuaW1wb3J0IHsgdHlwZSBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB0eXBlIHsgQXBpa2V5IH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9nZW5lcmF0ZWQtdHlwZXMnXG5pbXBvcnQgdHlwZSB7IEZpZWxkUnVsZSB9IGZyb20gJy4vdXRpbHMvbW9kZWwtZmllbGQtdHJhbnNmb3JtYXRpb25zJ1xuaW1wb3J0IHR5cGUgeyBCdWlsZENvbGxlY3Rpb25Qcm9wcywgRmllbGRPdmVycmlkZXMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi90eXBlcydcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQXBpS2V5c0NvbGxlY3Rpb24oeyBpbmNvbWluZ0NvbGxlY3Rpb25zLCBwbHVnaW5PcHRpb25zLCByZXNvbHZlZFNjaGVtYXMgfTogQnVpbGRDb2xsZWN0aW9uUHJvcHMpOiBDb2xsZWN0aW9uQ29uZmlnIHtcbiAgY29uc3QgYXBpS2V5U2x1ZyA9IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS5hcGlrZXkpXG4gIGNvbnN0IGFwaUtleVNjaGVtYSA9IHJlc29sdmVkU2NoZW1hc1tiYU1vZGVsS2V5LmFwaWtleV1cblxuICBjb25zdCBleGlzdGluZ0FwaUtleUNvbGxlY3Rpb24gPSBpbmNvbWluZ0NvbGxlY3Rpb25zLmZpbmQoKGNvbGxlY3Rpb24pID0+IGNvbGxlY3Rpb24uc2x1ZyA9PT0gYXBpS2V5U2x1ZykgYXMgQ29sbGVjdGlvbkNvbmZpZyB8IHVuZGVmaW5lZFxuXG4gIGNvbnN0IGZpZWxkT3ZlcnJpZGVzOiBGaWVsZE92ZXJyaWRlczxrZXlvZiBBcGlrZXk+ID0ge1xuICAgIG5hbWU6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgbmFtZSBvZiB0aGUgQVBJIGtleS4nIH1cbiAgICB9KSxcbiAgICBzdGFydDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBzdGFydGluZyBjaGFyYWN0ZXJzIG9mIHRoZSBBUEkga2V5LicgfVxuICAgIH0pLFxuICAgIHByZWZpeDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBBUEkgS2V5IHByZWZpeC4gU3RvcmVkIGFzIHBsYWluIHRleHQuJyB9XG4gICAgfSksXG4gICAga2V5OiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIGhhc2hlZCBBUEkga2V5IGl0c2VsZi4nIH1cbiAgICB9KSxcbiAgICB1c2VySWQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgdXNlciBhc3NvY2lhdGVkIHdpdGggdGhlIEFQSSBrZXkuJyB9XG4gICAgfSksXG4gICAgcmVmaWxsSW50ZXJ2YWw6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgaW50ZXJ2YWwgdG8gcmVmaWxsIHRoZSBrZXkgaW4gbWlsbGlzZWNvbmRzLicgfVxuICAgIH0pLFxuICAgIHJlZmlsbEFtb3VudDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBhbW91bnQgdG8gcmVmaWxsIHRoZSByZW1haW5pbmcgY291bnQgb2YgdGhlIGtleS4nIH1cbiAgICB9KSxcbiAgICBsYXN0UmVmaWxsQXQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgZGF0ZSBhbmQgdGltZSB3aGVuIHRoZSBrZXkgd2FzIGxhc3QgcmVmaWxsZWQuJyB9XG4gICAgfSksXG4gICAgZW5hYmxlZDogKCkgPT4gKHtcbiAgICAgIGRlZmF1bHRWYWx1ZTogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdGhlIEFQSSBrZXkgaXMgZW5hYmxlZC4nIH1cbiAgICB9KSxcbiAgICByYXRlTGltaXRFbmFibGVkOiAoKSA9PiAoe1xuICAgICAgZGVmYXVsdFZhbHVlOiB0cnVlLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgQVBJIGtleSBoYXMgcmF0ZSBsaW1pdGluZyBlbmFibGVkLicgfVxuICAgIH0pLFxuICAgIHJhdGVMaW1pdFRpbWVXaW5kb3c6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgdGltZSB3aW5kb3cgaW4gbWlsbGlzZWNvbmRzIGZvciB0aGUgcmF0ZSBsaW1pdC4nIH1cbiAgICB9KSxcbiAgICByYXRlTGltaXRNYXg6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgbWF4aW11bSBudW1iZXIgb2YgcmVxdWVzdHMgYWxsb3dlZCB3aXRoaW4gdGhlIHJhdGUgbGltaXQgdGltZSB3aW5kb3cuJyB9XG4gICAgfSksXG4gICAgcmVxdWVzdENvdW50OiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIG51bWJlciBvZiByZXF1ZXN0cyBtYWRlIHdpdGhpbiB0aGUgcmF0ZSBsaW1pdCB0aW1lIHdpbmRvdy4nIH1cbiAgICB9KSxcbiAgICByZW1haW5pbmc6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgbnVtYmVyIG9mIHJlcXVlc3RzIHJlbWFpbmluZy4nIH1cbiAgICB9KSxcbiAgICBsYXN0UmVxdWVzdDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBkYXRlIGFuZCB0aW1lIG9mIHRoZSBsYXN0IHJlcXVlc3QgbWFkZSB0byB0aGUga2V5LicgfVxuICAgIH0pLFxuICAgIGV4cGlyZXNBdDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBkYXRlIGFuZCB0aW1lIG9mIHdoZW4gdGhlIEFQSSBrZXkgd2lsbCBleHBpcmUuJyB9XG4gICAgfSksXG4gICAgcGVybWlzc2lvbnM6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgcGVybWlzc2lvbnMgZm9yIHRoZSBBUEkga2V5LicgfVxuICAgIH0pLFxuICAgIG1ldGFkYXRhOiAoKSA9PiAoe1xuICAgICAgdHlwZTogJ2pzb24nLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnQW55IGFkZGl0aW9uYWwgbWV0YWRhdGEgeW91IHdhbnQgdG8gc3RvcmUgd2l0aCB0aGUga2V5LicgfVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBhcGlLZXlGaWVsZFJ1bGVzOiBGaWVsZFJ1bGVbXSA9IFtcbiAgICB7XG4gICAgICBjb25kaXRpb246IChmaWVsZCkgPT4gZmllbGQudHlwZSA9PT0gJ2RhdGUnLFxuICAgICAgdHJhbnNmb3JtOiAoZmllbGQpID0+ICh7XG4gICAgICAgIC4uLmZpZWxkLFxuICAgICAgICBzYXZlVG9KV1Q6IGZhbHNlLFxuICAgICAgICBhZG1pbjoge1xuICAgICAgICAgIGRpc2FibGVCdWxrRWRpdDogdHJ1ZSxcbiAgICAgICAgICBoaWRkZW46IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgaW5kZXg6IHRydWUsXG4gICAgICAgIGxhYmVsOiAoeyB0IH06IGFueSkgPT4gdCgnZ2VuZXJhbDp1cGRhdGVkQXQnKVxuICAgICAgfSlcbiAgICB9XG4gIF1cblxuICBjb25zdCBjb2xsZWN0aW9uRmllbGRzID0gZ2V0Q29sbGVjdGlvbkZpZWxkcyh7XG4gICAgc2NoZW1hOiBhcGlLZXlTY2hlbWEsXG4gICAgZmllbGRSdWxlczogYXBpS2V5RmllbGRSdWxlcyxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmllbGRPdmVycmlkZXNcbiAgfSlcblxuICBsZXQgYXBpS2V5Q29sbGVjdGlvbjogQ29sbGVjdGlvbkNvbmZpZyA9IHtcbiAgICAuLi5leGlzdGluZ0FwaUtleUNvbGxlY3Rpb24sXG4gICAgc2x1ZzogYXBpS2V5U2x1ZyxcbiAgICBhZG1pbjoge1xuICAgICAgaGlkZGVuOiBwbHVnaW5PcHRpb25zLmhpZGVQbHVnaW5Db2xsZWN0aW9ucyA/PyBmYWxzZSxcbiAgICAgIHVzZUFzVGl0bGU6IGFwaUtleVNjaGVtYT8uZmllbGRzPy5uYW1lPy5maWVsZE5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBrZXlzIGFyZSB1c2VkIHRvIGF1dGhlbnRpY2F0ZSByZXF1ZXN0cyB0byB0aGUgQVBJLicsXG4gICAgICBncm91cDogcGx1Z2luT3B0aW9ucz8uY29sbGVjdGlvbkFkbWluR3JvdXAgPz8gJ0F1dGgnLFxuICAgICAgLi4uZXhpc3RpbmdBcGlLZXlDb2xsZWN0aW9uPy5hZG1pblxuICAgIH0sXG4gICAgYWNjZXNzOiB7XG4gICAgICAuLi5nZXRBZG1pbkFjY2VzcyhwbHVnaW5PcHRpb25zKSxcbiAgICAgIC4uLihleGlzdGluZ0FwaUtleUNvbGxlY3Rpb24/LmFjY2VzcyA/PyB7fSlcbiAgICB9LFxuICAgIGN1c3RvbToge1xuICAgICAgLi4uKGV4aXN0aW5nQXBpS2V5Q29sbGVjdGlvbj8uY3VzdG9tID8/IHt9KSxcbiAgICAgIGJldHRlckF1dGhNb2RlbEtleTogYmFNb2RlbEtleS5hcGlrZXlcbiAgICB9LFxuICAgIGZpZWxkczogWy4uLihleGlzdGluZ0FwaUtleUNvbGxlY3Rpb24/LmZpZWxkcyA/PyBbXSksIC4uLihjb2xsZWN0aW9uRmllbGRzID8/IFtdKV1cbiAgfVxuXG4gIGlmICh0eXBlb2YgcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzPy5hcGlLZXlzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgYXBpS2V5Q29sbGVjdGlvbiA9IHBsdWdpbk9wdGlvbnMucGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcy5hcGlLZXlzKHtcbiAgICAgIGNvbGxlY3Rpb246IGFwaUtleUNvbGxlY3Rpb25cbiAgICB9KVxuICB9XG5cbiAgYXNzZXJ0QWxsU2NoZW1hRmllbGRzKGFwaUtleUNvbGxlY3Rpb24sIGFwaUtleVNjaGVtYSlcblxuICByZXR1cm4gYXBpS2V5Q29sbGVjdGlvblxufVxuIl0sIm5hbWVzIjpbImJhTW9kZWxLZXkiLCJnZXRBZG1pbkFjY2VzcyIsImdldENvbGxlY3Rpb25GaWVsZHMiLCJhc3NlcnRBbGxTY2hlbWFGaWVsZHMiLCJnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyIsImJ1aWxkQXBpS2V5c0NvbGxlY3Rpb24iLCJpbmNvbWluZ0NvbGxlY3Rpb25zIiwicGx1Z2luT3B0aW9ucyIsInJlc29sdmVkU2NoZW1hcyIsImFwaUtleVNsdWciLCJhcGlrZXkiLCJhcGlLZXlTY2hlbWEiLCJleGlzdGluZ0FwaUtleUNvbGxlY3Rpb24iLCJmaW5kIiwiY29sbGVjdGlvbiIsInNsdWciLCJmaWVsZE92ZXJyaWRlcyIsIm5hbWUiLCJhZG1pbiIsInJlYWRPbmx5IiwiZGVzY3JpcHRpb24iLCJzdGFydCIsInByZWZpeCIsImtleSIsInVzZXJJZCIsInJlZmlsbEludGVydmFsIiwicmVmaWxsQW1vdW50IiwibGFzdFJlZmlsbEF0IiwiZW5hYmxlZCIsImRlZmF1bHRWYWx1ZSIsInJhdGVMaW1pdEVuYWJsZWQiLCJyYXRlTGltaXRUaW1lV2luZG93IiwicmF0ZUxpbWl0TWF4IiwicmVxdWVzdENvdW50IiwicmVtYWluaW5nIiwibGFzdFJlcXVlc3QiLCJleHBpcmVzQXQiLCJwZXJtaXNzaW9ucyIsIm1ldGFkYXRhIiwidHlwZSIsImFwaUtleUZpZWxkUnVsZXMiLCJjb25kaXRpb24iLCJmaWVsZCIsInRyYW5zZm9ybSIsInNhdmVUb0pXVCIsImRpc2FibGVCdWxrRWRpdCIsImhpZGRlbiIsImluZGV4IiwibGFiZWwiLCJ0IiwiY29sbGVjdGlvbkZpZWxkcyIsInNjaGVtYSIsImZpZWxkUnVsZXMiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsImFwaUtleUNvbGxlY3Rpb24iLCJoaWRlUGx1Z2luQ29sbGVjdGlvbnMiLCJ1c2VBc1RpdGxlIiwiZmllbGRzIiwiZmllbGROYW1lIiwiZ3JvdXAiLCJjb2xsZWN0aW9uQWRtaW5Hcm91cCIsImFjY2VzcyIsImN1c3RvbSIsImJldHRlckF1dGhNb2RlbEtleSIsInBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMiLCJhcGlLZXlzIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxVQUFVLFFBQVEsa0JBQWlCO0FBQzVDLFNBQVNDLGNBQWMsUUFBUSxpQ0FBZ0M7QUFFL0QsU0FBU0MsbUJBQW1CLFFBQVEsNkNBQTRDO0FBQ2hGLFNBQVNDLHFCQUFxQixFQUFFQyx1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