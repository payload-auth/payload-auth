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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL29hdXRoLWFjY2Vzcy10b2tlbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmFNb2RlbEtleSB9IGZyb20gJy4uLy4uL2NvbnN0YW50cydcbmltcG9ydCB7IGdldEFkbWluQWNjZXNzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9nZXQtYWRtaW4tYWNjZXNzJ1xuaW1wb3J0IHsgZ2V0Q29sbGVjdGlvbkZpZWxkcyB9IGZyb20gJy4vdXRpbHMvdHJhbnNmb3JtLXNjaGVtYS1maWVsZHMtdG8tcGF5bG9hZCdcbmltcG9ydCB7IGFzc2VydEFsbFNjaGVtYUZpZWxkcywgZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcsIGdldFNjaGVtYUZpZWxkTmFtZSB9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbi1zY2hlbWEnXG5cbmltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgdHlwZSB7IE9hdXRoQWNjZXNzVG9rZW4gfSBmcm9tICdAL2JldHRlci1hdXRoL2dlbmVyYXRlZC10eXBlcydcbmltcG9ydCB0eXBlIHsgQnVpbGRDb2xsZWN0aW9uUHJvcHMsIEZpZWxkT3ZlcnJpZGVzLCBGaWVsZFJ1bGUgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi90eXBlcydcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkT2F1dGhBY2Nlc3NUb2tlbnNDb2xsZWN0aW9uKHtcbiAgaW5jb21pbmdDb2xsZWN0aW9ucyxcbiAgcGx1Z2luT3B0aW9ucyxcbiAgcmVzb2x2ZWRTY2hlbWFzXG59OiBCdWlsZENvbGxlY3Rpb25Qcm9wcyk6IENvbGxlY3Rpb25Db25maWcge1xuICBjb25zdCBvYXV0aEFjY2Vzc1Rva2VuU2x1ZyA9IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS5vYXV0aEFjY2Vzc1Rva2VuKVxuICBjb25zdCBvYXV0aEFjY2Vzc1Rva2VuU2NoZW1hID0gcmVzb2x2ZWRTY2hlbWFzW2JhTW9kZWxLZXkub2F1dGhBY2Nlc3NUb2tlbl1cblxuICBjb25zdCBleGlzdGluZ09hdXRoQWNjZXNzVG9rZW5Db2xsZWN0aW9uID0gaW5jb21pbmdDb2xsZWN0aW9ucy5maW5kKChjb2xsZWN0aW9uKSA9PiBjb2xsZWN0aW9uLnNsdWcgPT09IG9hdXRoQWNjZXNzVG9rZW5TbHVnKSBhc1xuICAgIHwgQ29sbGVjdGlvbkNvbmZpZ1xuICAgIHwgdW5kZWZpbmVkXG5cbiAgY29uc3QgZmllbGRPdmVycmlkZXM6IEZpZWxkT3ZlcnJpZGVzPGtleW9mIE9hdXRoQWNjZXNzVG9rZW4+ID0ge1xuICAgIGFjY2Vzc1Rva2VuOiAoKSA9PiAoe1xuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdBY2Nlc3MgdG9rZW4gaXNzdWVkIHRvIHRoZSBjbGllbnQnIH1cbiAgICB9KSxcbiAgICByZWZyZXNoVG9rZW46ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdSZWZyZXNoIHRva2VuIGlzc3VlZCB0byB0aGUgY2xpZW50JyB9XG4gICAgfSksXG4gICAgYWNjZXNzVG9rZW5FeHBpcmVzQXQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdFeHBpcmF0aW9uIGRhdGUgb2YgdGhlIGFjY2VzcyB0b2tlbicgfVxuICAgIH0pLFxuICAgIHJlZnJlc2hUb2tlbkV4cGlyZXNBdDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ0V4cGlyYXRpb24gZGF0ZSBvZiB0aGUgcmVmcmVzaCB0b2tlbicgfVxuICAgIH0pLFxuICAgIGNsaWVudElkOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnT0F1dGggYXBwbGljYXRpb24gYXNzb2NpYXRlZCB3aXRoIHRoZSBhY2Nlc3MgdG9rZW4nIH1cbiAgICB9KSxcbiAgICB1c2VySWQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdVc2VyIGFzc29jaWF0ZWQgd2l0aCB0aGUgYWNjZXNzIHRva2VuJyB9XG4gICAgfSksXG4gICAgc2NvcGVzOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdDb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBzY29wZXMgZ3JhbnRlZCcgfVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBvYXV0aEFjY2Vzc1Rva2VuRmllbGRSdWxlczogRmllbGRSdWxlW10gPSBbXG4gICAge1xuICAgICAgY29uZGl0aW9uOiAoZmllbGQpID0+IGZpZWxkLnR5cGUgPT09ICdkYXRlJyxcbiAgICAgIHRyYW5zZm9ybTogKGZpZWxkKSA9PiAoe1xuICAgICAgICAuLi5maWVsZCxcbiAgICAgICAgc2F2ZVRvSldUOiBmYWxzZSxcbiAgICAgICAgYWRtaW46IHtcbiAgICAgICAgICBkaXNhYmxlQnVsa0VkaXQ6IHRydWUsXG4gICAgICAgICAgaGlkZGVuOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgICBsYWJlbDogKHsgdCB9OiBhbnkpID0+IHQoJ2dlbmVyYWw6dXBkYXRlZEF0JylcbiAgICAgIH0pXG4gICAgfVxuICBdXG5cbiAgY29uc3QgY29sbGVjdGlvbkZpZWxkcyA9IGdldENvbGxlY3Rpb25GaWVsZHMoe1xuICAgIHNjaGVtYTogb2F1dGhBY2Nlc3NUb2tlblNjaGVtYSxcbiAgICBmaWVsZFJ1bGVzOiBvYXV0aEFjY2Vzc1Rva2VuRmllbGRSdWxlcyxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmllbGRPdmVycmlkZXNcbiAgfSlcblxuICBsZXQgb2F1dGhBY2Nlc3NUb2tlbkNvbGxlY3Rpb246IENvbGxlY3Rpb25Db25maWcgPSB7XG4gICAgLi4uZXhpc3RpbmdPYXV0aEFjY2Vzc1Rva2VuQ29sbGVjdGlvbixcbiAgICBzbHVnOiBvYXV0aEFjY2Vzc1Rva2VuU2x1ZyxcbiAgICBhZG1pbjoge1xuICAgICAgaGlkZGVuOiBwbHVnaW5PcHRpb25zLmhpZGVQbHVnaW5Db2xsZWN0aW9ucyA/PyBmYWxzZSxcbiAgICAgIHVzZUFzVGl0bGU6IGdldFNjaGVtYUZpZWxkTmFtZShyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkub2F1dGhBY2Nlc3NUb2tlbiwgJ2FjY2Vzc1Rva2VuJyksXG4gICAgICBkZXNjcmlwdGlvbjogJ09BdXRoIGFjY2VzcyB0b2tlbnMgZm9yIGN1c3RvbSBPQXV0aCBjbGllbnRzJyxcbiAgICAgIGdyb3VwOiBwbHVnaW5PcHRpb25zPy5jb2xsZWN0aW9uQWRtaW5Hcm91cCA/PyAnQXV0aCcsXG4gICAgICAuLi5leGlzdGluZ09hdXRoQWNjZXNzVG9rZW5Db2xsZWN0aW9uPy5hZG1pblxuICAgIH0sXG4gICAgYWNjZXNzOiB7XG4gICAgICAuLi5nZXRBZG1pbkFjY2VzcyhwbHVnaW5PcHRpb25zKSxcbiAgICAgIC4uLihleGlzdGluZ09hdXRoQWNjZXNzVG9rZW5Db2xsZWN0aW9uPy5hY2Nlc3MgPz8ge30pXG4gICAgfSxcbiAgICBjdXN0b206IHtcbiAgICAgIC4uLihleGlzdGluZ09hdXRoQWNjZXNzVG9rZW5Db2xsZWN0aW9uPy5jdXN0b20gPz8ge30pLFxuICAgICAgYmV0dGVyQXV0aE1vZGVsS2V5OiBiYU1vZGVsS2V5Lm9hdXRoQWNjZXNzVG9rZW5cbiAgICB9LFxuICAgIGZpZWxkczogWy4uLihleGlzdGluZ09hdXRoQWNjZXNzVG9rZW5Db2xsZWN0aW9uPy5maWVsZHMgPz8gW10pLCAuLi4oY29sbGVjdGlvbkZpZWxkcyA/PyBbXSldXG4gIH1cblxuICBpZiAodHlwZW9mIHBsdWdpbk9wdGlvbnMucGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcz8ub2F1dGhBY2Nlc3NUb2tlbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvYXV0aEFjY2Vzc1Rva2VuQ29sbGVjdGlvbiA9IHBsdWdpbk9wdGlvbnMucGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcy5vYXV0aEFjY2Vzc1Rva2Vucyh7XG4gICAgICBjb2xsZWN0aW9uOiBvYXV0aEFjY2Vzc1Rva2VuQ29sbGVjdGlvblxuICAgIH0pXG4gIH1cblxuICBhc3NlcnRBbGxTY2hlbWFGaWVsZHMob2F1dGhBY2Nlc3NUb2tlbkNvbGxlY3Rpb24sIG9hdXRoQWNjZXNzVG9rZW5TY2hlbWEpXG5cbiAgcmV0dXJuIG9hdXRoQWNjZXNzVG9rZW5Db2xsZWN0aW9uXG59XG4iXSwibmFtZXMiOlsiYmFNb2RlbEtleSIsImdldEFkbWluQWNjZXNzIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsImFzc2VydEFsbFNjaGVtYUZpZWxkcyIsImdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIiwiZ2V0U2NoZW1hRmllbGROYW1lIiwiYnVpbGRPYXV0aEFjY2Vzc1Rva2Vuc0NvbGxlY3Rpb24iLCJpbmNvbWluZ0NvbGxlY3Rpb25zIiwicGx1Z2luT3B0aW9ucyIsInJlc29sdmVkU2NoZW1hcyIsIm9hdXRoQWNjZXNzVG9rZW5TbHVnIiwib2F1dGhBY2Nlc3NUb2tlbiIsIm9hdXRoQWNjZXNzVG9rZW5TY2hlbWEiLCJleGlzdGluZ09hdXRoQWNjZXNzVG9rZW5Db2xsZWN0aW9uIiwiZmluZCIsImNvbGxlY3Rpb24iLCJzbHVnIiwiZmllbGRPdmVycmlkZXMiLCJhY2Nlc3NUb2tlbiIsImluZGV4IiwiYWRtaW4iLCJyZWFkT25seSIsImRlc2NyaXB0aW9uIiwicmVmcmVzaFRva2VuIiwiYWNjZXNzVG9rZW5FeHBpcmVzQXQiLCJyZWZyZXNoVG9rZW5FeHBpcmVzQXQiLCJjbGllbnRJZCIsInVzZXJJZCIsInNjb3BlcyIsIm9hdXRoQWNjZXNzVG9rZW5GaWVsZFJ1bGVzIiwiY29uZGl0aW9uIiwiZmllbGQiLCJ0eXBlIiwidHJhbnNmb3JtIiwic2F2ZVRvSldUIiwiZGlzYWJsZUJ1bGtFZGl0IiwiaGlkZGVuIiwibGFiZWwiLCJ0IiwiY29sbGVjdGlvbkZpZWxkcyIsInNjaGVtYSIsImZpZWxkUnVsZXMiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsIm9hdXRoQWNjZXNzVG9rZW5Db2xsZWN0aW9uIiwiaGlkZVBsdWdpbkNvbGxlY3Rpb25zIiwidXNlQXNUaXRsZSIsImdyb3VwIiwiY29sbGVjdGlvbkFkbWluR3JvdXAiLCJhY2Nlc3MiLCJjdXN0b20iLCJiZXR0ZXJBdXRoTW9kZWxLZXkiLCJmaWVsZHMiLCJwbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzIiwib2F1dGhBY2Nlc3NUb2tlbnMiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFVBQVUsUUFBUSxrQkFBaUI7QUFDNUMsU0FBU0MsY0FBYyxRQUFRLGlDQUFnQztBQUMvRCxTQUFTQyxtQkFBbUIsUUFBUSw2Q0FBNEM7QUFDaEYsU0FBU0MscUJBQXFCLEVBQUVDLHVCQUF1QixFQUFFQyxrQkFBa0IsUUFBUSw0QkFBMkI7QUFNOUcsT0FBTyxTQUFTQyxpQ0FBaUMsRUFDL0NDLG1CQUFtQixFQUNuQkMsYUFBYSxFQUNiQyxlQUFlLEVBQ007SUFDckIsTUFBTUMsdUJBQXVCTix3QkFBd0JLLGlCQUFpQlQsV0FBV1csZ0JBQWdCO0lBQ2pHLE1BQU1DLHlCQUF5QkgsZUFBZSxDQUFDVCxXQUFXVyxnQkFBZ0IsQ0FBQztJQUUzRSxNQUFNRSxxQ0FBcUNOLG9CQUFvQk8sSUFBSSxDQUFDLENBQUNDLGFBQWVBLFdBQVdDLElBQUksS0FBS047SUFJeEcsTUFBTU8saUJBQXlEO1FBQzdEQyxhQUFhLElBQU8sQ0FBQTtnQkFDbEJDLE9BQU87Z0JBQ1BDLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQW9DO1lBQzVFLENBQUE7UUFDQUMsY0FBYyxJQUFPLENBQUE7Z0JBQ25CSCxPQUFPO29CQUFFQyxVQUFVO29CQUFNQyxhQUFhO2dCQUFxQztZQUM3RSxDQUFBO1FBQ0FFLHNCQUFzQixJQUFPLENBQUE7Z0JBQzNCSixPQUFPO29CQUFFQyxVQUFVO29CQUFNQyxhQUFhO2dCQUFzQztZQUM5RSxDQUFBO1FBQ0FHLHVCQUF1QixJQUFPLENBQUE7Z0JBQzVCTCxPQUFPO29CQUFFQyxVQUFVO29CQUFNQyxhQUFhO2dCQUF1QztZQUMvRSxDQUFBO1FBQ0FJLFVBQVUsSUFBTyxDQUFBO2dCQUNmTixPQUFPO29CQUFFQyxVQUFVO29CQUFNQyxhQUFhO2dCQUFxRDtZQUM3RixDQUFBO1FBQ0FLLFFBQVEsSUFBTyxDQUFBO2dCQUNiUCxPQUFPO29CQUFFQyxVQUFVO29CQUFNQyxhQUFhO2dCQUF3QztZQUNoRixDQUFBO1FBQ0FNLFFBQVEsSUFBTyxDQUFBO2dCQUNiUixPQUFPO29CQUFFRSxhQUFhO2dCQUF5QztZQUNqRSxDQUFBO0lBQ0Y7SUFFQSxNQUFNTyw2QkFBMEM7UUFDOUM7WUFDRUMsV0FBVyxDQUFDQyxRQUFVQSxNQUFNQyxJQUFJLEtBQUs7WUFDckNDLFdBQVcsQ0FBQ0YsUUFBVyxDQUFBO29CQUNyQixHQUFHQSxLQUFLO29CQUNSRyxXQUFXO29CQUNYZCxPQUFPO3dCQUNMZSxpQkFBaUI7d0JBQ2pCQyxRQUFRO29CQUNWO29CQUNBakIsT0FBTztvQkFDUGtCLE9BQU8sQ0FBQyxFQUFFQyxDQUFDLEVBQU8sR0FBS0EsRUFBRTtnQkFDM0IsQ0FBQTtRQUNGO0tBQ0Q7SUFFRCxNQUFNQyxtQkFBbUJyQyxvQkFBb0I7UUFDM0NzQyxRQUFRNUI7UUFDUjZCLFlBQVlaO1FBQ1phLHNCQUFzQnpCO0lBQ3hCO0lBRUEsSUFBSTBCLDZCQUErQztRQUNqRCxHQUFHOUIsa0NBQWtDO1FBQ3JDRyxNQUFNTjtRQUNOVSxPQUFPO1lBQ0xnQixRQUFRNUIsY0FBY29DLHFCQUFxQixJQUFJO1lBQy9DQyxZQUFZeEMsbUJBQW1CSSxpQkFBaUJULFdBQVdXLGdCQUFnQixFQUFFO1lBQzdFVyxhQUFhO1lBQ2J3QixPQUFPdEMsZUFBZXVDLHdCQUF3QjtZQUM5QyxHQUFHbEMsb0NBQW9DTyxLQUFLO1FBQzlDO1FBQ0E0QixRQUFRO1lBQ04sR0FBRy9DLGVBQWVPLGNBQWM7WUFDaEMsR0FBSUssb0NBQW9DbUMsVUFBVSxDQUFDLENBQUM7UUFDdEQ7UUFDQUMsUUFBUTtZQUNOLEdBQUlwQyxvQ0FBb0NvQyxVQUFVLENBQUMsQ0FBQztZQUNwREMsb0JBQW9CbEQsV0FBV1csZ0JBQWdCO1FBQ2pEO1FBQ0F3QyxRQUFRO2VBQUt0QyxvQ0FBb0NzQyxVQUFVLEVBQUU7ZUFBT1osb0JBQW9CLEVBQUU7U0FBRTtJQUM5RjtJQUVBLElBQUksT0FBTy9CLGNBQWM0Qyx5QkFBeUIsRUFBRUMsc0JBQXNCLFlBQVk7UUFDcEZWLDZCQUE2Qm5DLGNBQWM0Qyx5QkFBeUIsQ0FBQ0MsaUJBQWlCLENBQUM7WUFDckZ0QyxZQUFZNEI7UUFDZDtJQUNGO0lBRUF4QyxzQkFBc0J3Qyw0QkFBNEIvQjtJQUVsRCxPQUFPK0I7QUFDVCJ9