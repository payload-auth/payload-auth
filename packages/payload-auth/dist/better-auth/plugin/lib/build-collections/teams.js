import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { assertAllSchemaFields, getSchemaCollectionSlug, getSchemaFieldName } from "./utils/collection-schema";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
export function buildTeamsCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const teamSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.team);
    const teamSchema = resolvedSchemas[baModelKey.team];
    const existingTeamCollection = incomingCollections.find((collection)=>collection.slug === teamSlug);
    const fieldOverrides = {
        name: ()=>({
                admin: {
                    description: 'The name of the team.'
                }
            }),
        organizationId: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The organization that the team belongs to.'
                }
            })
    };
    const teamFieldRules = [
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
        schema: teamSchema,
        fieldRules: teamFieldRules,
        additionalProperties: fieldOverrides
    });
    let teamCollection = {
        ...existingTeamCollection,
        slug: teamSlug,
        admin: {
            hidden: pluginOptions.hidePluginCollections ?? false,
            useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.team, 'name'),
            description: 'Teams are groups of users that share access to certain resources.',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingTeamCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingTeamCollection?.access ?? {}
        },
        custom: {
            ...existingTeamCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.team
        },
        fields: [
            ...existingTeamCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.pluginCollectionOverrides?.teams === 'function') {
        teamCollection = pluginOptions.pluginCollectionOverrides.teams({
            collection: teamCollection
        });
    }
    assertAllSchemaFields(teamCollection, teamSchema);
    return teamCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3RlYW1zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgVGVhbSB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvZ2VuZXJhdGVkLXR5cGVzJ1xuaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB0eXBlIHsgQnVpbGRDb2xsZWN0aW9uUHJvcHMsIEZpZWxkT3ZlcnJpZGVzIH0gZnJvbSAnLi4vLi4vdHlwZXMnXG5pbXBvcnQgdHlwZSB7IEZpZWxkUnVsZSB9IGZyb20gJy4vdXRpbHMvbW9kZWwtZmllbGQtdHJhbnNmb3JtYXRpb25zJ1xuXG5pbXBvcnQgeyBiYU1vZGVsS2V5IH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgZ2V0QWRtaW5BY2Nlc3MgfSBmcm9tICcuLi8uLi9oZWxwZXJzL2dldC1hZG1pbi1hY2Nlc3MnXG5pbXBvcnQgeyBhc3NlcnRBbGxTY2hlbWFGaWVsZHMsIGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnLCBnZXRTY2hlbWFGaWVsZE5hbWUgfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuaW1wb3J0IHsgZ2V0Q29sbGVjdGlvbkZpZWxkcyB9IGZyb20gJy4vdXRpbHMvdHJhbnNmb3JtLXNjaGVtYS1maWVsZHMtdG8tcGF5bG9hZCdcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVGVhbXNDb2xsZWN0aW9uKHsgaW5jb21pbmdDb2xsZWN0aW9ucywgcGx1Z2luT3B0aW9ucywgcmVzb2x2ZWRTY2hlbWFzIH06IEJ1aWxkQ29sbGVjdGlvblByb3BzKTogQ29sbGVjdGlvbkNvbmZpZyB7XG4gIGNvbnN0IHRlYW1TbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LnRlYW0pXG4gIGNvbnN0IHRlYW1TY2hlbWEgPSByZXNvbHZlZFNjaGVtYXNbYmFNb2RlbEtleS50ZWFtXVxuICBjb25zdCBleGlzdGluZ1RlYW1Db2xsZWN0aW9uID0gaW5jb21pbmdDb2xsZWN0aW9ucy5maW5kKChjb2xsZWN0aW9uKSA9PiBjb2xsZWN0aW9uLnNsdWcgPT09IHRlYW1TbHVnKSBhcyBDb2xsZWN0aW9uQ29uZmlnIHwgdW5kZWZpbmVkXG5cbiAgY29uc3QgZmllbGRPdmVycmlkZXM6IEZpZWxkT3ZlcnJpZGVzPGtleW9mIFRlYW0+ID0ge1xuICAgIG5hbWU6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ1RoZSBuYW1lIG9mIHRoZSB0ZWFtLicgfVxuICAgIH0pLFxuICAgIG9yZ2FuaXphdGlvbklkOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHtcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIG9yZ2FuaXphdGlvbiB0aGF0IHRoZSB0ZWFtIGJlbG9uZ3MgdG8uJ1xuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBjb25zdCB0ZWFtRmllbGRSdWxlczogRmllbGRSdWxlW10gPSBbXG4gICAge1xuICAgICAgY29uZGl0aW9uOiAoZmllbGQpID0+IGZpZWxkLnR5cGUgPT09ICdkYXRlJyxcbiAgICAgIHRyYW5zZm9ybTogKGZpZWxkKSA9PiAoe1xuICAgICAgICAuLi5maWVsZCxcbiAgICAgICAgc2F2ZVRvSldUOiBmYWxzZSxcbiAgICAgICAgYWRtaW46IHtcbiAgICAgICAgICBkaXNhYmxlQnVsa0VkaXQ6IHRydWUsXG4gICAgICAgICAgaGlkZGVuOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgICBsYWJlbDogKHsgdCB9OiBhbnkpID0+IHQoJ2dlbmVyYWw6dXBkYXRlZEF0JylcbiAgICAgIH0pXG4gICAgfVxuICBdXG5cbiAgY29uc3QgY29sbGVjdGlvbkZpZWxkcyA9IGdldENvbGxlY3Rpb25GaWVsZHMoe1xuICAgIHNjaGVtYTogdGVhbVNjaGVtYSxcbiAgICBmaWVsZFJ1bGVzOiB0ZWFtRmllbGRSdWxlcyxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmllbGRPdmVycmlkZXNcbiAgfSlcblxuICBsZXQgdGVhbUNvbGxlY3Rpb246IENvbGxlY3Rpb25Db25maWcgPSB7XG4gICAgLi4uZXhpc3RpbmdUZWFtQ29sbGVjdGlvbixcbiAgICBzbHVnOiB0ZWFtU2x1ZyxcbiAgICBhZG1pbjoge1xuICAgICAgaGlkZGVuOiBwbHVnaW5PcHRpb25zLmhpZGVQbHVnaW5Db2xsZWN0aW9ucyA/PyBmYWxzZSxcbiAgICAgIHVzZUFzVGl0bGU6IGdldFNjaGVtYUZpZWxkTmFtZShyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkudGVhbSwgJ25hbWUnKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGVhbXMgYXJlIGdyb3VwcyBvZiB1c2VycyB0aGF0IHNoYXJlIGFjY2VzcyB0byBjZXJ0YWluIHJlc291cmNlcy4nLFxuICAgICAgZ3JvdXA6IHBsdWdpbk9wdGlvbnM/LmNvbGxlY3Rpb25BZG1pbkdyb3VwID8/ICdBdXRoJyxcbiAgICAgIC4uLmV4aXN0aW5nVGVhbUNvbGxlY3Rpb24/LmFkbWluXG4gICAgfSxcbiAgICBhY2Nlc3M6IHtcbiAgICAgIC4uLmdldEFkbWluQWNjZXNzKHBsdWdpbk9wdGlvbnMpLFxuICAgICAgLi4uKGV4aXN0aW5nVGVhbUNvbGxlY3Rpb24/LmFjY2VzcyA/PyB7fSlcbiAgICB9LFxuICAgIGN1c3RvbToge1xuICAgICAgLi4uKGV4aXN0aW5nVGVhbUNvbGxlY3Rpb24/LmN1c3RvbSA/PyB7fSksXG4gICAgICBiZXR0ZXJBdXRoTW9kZWxLZXk6IGJhTW9kZWxLZXkudGVhbVxuICAgIH0sXG4gICAgZmllbGRzOiBbLi4uKGV4aXN0aW5nVGVhbUNvbGxlY3Rpb24/LmZpZWxkcyA/PyBbXSksIC4uLihjb2xsZWN0aW9uRmllbGRzID8/IFtdKV1cbiAgfVxuXG4gIGlmICh0eXBlb2YgcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzPy50ZWFtcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRlYW1Db2xsZWN0aW9uID0gcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzLnRlYW1zKHtcbiAgICAgIGNvbGxlY3Rpb246IHRlYW1Db2xsZWN0aW9uXG4gICAgfSlcbiAgfVxuXG4gIGFzc2VydEFsbFNjaGVtYUZpZWxkcyh0ZWFtQ29sbGVjdGlvbiwgdGVhbVNjaGVtYSlcblxuICByZXR1cm4gdGVhbUNvbGxlY3Rpb25cbn1cbiJdLCJuYW1lcyI6WyJiYU1vZGVsS2V5IiwiZ2V0QWRtaW5BY2Nlc3MiLCJhc3NlcnRBbGxTY2hlbWFGaWVsZHMiLCJnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyIsImdldFNjaGVtYUZpZWxkTmFtZSIsImdldENvbGxlY3Rpb25GaWVsZHMiLCJidWlsZFRlYW1zQ29sbGVjdGlvbiIsImluY29taW5nQ29sbGVjdGlvbnMiLCJwbHVnaW5PcHRpb25zIiwicmVzb2x2ZWRTY2hlbWFzIiwidGVhbVNsdWciLCJ0ZWFtIiwidGVhbVNjaGVtYSIsImV4aXN0aW5nVGVhbUNvbGxlY3Rpb24iLCJmaW5kIiwiY29sbGVjdGlvbiIsInNsdWciLCJmaWVsZE92ZXJyaWRlcyIsIm5hbWUiLCJhZG1pbiIsImRlc2NyaXB0aW9uIiwib3JnYW5pemF0aW9uSWQiLCJyZWFkT25seSIsInRlYW1GaWVsZFJ1bGVzIiwiY29uZGl0aW9uIiwiZmllbGQiLCJ0eXBlIiwidHJhbnNmb3JtIiwic2F2ZVRvSldUIiwiZGlzYWJsZUJ1bGtFZGl0IiwiaGlkZGVuIiwiaW5kZXgiLCJsYWJlbCIsInQiLCJjb2xsZWN0aW9uRmllbGRzIiwic2NoZW1hIiwiZmllbGRSdWxlcyIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwidGVhbUNvbGxlY3Rpb24iLCJoaWRlUGx1Z2luQ29sbGVjdGlvbnMiLCJ1c2VBc1RpdGxlIiwiZ3JvdXAiLCJjb2xsZWN0aW9uQWRtaW5Hcm91cCIsImFjY2VzcyIsImN1c3RvbSIsImJldHRlckF1dGhNb2RlbEtleSIsImZpZWxkcyIsInBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMiLCJ0ZWFtcyJdLCJtYXBwaW5ncyI6IkFBS0EsU0FBU0EsVUFBVSxRQUFRLGtCQUFpQjtBQUM1QyxTQUFTQyxjQUFjLFFBQVEsaUNBQWdDO0FBQy9ELFNBQVNDLHFCQUFxQixFQUFFQyx1QkFBdUIsRUFBRUMsa0JBQWtCLFFBQVEsNEJBQTJCO0FBQzlHLFNBQVNDLG1CQUFtQixRQUFRLDZDQUE0QztBQUVoRixPQUFPLFNBQVNDLHFCQUFxQixFQUFFQyxtQkFBbUIsRUFBRUMsYUFBYSxFQUFFQyxlQUFlLEVBQXdCO0lBQ2hILE1BQU1DLFdBQVdQLHdCQUF3Qk0saUJBQWlCVCxXQUFXVyxJQUFJO0lBQ3pFLE1BQU1DLGFBQWFILGVBQWUsQ0FBQ1QsV0FBV1csSUFBSSxDQUFDO0lBQ25ELE1BQU1FLHlCQUF5Qk4sb0JBQW9CTyxJQUFJLENBQUMsQ0FBQ0MsYUFBZUEsV0FBV0MsSUFBSSxLQUFLTjtJQUU1RixNQUFNTyxpQkFBNkM7UUFDakRDLE1BQU0sSUFBTyxDQUFBO2dCQUNYQyxPQUFPO29CQUFFQyxhQUFhO2dCQUF3QjtZQUNoRCxDQUFBO1FBQ0FDLGdCQUFnQixJQUFPLENBQUE7Z0JBQ3JCRixPQUFPO29CQUNMRyxVQUFVO29CQUNWRixhQUFhO2dCQUNmO1lBQ0YsQ0FBQTtJQUNGO0lBRUEsTUFBTUcsaUJBQThCO1FBQ2xDO1lBQ0VDLFdBQVcsQ0FBQ0MsUUFBVUEsTUFBTUMsSUFBSSxLQUFLO1lBQ3JDQyxXQUFXLENBQUNGLFFBQVcsQ0FBQTtvQkFDckIsR0FBR0EsS0FBSztvQkFDUkcsV0FBVztvQkFDWFQsT0FBTzt3QkFDTFUsaUJBQWlCO3dCQUNqQkMsUUFBUTtvQkFDVjtvQkFDQUMsT0FBTztvQkFDUEMsT0FBTyxDQUFDLEVBQUVDLENBQUMsRUFBTyxHQUFLQSxFQUFFO2dCQUMzQixDQUFBO1FBQ0Y7S0FDRDtJQUVELE1BQU1DLG1CQUFtQjdCLG9CQUFvQjtRQUMzQzhCLFFBQVF2QjtRQUNSd0IsWUFBWWI7UUFDWmMsc0JBQXNCcEI7SUFDeEI7SUFFQSxJQUFJcUIsaUJBQW1DO1FBQ3JDLEdBQUd6QixzQkFBc0I7UUFDekJHLE1BQU1OO1FBQ05TLE9BQU87WUFDTFcsUUFBUXRCLGNBQWMrQixxQkFBcUIsSUFBSTtZQUMvQ0MsWUFBWXBDLG1CQUFtQkssaUJBQWlCVCxXQUFXVyxJQUFJLEVBQUU7WUFDakVTLGFBQWE7WUFDYnFCLE9BQU9qQyxlQUFla0Msd0JBQXdCO1lBQzlDLEdBQUc3Qix3QkFBd0JNLEtBQUs7UUFDbEM7UUFDQXdCLFFBQVE7WUFDTixHQUFHMUMsZUFBZU8sY0FBYztZQUNoQyxHQUFJSyx3QkFBd0I4QixVQUFVLENBQUMsQ0FBQztRQUMxQztRQUNBQyxRQUFRO1lBQ04sR0FBSS9CLHdCQUF3QitCLFVBQVUsQ0FBQyxDQUFDO1lBQ3hDQyxvQkFBb0I3QyxXQUFXVyxJQUFJO1FBQ3JDO1FBQ0FtQyxRQUFRO2VBQUtqQyx3QkFBd0JpQyxVQUFVLEVBQUU7ZUFBT1osb0JBQW9CLEVBQUU7U0FBRTtJQUNsRjtJQUVBLElBQUksT0FBTzFCLGNBQWN1Qyx5QkFBeUIsRUFBRUMsVUFBVSxZQUFZO1FBQ3hFVixpQkFBaUI5QixjQUFjdUMseUJBQXlCLENBQUNDLEtBQUssQ0FBQztZQUM3RGpDLFlBQVl1QjtRQUNkO0lBQ0Y7SUFFQXBDLHNCQUFzQm9DLGdCQUFnQjFCO0lBRXRDLE9BQU8wQjtBQUNUIn0=