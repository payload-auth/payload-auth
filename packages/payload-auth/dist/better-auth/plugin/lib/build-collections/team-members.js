import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { getSchemaCollectionSlug, getSchemaFieldName, assertAllSchemaFields } from "./utils/collection-schema";
export function buildTeamMembersCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const teamMemberSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.teamMember);
    const teamMemberSchema = resolvedSchemas[baModelKey.teamMember];
    const existingTeamMemberCollection = incomingCollections.find((collection)=>collection.slug === teamMemberSlug);
    const fieldOverrides = {
        teamId: ()=>({
                name: 'team',
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The team that the membership belongs to.'
                }
            }),
        userId: ()=>({
                name: 'user',
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The user that is a member of the team.'
                }
            })
    };
    const collectionFields = getCollectionFields({
        schema: teamMemberSchema,
        additionalProperties: fieldOverrides
    });
    let teamMemberCollection = {
        ...existingTeamMemberCollection,
        slug: teamMemberSlug,
        admin: {
            hidden: pluginOptions.hidePluginCollections ?? false,
            useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.teamMember, 'teamId'),
            description: 'Team members of an organization team.',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingTeamMemberCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingTeamMemberCollection?.access ?? {}
        },
        custom: {
            ...existingTeamMemberCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.teamMember
        },
        fields: [
            ...existingTeamMemberCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    assertAllSchemaFields(teamMemberCollection, teamMemberSchema);
    return teamMemberCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3RlYW0tbWVtYmVycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiYU1vZGVsS2V5IH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgZ2V0QWRtaW5BY2Nlc3MgfSBmcm9tICcuLi8uLi9oZWxwZXJzL2dldC1hZG1pbi1hY2Nlc3MnXG5pbXBvcnQgeyBnZXRDb2xsZWN0aW9uRmllbGRzIH0gZnJvbSAnLi91dGlscy90cmFuc2Zvcm0tc2NoZW1hLWZpZWxkcy10by1wYXlsb2FkJ1xuaW1wb3J0IHsgZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcsIGdldFNjaGVtYUZpZWxkTmFtZSwgYXNzZXJ0QWxsU2NoZW1hRmllbGRzIH0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcblxuaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB0eXBlIHsgQnVpbGRDb2xsZWN0aW9uUHJvcHMsIEZpZWxkT3ZlcnJpZGVzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vdHlwZXMnXG5pbXBvcnQgdHlwZSB7IFRlYW1NZW1iZXIgfSBmcm9tICdAL2JldHRlci1hdXRoL2dlbmVyYXRlZC10eXBlcydcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVGVhbU1lbWJlcnNDb2xsZWN0aW9uKHtcbiAgaW5jb21pbmdDb2xsZWN0aW9ucyxcbiAgcGx1Z2luT3B0aW9ucyxcbiAgcmVzb2x2ZWRTY2hlbWFzXG59OiBCdWlsZENvbGxlY3Rpb25Qcm9wcyk6IENvbGxlY3Rpb25Db25maWcge1xuICBjb25zdCB0ZWFtTWVtYmVyU2x1ZyA9IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS50ZWFtTWVtYmVyKVxuICBjb25zdCB0ZWFtTWVtYmVyU2NoZW1hID0gcmVzb2x2ZWRTY2hlbWFzW2JhTW9kZWxLZXkudGVhbU1lbWJlcl1cblxuICBjb25zdCBleGlzdGluZ1RlYW1NZW1iZXJDb2xsZWN0aW9uID0gaW5jb21pbmdDb2xsZWN0aW9ucy5maW5kKChjb2xsZWN0aW9uKSA9PiBjb2xsZWN0aW9uLnNsdWcgPT09IHRlYW1NZW1iZXJTbHVnKSBhc1xuICAgIHwgQ29sbGVjdGlvbkNvbmZpZ1xuICAgIHwgdW5kZWZpbmVkXG5cbiAgY29uc3QgZmllbGRPdmVycmlkZXM6IEZpZWxkT3ZlcnJpZGVzPGtleW9mIFRlYW1NZW1iZXI+ID0ge1xuICAgIHRlYW1JZDogKCkgPT4gKHtcbiAgICAgIG5hbWU6ICd0ZWFtJyxcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIHRlYW0gdGhhdCB0aGUgbWVtYmVyc2hpcCBiZWxvbmdzIHRvLicgfVxuICAgIH0pLFxuICAgIHVzZXJJZDogKCkgPT4gKHtcbiAgICAgIG5hbWU6ICd1c2VyJyxcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIHVzZXIgdGhhdCBpcyBhIG1lbWJlciBvZiB0aGUgdGVhbS4nIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgY29sbGVjdGlvbkZpZWxkcyA9IGdldENvbGxlY3Rpb25GaWVsZHMoe1xuICAgIHNjaGVtYTogdGVhbU1lbWJlclNjaGVtYSxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmllbGRPdmVycmlkZXNcbiAgfSlcblxuICBsZXQgdGVhbU1lbWJlckNvbGxlY3Rpb246IENvbGxlY3Rpb25Db25maWcgPSB7XG4gICAgLi4uZXhpc3RpbmdUZWFtTWVtYmVyQ29sbGVjdGlvbixcbiAgICBzbHVnOiB0ZWFtTWVtYmVyU2x1ZyxcbiAgICBhZG1pbjoge1xuICAgICAgaGlkZGVuOiBwbHVnaW5PcHRpb25zLmhpZGVQbHVnaW5Db2xsZWN0aW9ucyA/PyBmYWxzZSxcbiAgICAgIHVzZUFzVGl0bGU6IGdldFNjaGVtYUZpZWxkTmFtZShyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkudGVhbU1lbWJlciwgJ3RlYW1JZCcpLFxuICAgICAgZGVzY3JpcHRpb246ICdUZWFtIG1lbWJlcnMgb2YgYW4gb3JnYW5pemF0aW9uIHRlYW0uJyxcbiAgICAgIGdyb3VwOiBwbHVnaW5PcHRpb25zPy5jb2xsZWN0aW9uQWRtaW5Hcm91cCA/PyAnQXV0aCcsXG4gICAgICAuLi5leGlzdGluZ1RlYW1NZW1iZXJDb2xsZWN0aW9uPy5hZG1pblxuICAgIH0sXG4gICAgYWNjZXNzOiB7XG4gICAgICAuLi5nZXRBZG1pbkFjY2VzcyhwbHVnaW5PcHRpb25zKSxcbiAgICAgIC4uLihleGlzdGluZ1RlYW1NZW1iZXJDb2xsZWN0aW9uPy5hY2Nlc3MgPz8ge30pXG4gICAgfSxcbiAgICBjdXN0b206IHtcbiAgICAgIC4uLihleGlzdGluZ1RlYW1NZW1iZXJDb2xsZWN0aW9uPy5jdXN0b20gPz8ge30pLFxuICAgICAgYmV0dGVyQXV0aE1vZGVsS2V5OiBiYU1vZGVsS2V5LnRlYW1NZW1iZXJcbiAgICB9LFxuICAgIGZpZWxkczogWy4uLihleGlzdGluZ1RlYW1NZW1iZXJDb2xsZWN0aW9uPy5maWVsZHMgPz8gW10pLCAuLi4oY29sbGVjdGlvbkZpZWxkcyA/PyBbXSldXG4gIH1cblxuICBhc3NlcnRBbGxTY2hlbWFGaWVsZHModGVhbU1lbWJlckNvbGxlY3Rpb24sIHRlYW1NZW1iZXJTY2hlbWEpXG5cbiAgcmV0dXJuIHRlYW1NZW1iZXJDb2xsZWN0aW9uXG59XG4iXSwibmFtZXMiOlsiYmFNb2RlbEtleSIsImdldEFkbWluQWNjZXNzIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsImdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIiwiZ2V0U2NoZW1hRmllbGROYW1lIiwiYXNzZXJ0QWxsU2NoZW1hRmllbGRzIiwiYnVpbGRUZWFtTWVtYmVyc0NvbGxlY3Rpb24iLCJpbmNvbWluZ0NvbGxlY3Rpb25zIiwicGx1Z2luT3B0aW9ucyIsInJlc29sdmVkU2NoZW1hcyIsInRlYW1NZW1iZXJTbHVnIiwidGVhbU1lbWJlciIsInRlYW1NZW1iZXJTY2hlbWEiLCJleGlzdGluZ1RlYW1NZW1iZXJDb2xsZWN0aW9uIiwiZmluZCIsImNvbGxlY3Rpb24iLCJzbHVnIiwiZmllbGRPdmVycmlkZXMiLCJ0ZWFtSWQiLCJuYW1lIiwiaW5kZXgiLCJhZG1pbiIsInJlYWRPbmx5IiwiZGVzY3JpcHRpb24iLCJ1c2VySWQiLCJjb2xsZWN0aW9uRmllbGRzIiwic2NoZW1hIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJ0ZWFtTWVtYmVyQ29sbGVjdGlvbiIsImhpZGRlbiIsImhpZGVQbHVnaW5Db2xsZWN0aW9ucyIsInVzZUFzVGl0bGUiLCJncm91cCIsImNvbGxlY3Rpb25BZG1pbkdyb3VwIiwiYWNjZXNzIiwiY3VzdG9tIiwiYmV0dGVyQXV0aE1vZGVsS2V5IiwiZmllbGRzIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxVQUFVLFFBQVEsa0JBQWlCO0FBQzVDLFNBQVNDLGNBQWMsUUFBUSxpQ0FBZ0M7QUFDL0QsU0FBU0MsbUJBQW1CLFFBQVEsNkNBQTRDO0FBQ2hGLFNBQVNDLHVCQUF1QixFQUFFQyxrQkFBa0IsRUFBRUMscUJBQXFCLFFBQVEsNEJBQTJCO0FBTTlHLE9BQU8sU0FBU0MsMkJBQTJCLEVBQ3pDQyxtQkFBbUIsRUFDbkJDLGFBQWEsRUFDYkMsZUFBZSxFQUNNO0lBQ3JCLE1BQU1DLGlCQUFpQlAsd0JBQXdCTSxpQkFBaUJULFdBQVdXLFVBQVU7SUFDckYsTUFBTUMsbUJBQW1CSCxlQUFlLENBQUNULFdBQVdXLFVBQVUsQ0FBQztJQUUvRCxNQUFNRSwrQkFBK0JOLG9CQUFvQk8sSUFBSSxDQUFDLENBQUNDLGFBQWVBLFdBQVdDLElBQUksS0FBS047SUFJbEcsTUFBTU8saUJBQW1EO1FBQ3ZEQyxRQUFRLElBQU8sQ0FBQTtnQkFDYkMsTUFBTTtnQkFDTkMsT0FBTztnQkFDUEMsT0FBTztvQkFBRUMsVUFBVTtvQkFBTUMsYUFBYTtnQkFBMkM7WUFDbkYsQ0FBQTtRQUNBQyxRQUFRLElBQU8sQ0FBQTtnQkFDYkwsTUFBTTtnQkFDTkMsT0FBTztnQkFDUEMsT0FBTztvQkFBRUMsVUFBVTtvQkFBTUMsYUFBYTtnQkFBeUM7WUFDakYsQ0FBQTtJQUNGO0lBRUEsTUFBTUUsbUJBQW1CdkIsb0JBQW9CO1FBQzNDd0IsUUFBUWQ7UUFDUmUsc0JBQXNCVjtJQUN4QjtJQUVBLElBQUlXLHVCQUF5QztRQUMzQyxHQUFHZiw0QkFBNEI7UUFDL0JHLE1BQU1OO1FBQ05XLE9BQU87WUFDTFEsUUFBUXJCLGNBQWNzQixxQkFBcUIsSUFBSTtZQUMvQ0MsWUFBWTNCLG1CQUFtQkssaUJBQWlCVCxXQUFXVyxVQUFVLEVBQUU7WUFDdkVZLGFBQWE7WUFDYlMsT0FBT3hCLGVBQWV5Qix3QkFBd0I7WUFDOUMsR0FBR3BCLDhCQUE4QlEsS0FBSztRQUN4QztRQUNBYSxRQUFRO1lBQ04sR0FBR2pDLGVBQWVPLGNBQWM7WUFDaEMsR0FBSUssOEJBQThCcUIsVUFBVSxDQUFDLENBQUM7UUFDaEQ7UUFDQUMsUUFBUTtZQUNOLEdBQUl0Qiw4QkFBOEJzQixVQUFVLENBQUMsQ0FBQztZQUM5Q0Msb0JBQW9CcEMsV0FBV1csVUFBVTtRQUMzQztRQUNBMEIsUUFBUTtlQUFLeEIsOEJBQThCd0IsVUFBVSxFQUFFO2VBQU9aLG9CQUFvQixFQUFFO1NBQUU7SUFDeEY7SUFFQXBCLHNCQUFzQnVCLHNCQUFzQmhCO0lBRTVDLE9BQU9nQjtBQUNUIn0=