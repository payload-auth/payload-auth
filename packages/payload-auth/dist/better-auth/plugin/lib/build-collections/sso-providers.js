import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { getSchemaCollectionSlug, getSchemaFieldName } from "./utils/collection-schema";
import { assertAllSchemaFields } from "./utils/collection-schema";
export function buildSsoProvidersCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const ssoProviderSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.ssoProvider);
    const ssoProviderSchema = resolvedSchemas[baModelKey.ssoProvider];
    const existingSsoProviderCollection = incomingCollections.find((collection)=>collection.slug === ssoProviderSlug);
    const fieldOverrides = {
        issuer: ()=>({
                index: true,
                admin: {
                    description: 'The issuer of the SSO provider'
                }
            }),
        domain: ()=>({
                admin: {
                    description: 'The domain of the SSO provider'
                }
            }),
        oidcConfig: ()=>({
                admin: {
                    description: 'The OIDC config of the SSO provider'
                }
            }),
        userId: ()=>({
                admin: {
                    description: 'The user associated with the SSO provider'
                }
            }),
        providerId: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The provider id. Used to identify a provider and to generate a redirect url'
                }
            }),
        organizationId: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The organization Id. If provider is linked to an organization'
                }
            })
    };
    const collectionFields = getCollectionFields({
        schema: ssoProviderSchema,
        additionalProperties: fieldOverrides
    });
    let ssoProviderCollection = {
        ...existingSsoProviderCollection,
        slug: ssoProviderSlug,
        admin: {
            hidden: pluginOptions.hidePluginCollections ?? false,
            useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.ssoProvider, 'issuer'),
            description: 'SSO providers are used to authenticate users with an external provider',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingSsoProviderCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingSsoProviderCollection?.access ?? {}
        },
        custom: {
            ...existingSsoProviderCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.ssoProvider
        },
        fields: [
            ...existingSsoProviderCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.pluginCollectionOverrides?.ssoProviders === 'function') {
        ssoProviderCollection = pluginOptions.pluginCollectionOverrides.ssoProviders({
            collection: ssoProviderCollection
        });
    }
    assertAllSchemaFields(ssoProviderCollection, ssoProviderSchema);
    return ssoProviderCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3Nzby1wcm92aWRlcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmFNb2RlbEtleSB9IGZyb20gJy4uLy4uL2NvbnN0YW50cydcbmltcG9ydCB7IGdldEFkbWluQWNjZXNzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9nZXQtYWRtaW4tYWNjZXNzJ1xuaW1wb3J0IHsgZ2V0Q29sbGVjdGlvbkZpZWxkcyB9IGZyb20gJy4vdXRpbHMvdHJhbnNmb3JtLXNjaGVtYS1maWVsZHMtdG8tcGF5bG9hZCdcbmltcG9ydCB7IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnLCBnZXRTY2hlbWFGaWVsZE5hbWUgfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuaW1wb3J0IHsgYXNzZXJ0QWxsU2NoZW1hRmllbGRzIH0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcblxuaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB0eXBlIHsgU3NvUHJvdmlkZXIgfSBmcm9tICdAL2JldHRlci1hdXRoL2dlbmVyYXRlZC10eXBlcydcbmltcG9ydCB0eXBlIHsgQnVpbGRDb2xsZWN0aW9uUHJvcHMsIEZpZWxkT3ZlcnJpZGVzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vdHlwZXMnXG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFNzb1Byb3ZpZGVyc0NvbGxlY3Rpb24oeyBpbmNvbWluZ0NvbGxlY3Rpb25zLCBwbHVnaW5PcHRpb25zLCByZXNvbHZlZFNjaGVtYXMgfTogQnVpbGRDb2xsZWN0aW9uUHJvcHMpOiBDb2xsZWN0aW9uQ29uZmlnIHtcbiAgY29uc3Qgc3NvUHJvdmlkZXJTbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LnNzb1Byb3ZpZGVyKVxuICBjb25zdCBzc29Qcm92aWRlclNjaGVtYSA9IHJlc29sdmVkU2NoZW1hc1tiYU1vZGVsS2V5LnNzb1Byb3ZpZGVyXVxuXG4gIGNvbnN0IGV4aXN0aW5nU3NvUHJvdmlkZXJDb2xsZWN0aW9uID0gaW5jb21pbmdDb2xsZWN0aW9ucy5maW5kKChjb2xsZWN0aW9uKSA9PiBjb2xsZWN0aW9uLnNsdWcgPT09IHNzb1Byb3ZpZGVyU2x1ZykgYXNcbiAgICB8IENvbGxlY3Rpb25Db25maWdcbiAgICB8IHVuZGVmaW5lZFxuXG4gIGNvbnN0IGZpZWxkT3ZlcnJpZGVzOiBGaWVsZE92ZXJyaWRlczxrZXlvZiBTc29Qcm92aWRlcj4gPSB7XG4gICAgaXNzdWVyOiAoKSA9PiAoe1xuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ1RoZSBpc3N1ZXIgb2YgdGhlIFNTTyBwcm92aWRlcicgfVxuICAgIH0pLFxuICAgIGRvbWFpbjogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnVGhlIGRvbWFpbiBvZiB0aGUgU1NPIHByb3ZpZGVyJyB9XG4gICAgfSksXG4gICAgb2lkY0NvbmZpZzogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnVGhlIE9JREMgY29uZmlnIG9mIHRoZSBTU08gcHJvdmlkZXInIH1cbiAgICB9KSxcbiAgICB1c2VySWQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ1RoZSB1c2VyIGFzc29jaWF0ZWQgd2l0aCB0aGUgU1NPIHByb3ZpZGVyJyB9XG4gICAgfSksXG4gICAgcHJvdmlkZXJJZDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBwcm92aWRlciBpZC4gVXNlZCB0byBpZGVudGlmeSBhIHByb3ZpZGVyIGFuZCB0byBnZW5lcmF0ZSBhIHJlZGlyZWN0IHVybCdcbiAgICAgIH1cbiAgICB9KSxcbiAgICBvcmdhbml6YXRpb25JZDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBvcmdhbml6YXRpb24gSWQuIElmIHByb3ZpZGVyIGlzIGxpbmtlZCB0byBhbiBvcmdhbml6YXRpb24nXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGNvbGxlY3Rpb25GaWVsZHMgPSBnZXRDb2xsZWN0aW9uRmllbGRzKHtcbiAgICBzY2hlbWE6IHNzb1Byb3ZpZGVyU2NoZW1hLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmaWVsZE92ZXJyaWRlc1xuICB9KVxuXG4gIGxldCBzc29Qcm92aWRlckNvbGxlY3Rpb246IENvbGxlY3Rpb25Db25maWcgPSB7XG4gICAgLi4uZXhpc3RpbmdTc29Qcm92aWRlckNvbGxlY3Rpb24sXG4gICAgc2x1Zzogc3NvUHJvdmlkZXJTbHVnLFxuICAgIGFkbWluOiB7XG4gICAgICBoaWRkZW46IHBsdWdpbk9wdGlvbnMuaGlkZVBsdWdpbkNvbGxlY3Rpb25zID8/IGZhbHNlLFxuICAgICAgdXNlQXNUaXRsZTogZ2V0U2NoZW1hRmllbGROYW1lKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS5zc29Qcm92aWRlciwgJ2lzc3VlcicpLFxuICAgICAgZGVzY3JpcHRpb246ICdTU08gcHJvdmlkZXJzIGFyZSB1c2VkIHRvIGF1dGhlbnRpY2F0ZSB1c2VycyB3aXRoIGFuIGV4dGVybmFsIHByb3ZpZGVyJyxcbiAgICAgIGdyb3VwOiBwbHVnaW5PcHRpb25zPy5jb2xsZWN0aW9uQWRtaW5Hcm91cCA/PyAnQXV0aCcsXG4gICAgICAuLi5leGlzdGluZ1Nzb1Byb3ZpZGVyQ29sbGVjdGlvbj8uYWRtaW5cbiAgICB9LFxuICAgIGFjY2Vzczoge1xuICAgICAgLi4uZ2V0QWRtaW5BY2Nlc3MocGx1Z2luT3B0aW9ucyksXG4gICAgICAuLi4oZXhpc3RpbmdTc29Qcm92aWRlckNvbGxlY3Rpb24/LmFjY2VzcyA/PyB7fSlcbiAgICB9LFxuICAgIGN1c3RvbToge1xuICAgICAgLi4uKGV4aXN0aW5nU3NvUHJvdmlkZXJDb2xsZWN0aW9uPy5jdXN0b20gPz8ge30pLFxuICAgICAgYmV0dGVyQXV0aE1vZGVsS2V5OiBiYU1vZGVsS2V5LnNzb1Byb3ZpZGVyXG4gICAgfSxcbiAgICBmaWVsZHM6IFsuLi4oZXhpc3RpbmdTc29Qcm92aWRlckNvbGxlY3Rpb24/LmZpZWxkcyA/PyBbXSksIC4uLihjb2xsZWN0aW9uRmllbGRzID8/IFtdKV1cbiAgfVxuXG4gIGlmICh0eXBlb2YgcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzPy5zc29Qcm92aWRlcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBzc29Qcm92aWRlckNvbGxlY3Rpb24gPSBwbHVnaW5PcHRpb25zLnBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMuc3NvUHJvdmlkZXJzKHtcbiAgICAgIGNvbGxlY3Rpb246IHNzb1Byb3ZpZGVyQ29sbGVjdGlvblxuICAgIH0pXG4gIH1cblxuICBhc3NlcnRBbGxTY2hlbWFGaWVsZHMoc3NvUHJvdmlkZXJDb2xsZWN0aW9uLCBzc29Qcm92aWRlclNjaGVtYSlcblxuICByZXR1cm4gc3NvUHJvdmlkZXJDb2xsZWN0aW9uXG59XG4iXSwibmFtZXMiOlsiYmFNb2RlbEtleSIsImdldEFkbWluQWNjZXNzIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsImdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIiwiZ2V0U2NoZW1hRmllbGROYW1lIiwiYXNzZXJ0QWxsU2NoZW1hRmllbGRzIiwiYnVpbGRTc29Qcm92aWRlcnNDb2xsZWN0aW9uIiwiaW5jb21pbmdDb2xsZWN0aW9ucyIsInBsdWdpbk9wdGlvbnMiLCJyZXNvbHZlZFNjaGVtYXMiLCJzc29Qcm92aWRlclNsdWciLCJzc29Qcm92aWRlciIsInNzb1Byb3ZpZGVyU2NoZW1hIiwiZXhpc3RpbmdTc29Qcm92aWRlckNvbGxlY3Rpb24iLCJmaW5kIiwiY29sbGVjdGlvbiIsInNsdWciLCJmaWVsZE92ZXJyaWRlcyIsImlzc3VlciIsImluZGV4IiwiYWRtaW4iLCJkZXNjcmlwdGlvbiIsImRvbWFpbiIsIm9pZGNDb25maWciLCJ1c2VySWQiLCJwcm92aWRlcklkIiwicmVhZE9ubHkiLCJvcmdhbml6YXRpb25JZCIsImNvbGxlY3Rpb25GaWVsZHMiLCJzY2hlbWEiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInNzb1Byb3ZpZGVyQ29sbGVjdGlvbiIsImhpZGRlbiIsImhpZGVQbHVnaW5Db2xsZWN0aW9ucyIsInVzZUFzVGl0bGUiLCJncm91cCIsImNvbGxlY3Rpb25BZG1pbkdyb3VwIiwiYWNjZXNzIiwiY3VzdG9tIiwiYmV0dGVyQXV0aE1vZGVsS2V5IiwiZmllbGRzIiwicGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcyIsInNzb1Byb3ZpZGVycyJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsVUFBVSxRQUFRLGtCQUFpQjtBQUM1QyxTQUFTQyxjQUFjLFFBQVEsaUNBQWdDO0FBQy9ELFNBQVNDLG1CQUFtQixRQUFRLDZDQUE0QztBQUNoRixTQUFTQyx1QkFBdUIsRUFBRUMsa0JBQWtCLFFBQVEsNEJBQTJCO0FBQ3ZGLFNBQVNDLHFCQUFxQixRQUFRLDRCQUEyQjtBQU1qRSxPQUFPLFNBQVNDLDRCQUE0QixFQUFFQyxtQkFBbUIsRUFBRUMsYUFBYSxFQUFFQyxlQUFlLEVBQXdCO0lBQ3ZILE1BQU1DLGtCQUFrQlAsd0JBQXdCTSxpQkFBaUJULFdBQVdXLFdBQVc7SUFDdkYsTUFBTUMsb0JBQW9CSCxlQUFlLENBQUNULFdBQVdXLFdBQVcsQ0FBQztJQUVqRSxNQUFNRSxnQ0FBZ0NOLG9CQUFvQk8sSUFBSSxDQUFDLENBQUNDLGFBQWVBLFdBQVdDLElBQUksS0FBS047SUFJbkcsTUFBTU8saUJBQW9EO1FBQ3hEQyxRQUFRLElBQU8sQ0FBQTtnQkFDYkMsT0FBTztnQkFDUEMsT0FBTztvQkFBRUMsYUFBYTtnQkFBaUM7WUFDekQsQ0FBQTtRQUNBQyxRQUFRLElBQU8sQ0FBQTtnQkFDYkYsT0FBTztvQkFBRUMsYUFBYTtnQkFBaUM7WUFDekQsQ0FBQTtRQUNBRSxZQUFZLElBQU8sQ0FBQTtnQkFDakJILE9BQU87b0JBQUVDLGFBQWE7Z0JBQXNDO1lBQzlELENBQUE7UUFDQUcsUUFBUSxJQUFPLENBQUE7Z0JBQ2JKLE9BQU87b0JBQUVDLGFBQWE7Z0JBQTRDO1lBQ3BFLENBQUE7UUFDQUksWUFBWSxJQUFPLENBQUE7Z0JBQ2pCTCxPQUFPO29CQUNMTSxVQUFVO29CQUNWTCxhQUFhO2dCQUNmO1lBQ0YsQ0FBQTtRQUNBTSxnQkFBZ0IsSUFBTyxDQUFBO2dCQUNyQlAsT0FBTztvQkFDTE0sVUFBVTtvQkFDVkwsYUFBYTtnQkFDZjtZQUNGLENBQUE7SUFDRjtJQUVBLE1BQU1PLG1CQUFtQjFCLG9CQUFvQjtRQUMzQzJCLFFBQVFqQjtRQUNSa0Isc0JBQXNCYjtJQUN4QjtJQUVBLElBQUljLHdCQUEwQztRQUM1QyxHQUFHbEIsNkJBQTZCO1FBQ2hDRyxNQUFNTjtRQUNOVSxPQUFPO1lBQ0xZLFFBQVF4QixjQUFjeUIscUJBQXFCLElBQUk7WUFDL0NDLFlBQVk5QixtQkFBbUJLLGlCQUFpQlQsV0FBV1csV0FBVyxFQUFFO1lBQ3hFVSxhQUFhO1lBQ2JjLE9BQU8zQixlQUFlNEIsd0JBQXdCO1lBQzlDLEdBQUd2QiwrQkFBK0JPLEtBQUs7UUFDekM7UUFDQWlCLFFBQVE7WUFDTixHQUFHcEMsZUFBZU8sY0FBYztZQUNoQyxHQUFJSywrQkFBK0J3QixVQUFVLENBQUMsQ0FBQztRQUNqRDtRQUNBQyxRQUFRO1lBQ04sR0FBSXpCLCtCQUErQnlCLFVBQVUsQ0FBQyxDQUFDO1lBQy9DQyxvQkFBb0J2QyxXQUFXVyxXQUFXO1FBQzVDO1FBQ0E2QixRQUFRO2VBQUszQiwrQkFBK0IyQixVQUFVLEVBQUU7ZUFBT1osb0JBQW9CLEVBQUU7U0FBRTtJQUN6RjtJQUVBLElBQUksT0FBT3BCLGNBQWNpQyx5QkFBeUIsRUFBRUMsaUJBQWlCLFlBQVk7UUFDL0VYLHdCQUF3QnZCLGNBQWNpQyx5QkFBeUIsQ0FBQ0MsWUFBWSxDQUFDO1lBQzNFM0IsWUFBWWdCO1FBQ2Q7SUFDRjtJQUVBMUIsc0JBQXNCMEIsdUJBQXVCbkI7SUFFN0MsT0FBT21CO0FBQ1QifQ==