import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { assertAllSchemaFields, getSchemaCollectionSlug, getSchemaFieldName } from "./utils/collection-schema";
export function buildJwksCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const jwksSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.jwks);
    const jwksSchema = resolvedSchemas[baModelKey.jwks];
    const existingJwksCollection = incomingCollections.find((collection)=>collection.slug === jwksSlug);
    const fieldOverrides = {
        publicKey: ()=>({
                index: true,
                admin: {
                    description: 'The public part of the web key'
                }
            }),
        privateKey: ()=>({
                admin: {
                    description: 'The private part of the web key'
                }
            })
    };
    const collectionFields = getCollectionFields({
        schema: jwksSchema,
        additionalProperties: fieldOverrides
    });
    let jwksCollection = {
        ...existingJwksCollection,
        slug: jwksSlug,
        admin: {
            hidden: pluginOptions.hidePluginCollections ?? false,
            useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.jwks, 'publicKey'),
            description: 'JWKS are used to verify the signature of the JWT token',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingJwksCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingJwksCollection?.access ?? {}
        },
        custom: {
            ...existingJwksCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.jwks
        },
        fields: [
            ...existingJwksCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.pluginCollectionOverrides?.jwks === 'function') {
        jwksCollection = pluginOptions.pluginCollectionOverrides.jwks({
            collection: jwksCollection
        });
    }
    assertAllSchemaFields(jwksCollection, jwksSchema);
    return jwksCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL2p3a3MudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmFNb2RlbEtleSB9IGZyb20gJy4uLy4uL2NvbnN0YW50cydcbmltcG9ydCB7IGdldEFkbWluQWNjZXNzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9nZXQtYWRtaW4tYWNjZXNzJ1xuaW1wb3J0IHsgZ2V0Q29sbGVjdGlvbkZpZWxkcyB9IGZyb20gJy4vdXRpbHMvdHJhbnNmb3JtLXNjaGVtYS1maWVsZHMtdG8tcGF5bG9hZCdcbmltcG9ydCB7IGFzc2VydEFsbFNjaGVtYUZpZWxkcywgZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcsIGdldFNjaGVtYUZpZWxkTmFtZSB9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbi1zY2hlbWEnXG5cbmltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgdHlwZSB7IEp3a3MgfSBmcm9tICdAL2JldHRlci1hdXRoL2dlbmVyYXRlZC10eXBlcydcbmltcG9ydCB0eXBlIHsgQnVpbGRDb2xsZWN0aW9uUHJvcHMsIEZpZWxkT3ZlcnJpZGVzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vdHlwZXMnXG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEp3a3NDb2xsZWN0aW9uKHsgaW5jb21pbmdDb2xsZWN0aW9ucywgcGx1Z2luT3B0aW9ucywgcmVzb2x2ZWRTY2hlbWFzIH06IEJ1aWxkQ29sbGVjdGlvblByb3BzKTogQ29sbGVjdGlvbkNvbmZpZyB7XG4gIGNvbnN0IGp3a3NTbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5Lmp3a3MpXG4gIGNvbnN0IGp3a3NTY2hlbWEgPSByZXNvbHZlZFNjaGVtYXNbYmFNb2RlbEtleS5qd2tzXVxuXG4gIGNvbnN0IGV4aXN0aW5nSndrc0NvbGxlY3Rpb24gPSBpbmNvbWluZ0NvbGxlY3Rpb25zLmZpbmQoKGNvbGxlY3Rpb24pID0+IGNvbGxlY3Rpb24uc2x1ZyA9PT0gandrc1NsdWcpIGFzIENvbGxlY3Rpb25Db25maWcgfCB1bmRlZmluZWRcblxuICBjb25zdCBmaWVsZE92ZXJyaWRlczogRmllbGRPdmVycmlkZXM8a2V5b2YgSndrcz4gPSB7XG4gICAgcHVibGljS2V5OiAoKSA9PiAoe1xuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ1RoZSBwdWJsaWMgcGFydCBvZiB0aGUgd2ViIGtleScgfVxuICAgIH0pLFxuICAgIHByaXZhdGVLZXk6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ1RoZSBwcml2YXRlIHBhcnQgb2YgdGhlIHdlYiBrZXknIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgY29sbGVjdGlvbkZpZWxkcyA9IGdldENvbGxlY3Rpb25GaWVsZHMoe1xuICAgIHNjaGVtYTogandrc1NjaGVtYSxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmllbGRPdmVycmlkZXNcbiAgfSlcblxuICBsZXQgandrc0NvbGxlY3Rpb246IENvbGxlY3Rpb25Db25maWcgPSB7XG4gICAgLi4uZXhpc3RpbmdKd2tzQ29sbGVjdGlvbixcbiAgICBzbHVnOiBqd2tzU2x1ZyxcbiAgICBhZG1pbjoge1xuICAgICAgaGlkZGVuOiBwbHVnaW5PcHRpb25zLmhpZGVQbHVnaW5Db2xsZWN0aW9ucyA/PyBmYWxzZSxcbiAgICAgIHVzZUFzVGl0bGU6IGdldFNjaGVtYUZpZWxkTmFtZShyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkuandrcywgJ3B1YmxpY0tleScpLFxuICAgICAgZGVzY3JpcHRpb246ICdKV0tTIGFyZSB1c2VkIHRvIHZlcmlmeSB0aGUgc2lnbmF0dXJlIG9mIHRoZSBKV1QgdG9rZW4nLFxuICAgICAgZ3JvdXA6IHBsdWdpbk9wdGlvbnM/LmNvbGxlY3Rpb25BZG1pbkdyb3VwID8/ICdBdXRoJyxcbiAgICAgIC4uLmV4aXN0aW5nSndrc0NvbGxlY3Rpb24/LmFkbWluXG4gICAgfSxcbiAgICBhY2Nlc3M6IHtcbiAgICAgIC4uLmdldEFkbWluQWNjZXNzKHBsdWdpbk9wdGlvbnMpLFxuICAgICAgLi4uKGV4aXN0aW5nSndrc0NvbGxlY3Rpb24/LmFjY2VzcyA/PyB7fSlcbiAgICB9LFxuICAgIGN1c3RvbToge1xuICAgICAgLi4uKGV4aXN0aW5nSndrc0NvbGxlY3Rpb24/LmN1c3RvbSA/PyB7fSksXG4gICAgICBiZXR0ZXJBdXRoTW9kZWxLZXk6IGJhTW9kZWxLZXkuandrc1xuICAgIH0sXG4gICAgZmllbGRzOiBbLi4uKGV4aXN0aW5nSndrc0NvbGxlY3Rpb24/LmZpZWxkcyA/PyBbXSksIC4uLihjb2xsZWN0aW9uRmllbGRzID8/IFtdKV1cbiAgfVxuXG4gIGlmICh0eXBlb2YgcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzPy5qd2tzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgandrc0NvbGxlY3Rpb24gPSBwbHVnaW5PcHRpb25zLnBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMuandrcyh7XG4gICAgICBjb2xsZWN0aW9uOiBqd2tzQ29sbGVjdGlvblxuICAgIH0pXG4gIH1cblxuICBhc3NlcnRBbGxTY2hlbWFGaWVsZHMoandrc0NvbGxlY3Rpb24sIGp3a3NTY2hlbWEpXG5cbiAgcmV0dXJuIGp3a3NDb2xsZWN0aW9uXG59XG4iXSwibmFtZXMiOlsiYmFNb2RlbEtleSIsImdldEFkbWluQWNjZXNzIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsImFzc2VydEFsbFNjaGVtYUZpZWxkcyIsImdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIiwiZ2V0U2NoZW1hRmllbGROYW1lIiwiYnVpbGRKd2tzQ29sbGVjdGlvbiIsImluY29taW5nQ29sbGVjdGlvbnMiLCJwbHVnaW5PcHRpb25zIiwicmVzb2x2ZWRTY2hlbWFzIiwiandrc1NsdWciLCJqd2tzIiwiandrc1NjaGVtYSIsImV4aXN0aW5nSndrc0NvbGxlY3Rpb24iLCJmaW5kIiwiY29sbGVjdGlvbiIsInNsdWciLCJmaWVsZE92ZXJyaWRlcyIsInB1YmxpY0tleSIsImluZGV4IiwiYWRtaW4iLCJkZXNjcmlwdGlvbiIsInByaXZhdGVLZXkiLCJjb2xsZWN0aW9uRmllbGRzIiwic2NoZW1hIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJqd2tzQ29sbGVjdGlvbiIsImhpZGRlbiIsImhpZGVQbHVnaW5Db2xsZWN0aW9ucyIsInVzZUFzVGl0bGUiLCJncm91cCIsImNvbGxlY3Rpb25BZG1pbkdyb3VwIiwiYWNjZXNzIiwiY3VzdG9tIiwiYmV0dGVyQXV0aE1vZGVsS2V5IiwiZmllbGRzIiwicGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcyJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsVUFBVSxRQUFRLGtCQUFpQjtBQUM1QyxTQUFTQyxjQUFjLFFBQVEsaUNBQWdDO0FBQy9ELFNBQVNDLG1CQUFtQixRQUFRLDZDQUE0QztBQUNoRixTQUFTQyxxQkFBcUIsRUFBRUMsdUJBQXVCLEVBQUVDLGtCQUFrQixRQUFRLDRCQUEyQjtBQU05RyxPQUFPLFNBQVNDLG9CQUFvQixFQUFFQyxtQkFBbUIsRUFBRUMsYUFBYSxFQUFFQyxlQUFlLEVBQXdCO0lBQy9HLE1BQU1DLFdBQVdOLHdCQUF3QkssaUJBQWlCVCxXQUFXVyxJQUFJO0lBQ3pFLE1BQU1DLGFBQWFILGVBQWUsQ0FBQ1QsV0FBV1csSUFBSSxDQUFDO0lBRW5ELE1BQU1FLHlCQUF5Qk4sb0JBQW9CTyxJQUFJLENBQUMsQ0FBQ0MsYUFBZUEsV0FBV0MsSUFBSSxLQUFLTjtJQUU1RixNQUFNTyxpQkFBNkM7UUFDakRDLFdBQVcsSUFBTyxDQUFBO2dCQUNoQkMsT0FBTztnQkFDUEMsT0FBTztvQkFBRUMsYUFBYTtnQkFBaUM7WUFDekQsQ0FBQTtRQUNBQyxZQUFZLElBQU8sQ0FBQTtnQkFDakJGLE9BQU87b0JBQUVDLGFBQWE7Z0JBQWtDO1lBQzFELENBQUE7SUFDRjtJQUVBLE1BQU1FLG1CQUFtQnJCLG9CQUFvQjtRQUMzQ3NCLFFBQVFaO1FBQ1JhLHNCQUFzQlI7SUFDeEI7SUFFQSxJQUFJUyxpQkFBbUM7UUFDckMsR0FBR2Isc0JBQXNCO1FBQ3pCRyxNQUFNTjtRQUNOVSxPQUFPO1lBQ0xPLFFBQVFuQixjQUFjb0IscUJBQXFCLElBQUk7WUFDL0NDLFlBQVl4QixtQkFBbUJJLGlCQUFpQlQsV0FBV1csSUFBSSxFQUFFO1lBQ2pFVSxhQUFhO1lBQ2JTLE9BQU90QixlQUFldUIsd0JBQXdCO1lBQzlDLEdBQUdsQix3QkFBd0JPLEtBQUs7UUFDbEM7UUFDQVksUUFBUTtZQUNOLEdBQUcvQixlQUFlTyxjQUFjO1lBQ2hDLEdBQUlLLHdCQUF3Qm1CLFVBQVUsQ0FBQyxDQUFDO1FBQzFDO1FBQ0FDLFFBQVE7WUFDTixHQUFJcEIsd0JBQXdCb0IsVUFBVSxDQUFDLENBQUM7WUFDeENDLG9CQUFvQmxDLFdBQVdXLElBQUk7UUFDckM7UUFDQXdCLFFBQVE7ZUFBS3RCLHdCQUF3QnNCLFVBQVUsRUFBRTtlQUFPWixvQkFBb0IsRUFBRTtTQUFFO0lBQ2xGO0lBRUEsSUFBSSxPQUFPZixjQUFjNEIseUJBQXlCLEVBQUV6QixTQUFTLFlBQVk7UUFDdkVlLGlCQUFpQmxCLGNBQWM0Qix5QkFBeUIsQ0FBQ3pCLElBQUksQ0FBQztZQUM1REksWUFBWVc7UUFDZDtJQUNGO0lBRUF2QixzQkFBc0J1QixnQkFBZ0JkO0lBRXRDLE9BQU9jO0FBQ1QifQ==