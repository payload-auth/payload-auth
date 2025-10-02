import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { assertAllSchemaFields, getSchemaCollectionSlug, getSchemaFieldName } from "./utils/collection-schema";
export function buildOauthAccessTokensCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const oauthAccessTokenSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.oauthAccessToken);
    const oauthAccessTokenSchema = resolvedSchemas[baModelKey.oauthAccessToken];
    const existingOauthAccessTokenCollection = incomingCollections.find((collection)=>collection.slug === oauthAccessTokenSlug);
    const fieldOverrides = {
        accessToken: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'Access token issued to the client'
                }
            }),
        refreshToken: ()=>({
                admin: {
                    readOnly: true,
                    description: 'Refresh token issued to the client'
                }
            }),
        accessTokenExpiresAt: ()=>({
                admin: {
                    readOnly: true,
                    description: 'Expiration date of the access token'
                }
            }),
        refreshTokenExpiresAt: ()=>({
                admin: {
                    readOnly: true,
                    description: 'Expiration date of the refresh token'
                }
            }),
        clientId: ()=>({
                admin: {
                    readOnly: true,
                    description: 'OAuth application associated with the access token'
                }
            }),
        userId: ()=>({
                admin: {
                    readOnly: true,
                    description: 'User associated with the access token'
                }
            }),
        scopes: ()=>({
                admin: {
                    description: 'Comma-separated list of scopes granted'
                }
            })
    };
    const oauthAccessTokenFieldRules = [
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
        schema: oauthAccessTokenSchema,
        fieldRules: oauthAccessTokenFieldRules,
        additionalProperties: fieldOverrides
    });
    let oauthAccessTokenCollection = {
        ...existingOauthAccessTokenCollection,
        slug: oauthAccessTokenSlug,
        admin: {
            hidden: pluginOptions.hidePluginCollections ?? false,
            useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.oauthAccessToken, 'accessToken'),
            description: 'OAuth access tokens for custom OAuth clients',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingOauthAccessTokenCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingOauthAccessTokenCollection?.access ?? {}
        },
        custom: {
            ...existingOauthAccessTokenCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.oauthAccessToken
        },
        fields: [
            ...existingOauthAccessTokenCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.pluginCollectionOverrides?.oauthAccessTokens === 'function') {
        oauthAccessTokenCollection = pluginOptions.pluginCollectionOverrides.oauthAccessTokens({
            collection: oauthAccessTokenCollection
        });
    }
    assertAllSchemaFields(oauthAccessTokenCollection, oauthAccessTokenSchema);
    return oauthAccessTokenCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL29hdXRoLWFjY2Vzcy10b2tlbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmFNb2RlbEtleSB9IGZyb20gJy4uLy4uL2NvbnN0YW50cydcbmltcG9ydCB7IGdldEFkbWluQWNjZXNzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9nZXQtYWRtaW4tYWNjZXNzJ1xuaW1wb3J0IHsgZ2V0Q29sbGVjdGlvbkZpZWxkcyB9IGZyb20gJy4vdXRpbHMvdHJhbnNmb3JtLXNjaGVtYS1maWVsZHMtdG8tcGF5bG9hZCdcbmltcG9ydCB7IGdldERlZmF1bHRDb2xsZWN0aW9uU2x1ZyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvZ2V0LWNvbGxlY3Rpb24tc2x1ZydcbmltcG9ydCB7IGFzc2VydEFsbFNjaGVtYUZpZWxkcywgZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcsIGdldFNjaGVtYUZpZWxkTmFtZSB9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbi1zY2hlbWEnXG5cbmltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgdHlwZSB7IEZpZWxkUnVsZSB9IGZyb20gJy4vdXRpbHMvbW9kZWwtZmllbGQtdHJhbnNmb3JtYXRpb25zJ1xuaW1wb3J0IHR5cGUgeyBPYXV0aEFjY2Vzc1Rva2VuIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9nZW5lcmF0ZWQtdHlwZXMnXG5pbXBvcnQgdHlwZSB7IEJ1aWxkQ29sbGVjdGlvblByb3BzLCBGaWVsZE92ZXJyaWRlcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRPYXV0aEFjY2Vzc1Rva2Vuc0NvbGxlY3Rpb24oe1xuICBpbmNvbWluZ0NvbGxlY3Rpb25zLFxuICBwbHVnaW5PcHRpb25zLFxuICByZXNvbHZlZFNjaGVtYXNcbn06IEJ1aWxkQ29sbGVjdGlvblByb3BzKTogQ29sbGVjdGlvbkNvbmZpZyB7XG4gIGNvbnN0IG9hdXRoQWNjZXNzVG9rZW5TbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5Lm9hdXRoQWNjZXNzVG9rZW4pXG4gIGNvbnN0IG9hdXRoQWNjZXNzVG9rZW5TY2hlbWEgPSByZXNvbHZlZFNjaGVtYXNbYmFNb2RlbEtleS5vYXV0aEFjY2Vzc1Rva2VuXVxuXG4gIGNvbnN0IGV4aXN0aW5nT2F1dGhBY2Nlc3NUb2tlbkNvbGxlY3Rpb24gPSBpbmNvbWluZ0NvbGxlY3Rpb25zLmZpbmQoKGNvbGxlY3Rpb24pID0+IGNvbGxlY3Rpb24uc2x1ZyA9PT0gb2F1dGhBY2Nlc3NUb2tlblNsdWcpIGFzXG4gICAgfCBDb2xsZWN0aW9uQ29uZmlnXG4gICAgfCB1bmRlZmluZWRcblxuICBjb25zdCBmaWVsZE92ZXJyaWRlczogRmllbGRPdmVycmlkZXM8a2V5b2YgT2F1dGhBY2Nlc3NUb2tlbj4gPSB7XG4gICAgYWNjZXNzVG9rZW46ICgpID0+ICh7XG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ0FjY2VzcyB0b2tlbiBpc3N1ZWQgdG8gdGhlIGNsaWVudCcgfVxuICAgIH0pLFxuICAgIHJlZnJlc2hUb2tlbjogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1JlZnJlc2ggdG9rZW4gaXNzdWVkIHRvIHRoZSBjbGllbnQnIH1cbiAgICB9KSxcbiAgICBhY2Nlc3NUb2tlbkV4cGlyZXNBdDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ0V4cGlyYXRpb24gZGF0ZSBvZiB0aGUgYWNjZXNzIHRva2VuJyB9XG4gICAgfSksXG4gICAgcmVmcmVzaFRva2VuRXhwaXJlc0F0OiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnRXhwaXJhdGlvbiBkYXRlIG9mIHRoZSByZWZyZXNoIHRva2VuJyB9XG4gICAgfSksXG4gICAgY2xpZW50SWQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdPQXV0aCBhcHBsaWNhdGlvbiBhc3NvY2lhdGVkIHdpdGggdGhlIGFjY2VzcyB0b2tlbicgfVxuICAgIH0pLFxuICAgIHVzZXJJZDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1VzZXIgYXNzb2NpYXRlZCB3aXRoIHRoZSBhY2Nlc3MgdG9rZW4nIH1cbiAgICB9KSxcbiAgICBzY29wZXM6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ0NvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIHNjb3BlcyBncmFudGVkJyB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IG9hdXRoQWNjZXNzVG9rZW5GaWVsZFJ1bGVzOiBGaWVsZFJ1bGVbXSA9IFtcbiAgICB7XG4gICAgICBjb25kaXRpb246IChmaWVsZCkgPT4gZmllbGQudHlwZSA9PT0gJ2RhdGUnLFxuICAgICAgdHJhbnNmb3JtOiAoZmllbGQpID0+ICh7XG4gICAgICAgIC4uLmZpZWxkLFxuICAgICAgICBzYXZlVG9KV1Q6IGZhbHNlLFxuICAgICAgICBhZG1pbjoge1xuICAgICAgICAgIGRpc2FibGVCdWxrRWRpdDogdHJ1ZSxcbiAgICAgICAgICBoaWRkZW46IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgaW5kZXg6IHRydWUsXG4gICAgICAgIGxhYmVsOiAoeyB0IH06IGFueSkgPT4gdCgnZ2VuZXJhbDp1cGRhdGVkQXQnKVxuICAgICAgfSlcbiAgICB9XG4gIF1cblxuICBjb25zdCBjb2xsZWN0aW9uRmllbGRzID0gZ2V0Q29sbGVjdGlvbkZpZWxkcyh7XG4gICAgc2NoZW1hOiBvYXV0aEFjY2Vzc1Rva2VuU2NoZW1hLFxuICAgIGZpZWxkUnVsZXM6IG9hdXRoQWNjZXNzVG9rZW5GaWVsZFJ1bGVzLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmaWVsZE92ZXJyaWRlc1xuICB9KVxuXG4gIGxldCBvYXV0aEFjY2Vzc1Rva2VuQ29sbGVjdGlvbjogQ29sbGVjdGlvbkNvbmZpZyA9IHtcbiAgICAuLi5leGlzdGluZ09hdXRoQWNjZXNzVG9rZW5Db2xsZWN0aW9uLFxuICAgIHNsdWc6IG9hdXRoQWNjZXNzVG9rZW5TbHVnLFxuICAgIGFkbWluOiB7XG4gICAgICBoaWRkZW46IHBsdWdpbk9wdGlvbnMuaGlkZVBsdWdpbkNvbGxlY3Rpb25zID8/IGZhbHNlLFxuICAgICAgdXNlQXNUaXRsZTogZ2V0U2NoZW1hRmllbGROYW1lKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS5vYXV0aEFjY2Vzc1Rva2VuLCAnYWNjZXNzVG9rZW4nKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnT0F1dGggYWNjZXNzIHRva2VucyBmb3IgY3VzdG9tIE9BdXRoIGNsaWVudHMnLFxuICAgICAgZ3JvdXA6IHBsdWdpbk9wdGlvbnM/LmNvbGxlY3Rpb25BZG1pbkdyb3VwID8/ICdBdXRoJyxcbiAgICAgIC4uLmV4aXN0aW5nT2F1dGhBY2Nlc3NUb2tlbkNvbGxlY3Rpb24/LmFkbWluXG4gICAgfSxcbiAgICBhY2Nlc3M6IHtcbiAgICAgIC4uLmdldEFkbWluQWNjZXNzKHBsdWdpbk9wdGlvbnMpLFxuICAgICAgLi4uKGV4aXN0aW5nT2F1dGhBY2Nlc3NUb2tlbkNvbGxlY3Rpb24/LmFjY2VzcyA/PyB7fSlcbiAgICB9LFxuICAgIGN1c3RvbToge1xuICAgICAgLi4uKGV4aXN0aW5nT2F1dGhBY2Nlc3NUb2tlbkNvbGxlY3Rpb24/LmN1c3RvbSA/PyB7fSksXG4gICAgICBiZXR0ZXJBdXRoTW9kZWxLZXk6IGJhTW9kZWxLZXkub2F1dGhBY2Nlc3NUb2tlblxuICAgIH0sXG4gICAgZmllbGRzOiBbLi4uKGV4aXN0aW5nT2F1dGhBY2Nlc3NUb2tlbkNvbGxlY3Rpb24/LmZpZWxkcyA/PyBbXSksIC4uLihjb2xsZWN0aW9uRmllbGRzID8/IFtdKV1cbiAgfVxuXG4gIGlmICh0eXBlb2YgcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzPy5vYXV0aEFjY2Vzc1Rva2VucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIG9hdXRoQWNjZXNzVG9rZW5Db2xsZWN0aW9uID0gcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzLm9hdXRoQWNjZXNzVG9rZW5zKHtcbiAgICAgIGNvbGxlY3Rpb246IG9hdXRoQWNjZXNzVG9rZW5Db2xsZWN0aW9uXG4gICAgfSlcbiAgfVxuXG4gIGFzc2VydEFsbFNjaGVtYUZpZWxkcyhvYXV0aEFjY2Vzc1Rva2VuQ29sbGVjdGlvbiwgb2F1dGhBY2Nlc3NUb2tlblNjaGVtYSlcblxuICByZXR1cm4gb2F1dGhBY2Nlc3NUb2tlbkNvbGxlY3Rpb25cbn1cbiJdLCJuYW1lcyI6WyJiYU1vZGVsS2V5IiwiZ2V0QWRtaW5BY2Nlc3MiLCJnZXRDb2xsZWN0aW9uRmllbGRzIiwiYXNzZXJ0QWxsU2NoZW1hRmllbGRzIiwiZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWciLCJnZXRTY2hlbWFGaWVsZE5hbWUiLCJidWlsZE9hdXRoQWNjZXNzVG9rZW5zQ29sbGVjdGlvbiIsImluY29taW5nQ29sbGVjdGlvbnMiLCJwbHVnaW5PcHRpb25zIiwicmVzb2x2ZWRTY2hlbWFzIiwib2F1dGhBY2Nlc3NUb2tlblNsdWciLCJvYXV0aEFjY2Vzc1Rva2VuIiwib2F1dGhBY2Nlc3NUb2tlblNjaGVtYSIsImV4aXN0aW5nT2F1dGhBY2Nlc3NUb2tlbkNvbGxlY3Rpb24iLCJmaW5kIiwiY29sbGVjdGlvbiIsInNsdWciLCJmaWVsZE92ZXJyaWRlcyIsImFjY2Vzc1Rva2VuIiwiaW5kZXgiLCJhZG1pbiIsInJlYWRPbmx5IiwiZGVzY3JpcHRpb24iLCJyZWZyZXNoVG9rZW4iLCJhY2Nlc3NUb2tlbkV4cGlyZXNBdCIsInJlZnJlc2hUb2tlbkV4cGlyZXNBdCIsImNsaWVudElkIiwidXNlcklkIiwic2NvcGVzIiwib2F1dGhBY2Nlc3NUb2tlbkZpZWxkUnVsZXMiLCJjb25kaXRpb24iLCJmaWVsZCIsInR5cGUiLCJ0cmFuc2Zvcm0iLCJzYXZlVG9KV1QiLCJkaXNhYmxlQnVsa0VkaXQiLCJoaWRkZW4iLCJsYWJlbCIsInQiLCJjb2xsZWN0aW9uRmllbGRzIiwic2NoZW1hIiwiZmllbGRSdWxlcyIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwib2F1dGhBY2Nlc3NUb2tlbkNvbGxlY3Rpb24iLCJoaWRlUGx1Z2luQ29sbGVjdGlvbnMiLCJ1c2VBc1RpdGxlIiwiZ3JvdXAiLCJjb2xsZWN0aW9uQWRtaW5Hcm91cCIsImFjY2VzcyIsImN1c3RvbSIsImJldHRlckF1dGhNb2RlbEtleSIsImZpZWxkcyIsInBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMiLCJvYXV0aEFjY2Vzc1Rva2VucyJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsVUFBVSxRQUFRLGtCQUFpQjtBQUM1QyxTQUFTQyxjQUFjLFFBQVEsaUNBQWdDO0FBQy9ELFNBQVNDLG1CQUFtQixRQUFRLDZDQUE0QztBQUVoRixTQUFTQyxxQkFBcUIsRUFBRUMsdUJBQXVCLEVBQUVDLGtCQUFrQixRQUFRLDRCQUEyQjtBQU85RyxPQUFPLFNBQVNDLGlDQUFpQyxFQUMvQ0MsbUJBQW1CLEVBQ25CQyxhQUFhLEVBQ2JDLGVBQWUsRUFDTTtJQUNyQixNQUFNQyx1QkFBdUJOLHdCQUF3QkssaUJBQWlCVCxXQUFXVyxnQkFBZ0I7SUFDakcsTUFBTUMseUJBQXlCSCxlQUFlLENBQUNULFdBQVdXLGdCQUFnQixDQUFDO0lBRTNFLE1BQU1FLHFDQUFxQ04sb0JBQW9CTyxJQUFJLENBQUMsQ0FBQ0MsYUFBZUEsV0FBV0MsSUFBSSxLQUFLTjtJQUl4RyxNQUFNTyxpQkFBeUQ7UUFDN0RDLGFBQWEsSUFBTyxDQUFBO2dCQUNsQkMsT0FBTztnQkFDUEMsT0FBTztvQkFBRUMsVUFBVTtvQkFBTUMsYUFBYTtnQkFBb0M7WUFDNUUsQ0FBQTtRQUNBQyxjQUFjLElBQU8sQ0FBQTtnQkFDbkJILE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQXFDO1lBQzdFLENBQUE7UUFDQUUsc0JBQXNCLElBQU8sQ0FBQTtnQkFDM0JKLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQXNDO1lBQzlFLENBQUE7UUFDQUcsdUJBQXVCLElBQU8sQ0FBQTtnQkFDNUJMLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQXVDO1lBQy9FLENBQUE7UUFDQUksVUFBVSxJQUFPLENBQUE7Z0JBQ2ZOLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQXFEO1lBQzdGLENBQUE7UUFDQUssUUFBUSxJQUFPLENBQUE7Z0JBQ2JQLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQXdDO1lBQ2hGLENBQUE7UUFDQU0sUUFBUSxJQUFPLENBQUE7Z0JBQ2JSLE9BQU87b0JBQUVFLGFBQWE7Z0JBQXlDO1lBQ2pFLENBQUE7SUFDRjtJQUVBLE1BQU1PLDZCQUEwQztRQUM5QztZQUNFQyxXQUFXLENBQUNDLFFBQVVBLE1BQU1DLElBQUksS0FBSztZQUNyQ0MsV0FBVyxDQUFDRixRQUFXLENBQUE7b0JBQ3JCLEdBQUdBLEtBQUs7b0JBQ1JHLFdBQVc7b0JBQ1hkLE9BQU87d0JBQ0xlLGlCQUFpQjt3QkFDakJDLFFBQVE7b0JBQ1Y7b0JBQ0FqQixPQUFPO29CQUNQa0IsT0FBTyxDQUFDLEVBQUVDLENBQUMsRUFBTyxHQUFLQSxFQUFFO2dCQUMzQixDQUFBO1FBQ0Y7S0FDRDtJQUVELE1BQU1DLG1CQUFtQnJDLG9CQUFvQjtRQUMzQ3NDLFFBQVE1QjtRQUNSNkIsWUFBWVo7UUFDWmEsc0JBQXNCekI7SUFDeEI7SUFFQSxJQUFJMEIsNkJBQStDO1FBQ2pELEdBQUc5QixrQ0FBa0M7UUFDckNHLE1BQU1OO1FBQ05VLE9BQU87WUFDTGdCLFFBQVE1QixjQUFjb0MscUJBQXFCLElBQUk7WUFDL0NDLFlBQVl4QyxtQkFBbUJJLGlCQUFpQlQsV0FBV1csZ0JBQWdCLEVBQUU7WUFDN0VXLGFBQWE7WUFDYndCLE9BQU90QyxlQUFldUMsd0JBQXdCO1lBQzlDLEdBQUdsQyxvQ0FBb0NPLEtBQUs7UUFDOUM7UUFDQTRCLFFBQVE7WUFDTixHQUFHL0MsZUFBZU8sY0FBYztZQUNoQyxHQUFJSyxvQ0FBb0NtQyxVQUFVLENBQUMsQ0FBQztRQUN0RDtRQUNBQyxRQUFRO1lBQ04sR0FBSXBDLG9DQUFvQ29DLFVBQVUsQ0FBQyxDQUFDO1lBQ3BEQyxvQkFBb0JsRCxXQUFXVyxnQkFBZ0I7UUFDakQ7UUFDQXdDLFFBQVE7ZUFBS3RDLG9DQUFvQ3NDLFVBQVUsRUFBRTtlQUFPWixvQkFBb0IsRUFBRTtTQUFFO0lBQzlGO0lBRUEsSUFBSSxPQUFPL0IsY0FBYzRDLHlCQUF5QixFQUFFQyxzQkFBc0IsWUFBWTtRQUNwRlYsNkJBQTZCbkMsY0FBYzRDLHlCQUF5QixDQUFDQyxpQkFBaUIsQ0FBQztZQUNyRnRDLFlBQVk0QjtRQUNkO0lBQ0Y7SUFFQXhDLHNCQUFzQndDLDRCQUE0Qi9CO0lBRWxELE9BQU8rQjtBQUNUIn0=