import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { getSchemaCollectionSlug, getSchemaFieldName } from "./utils/collection-schema";
import { assertAllSchemaFields } from "./utils/collection-schema";
export function buildOrganizationsCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const organizationSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.organization);
    const organizationSchema = resolvedSchemas[baModelKey.organization];
    const existingOrganizationCollection = incomingCollections.find((collection)=>collection.slug === organizationSlug);
    const fieldOverrides = {
        name: ()=>({
                admin: {
                    description: 'The name of the organization.'
                }
            }),
        slug: ()=>({
                unique: true,
                index: true,
                admin: {
                    description: 'The slug of the organization.'
                }
            }),
        logo: ()=>({
                admin: {
                    description: 'The logo of the organization.'
                }
            }),
        metadata: ()=>({
                admin: {
                    description: 'Additional metadata for the organization.'
                }
            })
    };
    const collectionFields = getCollectionFields({
        schema: organizationSchema,
        additionalProperties: fieldOverrides
    });
    let organizationCollection = {
        ...existingOrganizationCollection,
        slug: organizationSlug,
        admin: {
            hidden: pluginOptions.hidePluginCollections ?? false,
            useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.organization, 'name'),
            description: 'Organizations are groups of users that share access to certain resources.',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingOrganizationCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingOrganizationCollection?.access ?? {}
        },
        custom: {
            ...existingOrganizationCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.organization
        },
        fields: [
            ...existingOrganizationCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.pluginCollectionOverrides?.organizations === 'function') {
        organizationCollection = pluginOptions.pluginCollectionOverrides.organizations({
            collection: organizationCollection
        });
    }
    assertAllSchemaFields(organizationCollection, organizationSchema);
    return organizationCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL29yZ2FuaXphdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmFNb2RlbEtleSB9IGZyb20gJy4uLy4uL2NvbnN0YW50cydcbmltcG9ydCB7IGdldEFkbWluQWNjZXNzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9nZXQtYWRtaW4tYWNjZXNzJ1xuaW1wb3J0IHsgZ2V0Q29sbGVjdGlvbkZpZWxkcyB9IGZyb20gJy4vdXRpbHMvdHJhbnNmb3JtLXNjaGVtYS1maWVsZHMtdG8tcGF5bG9hZCdcbmltcG9ydCB7IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnLCBnZXRTY2hlbWFGaWVsZE5hbWUgfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuaW1wb3J0IHsgYXNzZXJ0QWxsU2NoZW1hRmllbGRzIH0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcblxuaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB0eXBlIHsgQnVpbGRDb2xsZWN0aW9uUHJvcHMsIEZpZWxkT3ZlcnJpZGVzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vdHlwZXMnXG5pbXBvcnQgdHlwZSB7IE9yZ2FuaXphdGlvbiB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvZ2VuZXJhdGVkLXR5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRPcmdhbml6YXRpb25zQ29sbGVjdGlvbih7IGluY29taW5nQ29sbGVjdGlvbnMsIHBsdWdpbk9wdGlvbnMsIHJlc29sdmVkU2NoZW1hcyB9OiBCdWlsZENvbGxlY3Rpb25Qcm9wcyk6IENvbGxlY3Rpb25Db25maWcge1xuICBjb25zdCBvcmdhbml6YXRpb25TbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5Lm9yZ2FuaXphdGlvbilcbiAgY29uc3Qgb3JnYW5pemF0aW9uU2NoZW1hID0gcmVzb2x2ZWRTY2hlbWFzW2JhTW9kZWxLZXkub3JnYW5pemF0aW9uXVxuXG4gIGNvbnN0IGV4aXN0aW5nT3JnYW5pemF0aW9uQ29sbGVjdGlvbiA9IGluY29taW5nQ29sbGVjdGlvbnMuZmluZCgoY29sbGVjdGlvbikgPT4gY29sbGVjdGlvbi5zbHVnID09PSBvcmdhbml6YXRpb25TbHVnKSBhc1xuICAgIHwgQ29sbGVjdGlvbkNvbmZpZ1xuICAgIHwgdW5kZWZpbmVkXG5cbiAgY29uc3QgZmllbGRPdmVycmlkZXM6IEZpZWxkT3ZlcnJpZGVzPGtleW9mIE9yZ2FuaXphdGlvbj4gPSB7XG4gICAgbmFtZTogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnVGhlIG5hbWUgb2YgdGhlIG9yZ2FuaXphdGlvbi4nIH1cbiAgICB9KSxcbiAgICBzbHVnOiAoKSA9PiAoe1xuICAgICAgdW5pcXVlOiB0cnVlLFxuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ1RoZSBzbHVnIG9mIHRoZSBvcmdhbml6YXRpb24uJyB9XG4gICAgfSksXG4gICAgbG9nbzogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnVGhlIGxvZ28gb2YgdGhlIG9yZ2FuaXphdGlvbi4nIH1cbiAgICB9KSxcbiAgICBtZXRhZGF0YTogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnQWRkaXRpb25hbCBtZXRhZGF0YSBmb3IgdGhlIG9yZ2FuaXphdGlvbi4nIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgY29sbGVjdGlvbkZpZWxkcyA9IGdldENvbGxlY3Rpb25GaWVsZHMoe1xuICAgIHNjaGVtYTogb3JnYW5pemF0aW9uU2NoZW1hLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmaWVsZE92ZXJyaWRlc1xuICB9KVxuXG4gIGxldCBvcmdhbml6YXRpb25Db2xsZWN0aW9uOiBDb2xsZWN0aW9uQ29uZmlnID0ge1xuICAgIC4uLmV4aXN0aW5nT3JnYW5pemF0aW9uQ29sbGVjdGlvbixcbiAgICBzbHVnOiBvcmdhbml6YXRpb25TbHVnLFxuICAgIGFkbWluOiB7XG4gICAgICBoaWRkZW46IHBsdWdpbk9wdGlvbnMuaGlkZVBsdWdpbkNvbGxlY3Rpb25zID8/IGZhbHNlLFxuICAgICAgdXNlQXNUaXRsZTogZ2V0U2NoZW1hRmllbGROYW1lKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS5vcmdhbml6YXRpb24sICduYW1lJyksXG4gICAgICBkZXNjcmlwdGlvbjogJ09yZ2FuaXphdGlvbnMgYXJlIGdyb3VwcyBvZiB1c2VycyB0aGF0IHNoYXJlIGFjY2VzcyB0byBjZXJ0YWluIHJlc291cmNlcy4nLFxuICAgICAgZ3JvdXA6IHBsdWdpbk9wdGlvbnM/LmNvbGxlY3Rpb25BZG1pbkdyb3VwID8/ICdBdXRoJyxcbiAgICAgIC4uLmV4aXN0aW5nT3JnYW5pemF0aW9uQ29sbGVjdGlvbj8uYWRtaW5cbiAgICB9LFxuICAgIGFjY2Vzczoge1xuICAgICAgLi4uZ2V0QWRtaW5BY2Nlc3MocGx1Z2luT3B0aW9ucyksXG4gICAgICAuLi4oZXhpc3RpbmdPcmdhbml6YXRpb25Db2xsZWN0aW9uPy5hY2Nlc3MgPz8ge30pXG4gICAgfSxcbiAgICBjdXN0b206IHtcbiAgICAgIC4uLihleGlzdGluZ09yZ2FuaXphdGlvbkNvbGxlY3Rpb24/LmN1c3RvbSA/PyB7fSksXG4gICAgICBiZXR0ZXJBdXRoTW9kZWxLZXk6IGJhTW9kZWxLZXkub3JnYW5pemF0aW9uXG4gICAgfSxcbiAgICBmaWVsZHM6IFsuLi4oZXhpc3RpbmdPcmdhbml6YXRpb25Db2xsZWN0aW9uPy5maWVsZHMgPz8gW10pLCAuLi4oY29sbGVjdGlvbkZpZWxkcyA/PyBbXSldXG4gIH1cblxuICBpZiAodHlwZW9mIHBsdWdpbk9wdGlvbnMucGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcz8ub3JnYW5pemF0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIG9yZ2FuaXphdGlvbkNvbGxlY3Rpb24gPSBwbHVnaW5PcHRpb25zLnBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMub3JnYW5pemF0aW9ucyh7XG4gICAgICBjb2xsZWN0aW9uOiBvcmdhbml6YXRpb25Db2xsZWN0aW9uXG4gICAgfSlcbiAgfVxuXG4gIGFzc2VydEFsbFNjaGVtYUZpZWxkcyhvcmdhbml6YXRpb25Db2xsZWN0aW9uLCBvcmdhbml6YXRpb25TY2hlbWEpXG5cbiAgcmV0dXJuIG9yZ2FuaXphdGlvbkNvbGxlY3Rpb25cbn1cbiJdLCJuYW1lcyI6WyJiYU1vZGVsS2V5IiwiZ2V0QWRtaW5BY2Nlc3MiLCJnZXRDb2xsZWN0aW9uRmllbGRzIiwiZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWciLCJnZXRTY2hlbWFGaWVsZE5hbWUiLCJhc3NlcnRBbGxTY2hlbWFGaWVsZHMiLCJidWlsZE9yZ2FuaXphdGlvbnNDb2xsZWN0aW9uIiwiaW5jb21pbmdDb2xsZWN0aW9ucyIsInBsdWdpbk9wdGlvbnMiLCJyZXNvbHZlZFNjaGVtYXMiLCJvcmdhbml6YXRpb25TbHVnIiwib3JnYW5pemF0aW9uIiwib3JnYW5pemF0aW9uU2NoZW1hIiwiZXhpc3RpbmdPcmdhbml6YXRpb25Db2xsZWN0aW9uIiwiZmluZCIsImNvbGxlY3Rpb24iLCJzbHVnIiwiZmllbGRPdmVycmlkZXMiLCJuYW1lIiwiYWRtaW4iLCJkZXNjcmlwdGlvbiIsInVuaXF1ZSIsImluZGV4IiwibG9nbyIsIm1ldGFkYXRhIiwiY29sbGVjdGlvbkZpZWxkcyIsInNjaGVtYSIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwib3JnYW5pemF0aW9uQ29sbGVjdGlvbiIsImhpZGRlbiIsImhpZGVQbHVnaW5Db2xsZWN0aW9ucyIsInVzZUFzVGl0bGUiLCJncm91cCIsImNvbGxlY3Rpb25BZG1pbkdyb3VwIiwiYWNjZXNzIiwiY3VzdG9tIiwiYmV0dGVyQXV0aE1vZGVsS2V5IiwiZmllbGRzIiwicGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcyIsIm9yZ2FuaXphdGlvbnMiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFVBQVUsUUFBUSxrQkFBaUI7QUFDNUMsU0FBU0MsY0FBYyxRQUFRLGlDQUFnQztBQUMvRCxTQUFTQyxtQkFBbUIsUUFBUSw2Q0FBNEM7QUFDaEYsU0FBU0MsdUJBQXVCLEVBQUVDLGtCQUFrQixRQUFRLDRCQUEyQjtBQUN2RixTQUFTQyxxQkFBcUIsUUFBUSw0QkFBMkI7QUFNakUsT0FBTyxTQUFTQyw2QkFBNkIsRUFBRUMsbUJBQW1CLEVBQUVDLGFBQWEsRUFBRUMsZUFBZSxFQUF3QjtJQUN4SCxNQUFNQyxtQkFBbUJQLHdCQUF3Qk0saUJBQWlCVCxXQUFXVyxZQUFZO0lBQ3pGLE1BQU1DLHFCQUFxQkgsZUFBZSxDQUFDVCxXQUFXVyxZQUFZLENBQUM7SUFFbkUsTUFBTUUsaUNBQWlDTixvQkFBb0JPLElBQUksQ0FBQyxDQUFDQyxhQUFlQSxXQUFXQyxJQUFJLEtBQUtOO0lBSXBHLE1BQU1PLGlCQUFxRDtRQUN6REMsTUFBTSxJQUFPLENBQUE7Z0JBQ1hDLE9BQU87b0JBQUVDLGFBQWE7Z0JBQWdDO1lBQ3hELENBQUE7UUFDQUosTUFBTSxJQUFPLENBQUE7Z0JBQ1hLLFFBQVE7Z0JBQ1JDLE9BQU87Z0JBQ1BILE9BQU87b0JBQUVDLGFBQWE7Z0JBQWdDO1lBQ3hELENBQUE7UUFDQUcsTUFBTSxJQUFPLENBQUE7Z0JBQ1hKLE9BQU87b0JBQUVDLGFBQWE7Z0JBQWdDO1lBQ3hELENBQUE7UUFDQUksVUFBVSxJQUFPLENBQUE7Z0JBQ2ZMLE9BQU87b0JBQUVDLGFBQWE7Z0JBQTRDO1lBQ3BFLENBQUE7SUFDRjtJQUVBLE1BQU1LLG1CQUFtQnZCLG9CQUFvQjtRQUMzQ3dCLFFBQVFkO1FBQ1JlLHNCQUFzQlY7SUFDeEI7SUFFQSxJQUFJVyx5QkFBMkM7UUFDN0MsR0FBR2YsOEJBQThCO1FBQ2pDRyxNQUFNTjtRQUNOUyxPQUFPO1lBQ0xVLFFBQVFyQixjQUFjc0IscUJBQXFCLElBQUk7WUFDL0NDLFlBQVkzQixtQkFBbUJLLGlCQUFpQlQsV0FBV1csWUFBWSxFQUFFO1lBQ3pFUyxhQUFhO1lBQ2JZLE9BQU94QixlQUFleUIsd0JBQXdCO1lBQzlDLEdBQUdwQixnQ0FBZ0NNLEtBQUs7UUFDMUM7UUFDQWUsUUFBUTtZQUNOLEdBQUdqQyxlQUFlTyxjQUFjO1lBQ2hDLEdBQUlLLGdDQUFnQ3FCLFVBQVUsQ0FBQyxDQUFDO1FBQ2xEO1FBQ0FDLFFBQVE7WUFDTixHQUFJdEIsZ0NBQWdDc0IsVUFBVSxDQUFDLENBQUM7WUFDaERDLG9CQUFvQnBDLFdBQVdXLFlBQVk7UUFDN0M7UUFDQTBCLFFBQVE7ZUFBS3hCLGdDQUFnQ3dCLFVBQVUsRUFBRTtlQUFPWixvQkFBb0IsRUFBRTtTQUFFO0lBQzFGO0lBRUEsSUFBSSxPQUFPakIsY0FBYzhCLHlCQUF5QixFQUFFQyxrQkFBa0IsWUFBWTtRQUNoRlgseUJBQXlCcEIsY0FBYzhCLHlCQUF5QixDQUFDQyxhQUFhLENBQUM7WUFDN0V4QixZQUFZYTtRQUNkO0lBQ0Y7SUFFQXZCLHNCQUFzQnVCLHdCQUF3QmhCO0lBRTlDLE9BQU9nQjtBQUNUIn0=