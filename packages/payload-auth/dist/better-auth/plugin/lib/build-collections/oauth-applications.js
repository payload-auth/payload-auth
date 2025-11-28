import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { assertAllSchemaFields, getSchemaCollectionSlug } from "./utils/collection-schema";
export function buildOauthApplicationsCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const oauthApplicationSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.oauthApplication);
    const oauthApplicationSchema = resolvedSchemas[baModelKey.oauthApplication];
    const existingOauthApplicationCollection = incomingCollections.find((collection)=>collection.slug === oauthApplicationSlug);
    const fieldOverrides = {
        clientId: ()=>({
                unique: true,
                index: true,
                admin: {
                    readOnly: true,
                    description: 'Unique identifier for each OAuth client'
                }
            }),
        clientSecret: ()=>({
                admin: {
                    readOnly: true,
                    description: 'Secret key for the OAuth client'
                }
            }),
        name: ()=>({
                index: true,
                admin: {
                    description: 'Name of the OAuth application'
                }
            }),
        redirectURLs: ()=>({
                admin: {
                    description: 'Comma-separated list of redirect URLs'
                }
            }),
        metadata: ()=>({
                admin: {
                    readOnly: true,
                    description: 'Additional metadata for the OAuth application'
                }
            }),
        type: ()=>({
                admin: {
                    readOnly: true,
                    description: 'Type of OAuth client (e.g., web, mobile)'
                }
            }),
        disabled: ()=>({
                defaultValue: false,
                admin: {
                    description: 'Indicates if the client is disabled'
                }
            }),
        icon: ()=>({
                admin: {
                    description: 'Icon of the OAuth application'
                }
            }),
        userId: ()=>({
                admin: {
                    readOnly: true,
                    description: 'ID of the user who owns the client. (optional)'
                }
            })
    };
    const oauthApplicationFieldRules = [
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
        schema: oauthApplicationSchema,
        fieldRules: oauthApplicationFieldRules,
        additionalProperties: fieldOverrides
    });
    let oauthApplicationCollection = {
        ...existingOauthApplicationCollection,
        slug: oauthApplicationSlug,
        admin: {
            hidden: pluginOptions.hidePluginCollections ?? false,
            useAsTitle: oauthApplicationSchema?.fields?.name?.fieldName,
            description: 'OAuth applications are custom OAuth clients',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingOauthApplicationCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingOauthApplicationCollection?.access ?? {}
        },
        custom: {
            ...existingOauthApplicationCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.oauthApplication
        },
        fields: [
            ...existingOauthApplicationCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.pluginCollectionOverrides?.oauthApplications === 'function') {
        oauthApplicationCollection = pluginOptions.pluginCollectionOverrides.oauthApplications({
            collection: oauthApplicationCollection
        });
    }
    assertAllSchemaFields(oauthApplicationCollection, oauthApplicationSchema);
    return oauthApplicationCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL29hdXRoLWFwcGxpY2F0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiYU1vZGVsS2V5IH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgZ2V0QWRtaW5BY2Nlc3MgfSBmcm9tICcuLi8uLi9oZWxwZXJzL2dldC1hZG1pbi1hY2Nlc3MnXG5pbXBvcnQgeyBnZXRDb2xsZWN0aW9uRmllbGRzIH0gZnJvbSAnLi91dGlscy90cmFuc2Zvcm0tc2NoZW1hLWZpZWxkcy10by1wYXlsb2FkJ1xuaW1wb3J0IHsgYXNzZXJ0QWxsU2NoZW1hRmllbGRzLCBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyB9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbi1zY2hlbWEnXG5pbXBvcnQgdHlwZSB7IENvbGxlY3Rpb25Db25maWcgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHR5cGUgeyBPYXV0aEFwcGxpY2F0aW9uIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9nZW5lcmF0ZWQtdHlwZXMnXG5pbXBvcnQgdHlwZSB7IEJ1aWxkQ29sbGVjdGlvblByb3BzLCBGaWVsZE92ZXJyaWRlcywgRmllbGRSdWxlIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vdHlwZXMnXG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZE9hdXRoQXBwbGljYXRpb25zQ29sbGVjdGlvbih7XG4gIGluY29taW5nQ29sbGVjdGlvbnMsXG4gIHBsdWdpbk9wdGlvbnMsXG4gIHJlc29sdmVkU2NoZW1hc1xufTogQnVpbGRDb2xsZWN0aW9uUHJvcHMpOiBDb2xsZWN0aW9uQ29uZmlnIHtcbiAgY29uc3Qgb2F1dGhBcHBsaWNhdGlvblNsdWcgPSBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyhyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkub2F1dGhBcHBsaWNhdGlvbilcblxuICBjb25zdCBvYXV0aEFwcGxpY2F0aW9uU2NoZW1hID0gcmVzb2x2ZWRTY2hlbWFzW2JhTW9kZWxLZXkub2F1dGhBcHBsaWNhdGlvbl1cblxuICBjb25zdCBleGlzdGluZ09hdXRoQXBwbGljYXRpb25Db2xsZWN0aW9uID0gaW5jb21pbmdDb2xsZWN0aW9ucy5maW5kKChjb2xsZWN0aW9uKSA9PiBjb2xsZWN0aW9uLnNsdWcgPT09IG9hdXRoQXBwbGljYXRpb25TbHVnKSBhc1xuICAgIHwgQ29sbGVjdGlvbkNvbmZpZ1xuICAgIHwgdW5kZWZpbmVkXG5cbiAgY29uc3QgZmllbGRPdmVycmlkZXM6IEZpZWxkT3ZlcnJpZGVzPGtleW9mIE9hdXRoQXBwbGljYXRpb24+ID0ge1xuICAgIGNsaWVudElkOiAoKSA9PiAoe1xuICAgICAgdW5pcXVlOiB0cnVlLFxuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdVbmlxdWUgaWRlbnRpZmllciBmb3IgZWFjaCBPQXV0aCBjbGllbnQnIH1cbiAgICB9KSxcbiAgICBjbGllbnRTZWNyZXQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdTZWNyZXQga2V5IGZvciB0aGUgT0F1dGggY2xpZW50JyB9XG4gICAgfSksXG4gICAgbmFtZTogKCkgPT4gKHtcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdOYW1lIG9mIHRoZSBPQXV0aCBhcHBsaWNhdGlvbicgfVxuICAgIH0pLFxuICAgIHJlZGlyZWN0VVJMczogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnQ29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgcmVkaXJlY3QgVVJMcycgfVxuICAgIH0pLFxuICAgIG1ldGFkYXRhOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnQWRkaXRpb25hbCBtZXRhZGF0YSBmb3IgdGhlIE9BdXRoIGFwcGxpY2F0aW9uJyB9XG4gICAgfSksXG4gICAgdHlwZTogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1R5cGUgb2YgT0F1dGggY2xpZW50IChlLmcuLCB3ZWIsIG1vYmlsZSknIH1cbiAgICB9KSxcbiAgICBkaXNhYmxlZDogKCkgPT4gKHtcbiAgICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ0luZGljYXRlcyBpZiB0aGUgY2xpZW50IGlzIGRpc2FibGVkJyB9XG4gICAgfSksXG4gICAgaWNvbjogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnSWNvbiBvZiB0aGUgT0F1dGggYXBwbGljYXRpb24nIH1cbiAgICB9KSxcbiAgICB1c2VySWQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdJRCBvZiB0aGUgdXNlciB3aG8gb3ducyB0aGUgY2xpZW50LiAob3B0aW9uYWwpJyB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IG9hdXRoQXBwbGljYXRpb25GaWVsZFJ1bGVzOiBGaWVsZFJ1bGVbXSA9IFtcbiAgICB7XG4gICAgICBjb25kaXRpb246IChmaWVsZCkgPT4gZmllbGQudHlwZSA9PT0gJ2RhdGUnLFxuICAgICAgdHJhbnNmb3JtOiAoZmllbGQpID0+ICh7XG4gICAgICAgIC4uLmZpZWxkLFxuICAgICAgICBzYXZlVG9KV1Q6IGZhbHNlLFxuICAgICAgICBhZG1pbjoge1xuICAgICAgICAgIGRpc2FibGVCdWxrRWRpdDogdHJ1ZSxcbiAgICAgICAgICBoaWRkZW46IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgaW5kZXg6IHRydWUsXG4gICAgICAgIGxhYmVsOiAoeyB0IH06IGFueSkgPT4gdCgnZ2VuZXJhbDp1cGRhdGVkQXQnKVxuICAgICAgfSlcbiAgICB9XG4gIF1cblxuICBjb25zdCBjb2xsZWN0aW9uRmllbGRzID0gZ2V0Q29sbGVjdGlvbkZpZWxkcyh7XG4gICAgc2NoZW1hOiBvYXV0aEFwcGxpY2F0aW9uU2NoZW1hLFxuICAgIGZpZWxkUnVsZXM6IG9hdXRoQXBwbGljYXRpb25GaWVsZFJ1bGVzLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmaWVsZE92ZXJyaWRlc1xuICB9KVxuXG4gIGxldCBvYXV0aEFwcGxpY2F0aW9uQ29sbGVjdGlvbjogQ29sbGVjdGlvbkNvbmZpZyA9IHtcbiAgICAuLi5leGlzdGluZ09hdXRoQXBwbGljYXRpb25Db2xsZWN0aW9uLFxuICAgIHNsdWc6IG9hdXRoQXBwbGljYXRpb25TbHVnLFxuICAgIGFkbWluOiB7XG4gICAgICBoaWRkZW46IHBsdWdpbk9wdGlvbnMuaGlkZVBsdWdpbkNvbGxlY3Rpb25zID8/IGZhbHNlLFxuICAgICAgdXNlQXNUaXRsZTogb2F1dGhBcHBsaWNhdGlvblNjaGVtYT8uZmllbGRzPy5uYW1lPy5maWVsZE5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ09BdXRoIGFwcGxpY2F0aW9ucyBhcmUgY3VzdG9tIE9BdXRoIGNsaWVudHMnLFxuICAgICAgZ3JvdXA6IHBsdWdpbk9wdGlvbnM/LmNvbGxlY3Rpb25BZG1pbkdyb3VwID8/ICdBdXRoJyxcbiAgICAgIC4uLmV4aXN0aW5nT2F1dGhBcHBsaWNhdGlvbkNvbGxlY3Rpb24/LmFkbWluXG4gICAgfSxcbiAgICBhY2Nlc3M6IHtcbiAgICAgIC4uLmdldEFkbWluQWNjZXNzKHBsdWdpbk9wdGlvbnMpLFxuICAgICAgLi4uKGV4aXN0aW5nT2F1dGhBcHBsaWNhdGlvbkNvbGxlY3Rpb24/LmFjY2VzcyA/PyB7fSlcbiAgICB9LFxuICAgIGN1c3RvbToge1xuICAgICAgLi4uKGV4aXN0aW5nT2F1dGhBcHBsaWNhdGlvbkNvbGxlY3Rpb24/LmN1c3RvbSA/PyB7fSksXG4gICAgICBiZXR0ZXJBdXRoTW9kZWxLZXk6IGJhTW9kZWxLZXkub2F1dGhBcHBsaWNhdGlvblxuICAgIH0sXG4gICAgZmllbGRzOiBbLi4uKGV4aXN0aW5nT2F1dGhBcHBsaWNhdGlvbkNvbGxlY3Rpb24/LmZpZWxkcyA/PyBbXSksIC4uLihjb2xsZWN0aW9uRmllbGRzID8/IFtdKV1cbiAgfVxuXG4gIGlmICh0eXBlb2YgcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzPy5vYXV0aEFwcGxpY2F0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIG9hdXRoQXBwbGljYXRpb25Db2xsZWN0aW9uID0gcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzLm9hdXRoQXBwbGljYXRpb25zKHtcbiAgICAgIGNvbGxlY3Rpb246IG9hdXRoQXBwbGljYXRpb25Db2xsZWN0aW9uXG4gICAgfSlcbiAgfVxuXG4gIGFzc2VydEFsbFNjaGVtYUZpZWxkcyhvYXV0aEFwcGxpY2F0aW9uQ29sbGVjdGlvbiwgb2F1dGhBcHBsaWNhdGlvblNjaGVtYSlcblxuICByZXR1cm4gb2F1dGhBcHBsaWNhdGlvbkNvbGxlY3Rpb25cbn1cbiJdLCJuYW1lcyI6WyJiYU1vZGVsS2V5IiwiZ2V0QWRtaW5BY2Nlc3MiLCJnZXRDb2xsZWN0aW9uRmllbGRzIiwiYXNzZXJ0QWxsU2NoZW1hRmllbGRzIiwiZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWciLCJidWlsZE9hdXRoQXBwbGljYXRpb25zQ29sbGVjdGlvbiIsImluY29taW5nQ29sbGVjdGlvbnMiLCJwbHVnaW5PcHRpb25zIiwicmVzb2x2ZWRTY2hlbWFzIiwib2F1dGhBcHBsaWNhdGlvblNsdWciLCJvYXV0aEFwcGxpY2F0aW9uIiwib2F1dGhBcHBsaWNhdGlvblNjaGVtYSIsImV4aXN0aW5nT2F1dGhBcHBsaWNhdGlvbkNvbGxlY3Rpb24iLCJmaW5kIiwiY29sbGVjdGlvbiIsInNsdWciLCJmaWVsZE92ZXJyaWRlcyIsImNsaWVudElkIiwidW5pcXVlIiwiaW5kZXgiLCJhZG1pbiIsInJlYWRPbmx5IiwiZGVzY3JpcHRpb24iLCJjbGllbnRTZWNyZXQiLCJuYW1lIiwicmVkaXJlY3RVUkxzIiwibWV0YWRhdGEiLCJ0eXBlIiwiZGlzYWJsZWQiLCJkZWZhdWx0VmFsdWUiLCJpY29uIiwidXNlcklkIiwib2F1dGhBcHBsaWNhdGlvbkZpZWxkUnVsZXMiLCJjb25kaXRpb24iLCJmaWVsZCIsInRyYW5zZm9ybSIsInNhdmVUb0pXVCIsImRpc2FibGVCdWxrRWRpdCIsImhpZGRlbiIsImxhYmVsIiwidCIsImNvbGxlY3Rpb25GaWVsZHMiLCJzY2hlbWEiLCJmaWVsZFJ1bGVzIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJvYXV0aEFwcGxpY2F0aW9uQ29sbGVjdGlvbiIsImhpZGVQbHVnaW5Db2xsZWN0aW9ucyIsInVzZUFzVGl0bGUiLCJmaWVsZHMiLCJmaWVsZE5hbWUiLCJncm91cCIsImNvbGxlY3Rpb25BZG1pbkdyb3VwIiwiYWNjZXNzIiwiY3VzdG9tIiwiYmV0dGVyQXV0aE1vZGVsS2V5IiwicGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcyIsIm9hdXRoQXBwbGljYXRpb25zIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxVQUFVLFFBQVEsa0JBQWlCO0FBQzVDLFNBQVNDLGNBQWMsUUFBUSxpQ0FBZ0M7QUFDL0QsU0FBU0MsbUJBQW1CLFFBQVEsNkNBQTRDO0FBQ2hGLFNBQVNDLHFCQUFxQixFQUFFQyx1QkFBdUIsUUFBUSw0QkFBMkI7QUFLMUYsT0FBTyxTQUFTQyxpQ0FBaUMsRUFDL0NDLG1CQUFtQixFQUNuQkMsYUFBYSxFQUNiQyxlQUFlLEVBQ007SUFDckIsTUFBTUMsdUJBQXVCTCx3QkFBd0JJLGlCQUFpQlIsV0FBV1UsZ0JBQWdCO0lBRWpHLE1BQU1DLHlCQUF5QkgsZUFBZSxDQUFDUixXQUFXVSxnQkFBZ0IsQ0FBQztJQUUzRSxNQUFNRSxxQ0FBcUNOLG9CQUFvQk8sSUFBSSxDQUFDLENBQUNDLGFBQWVBLFdBQVdDLElBQUksS0FBS047SUFJeEcsTUFBTU8saUJBQXlEO1FBQzdEQyxVQUFVLElBQU8sQ0FBQTtnQkFDZkMs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