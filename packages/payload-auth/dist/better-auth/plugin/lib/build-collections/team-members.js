import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { getSchemaCollectionSlug, getSchemaFieldName } from "./utils/collection-schema";
import { assertAllSchemaFields } from "./utils/collection-schema";
export function buildTeamMembersCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const teamMemberSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.teamMember);
    const teamMemberSchema = resolvedSchemas[baModelKey.teamMember];
    const existingTeamMemberCollection = incomingCollections.find((collection)=>collection.slug === teamMemberSlug);
    const fieldOverrides = {
        teamId: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The team that the user belongs to.'
                }
            }),
        userId: ()=>({
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
            description: 'Members of a team.',
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
    if (typeof pluginOptions.pluginCollectionOverrides?.teamMembers === 'function') {
        teamMemberCollection = pluginOptions.pluginCollectionOverrides.teamMembers({
            collection: teamMemberCollection
        });
    }
    assertAllSchemaFields(teamMemberCollection, teamMemberSchema);
    return teamMemberCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3RlYW0tbWVtYmVycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiYU1vZGVsRmllbGRLZXlzVG9GaWVsZE5hbWVzLCBiYU1vZGVsS2V5IH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgZ2V0QWRtaW5BY2Nlc3MgfSBmcm9tICcuLi8uLi9oZWxwZXJzL2dldC1hZG1pbi1hY2Nlc3MnXG5pbXBvcnQgeyBnZXRDb2xsZWN0aW9uRmllbGRzIH0gZnJvbSAnLi91dGlscy90cmFuc2Zvcm0tc2NoZW1hLWZpZWxkcy10by1wYXlsb2FkJ1xuaW1wb3J0IHsgZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcsIGdldFNjaGVtYUZpZWxkTmFtZSB9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbi1zY2hlbWEnXG5pbXBvcnQgeyBhc3NlcnRBbGxTY2hlbWFGaWVsZHMgfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuXG5pbXBvcnQgdHlwZSB7IENvbGxlY3Rpb25Db25maWcgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHR5cGUgeyBCdWlsZENvbGxlY3Rpb25Qcm9wcywgRmllbGRPdmVycmlkZXMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi90eXBlcydcbmltcG9ydCB0eXBlIHsgVGVhbU1lbWJlciB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvZ2VuZXJhdGVkLXR5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRUZWFtTWVtYmVyc0NvbGxlY3Rpb24oeyBpbmNvbWluZ0NvbGxlY3Rpb25zLCBwbHVnaW5PcHRpb25zLCByZXNvbHZlZFNjaGVtYXMgfTogQnVpbGRDb2xsZWN0aW9uUHJvcHMpOiBDb2xsZWN0aW9uQ29uZmlnIHtcbiAgY29uc3QgdGVhbU1lbWJlclNsdWcgPSBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyhyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkudGVhbU1lbWJlcilcbiAgY29uc3QgdGVhbU1lbWJlclNjaGVtYSA9IHJlc29sdmVkU2NoZW1hc1tiYU1vZGVsS2V5LnRlYW1NZW1iZXJdXG5cbiAgY29uc3QgZXhpc3RpbmdUZWFtTWVtYmVyQ29sbGVjdGlvbiA9IGluY29taW5nQ29sbGVjdGlvbnMuZmluZCgoY29sbGVjdGlvbikgPT4gY29sbGVjdGlvbi5zbHVnID09PSB0ZWFtTWVtYmVyU2x1ZykgYXMgQ29sbGVjdGlvbkNvbmZpZyB8IHVuZGVmaW5lZFxuXG4gIGNvbnN0IGZpZWxkT3ZlcnJpZGVzOiBGaWVsZE92ZXJyaWRlczxrZXlvZiBUZWFtTWVtYmVyPiA9IHtcbiAgICB0ZWFtSWQ6ICgpID0+ICh7XG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSB0ZWFtIHRoYXQgdGhlIHVzZXIgYmVsb25ncyB0by4nIH1cbiAgICB9KSxcbiAgICB1c2VySWQ6ICgpID0+ICh7XG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSB1c2VyIHRoYXQgaXMgYSBtZW1iZXIgb2YgdGhlIHRlYW0uJyB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGNvbGxlY3Rpb25GaWVsZHMgPSBnZXRDb2xsZWN0aW9uRmllbGRzKHtcbiAgICBzY2hlbWE6IHRlYW1NZW1iZXJTY2hlbWEsXG4gICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZpZWxkT3ZlcnJpZGVzXG4gIH0pXG5cbiAgbGV0IHRlYW1NZW1iZXJDb2xsZWN0aW9uOiBDb2xsZWN0aW9uQ29uZmlnID0ge1xuICAgIC4uLmV4aXN0aW5nVGVhbU1lbWJlckNvbGxlY3Rpb24sXG4gICAgc2x1ZzogdGVhbU1lbWJlclNsdWcsXG4gICAgYWRtaW46IHtcbiAgICAgIGhpZGRlbjogcGx1Z2luT3B0aW9ucy5oaWRlUGx1Z2luQ29sbGVjdGlvbnMgPz8gZmFsc2UsXG4gICAgICB1c2VBc1RpdGxlOiBnZXRTY2hlbWFGaWVsZE5hbWUocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LnRlYW1NZW1iZXIsICd0ZWFtSWQnKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTWVtYmVycyBvZiBhIHRlYW0uJyxcbiAgICAgIGdyb3VwOiBwbHVnaW5PcHRpb25zPy5jb2xsZWN0aW9uQWRtaW5Hcm91cCA/PyAnQXV0aCcsXG4gICAgICAuLi5leGlzdGluZ1RlYW1NZW1iZXJDb2xsZWN0aW9uPy5hZG1pblxuICAgIH0sXG4gICAgYWNjZXNzOiB7XG4gICAgICAuLi5nZXRBZG1pbkFjY2VzcyhwbHVnaW5PcHRpb25zKSxcbiAgICAgIC4uLihleGlzdGluZ1RlYW1NZW1iZXJDb2xsZWN0aW9uPy5hY2Nlc3MgPz8ge30pXG4gICAgfSxcbiAgICBjdXN0b206IHtcbiAgICAgIC4uLihleGlzdGluZ1RlYW1NZW1iZXJDb2xsZWN0aW9uPy5jdXN0b20gPz8ge30pLFxuICAgICAgYmV0dGVyQXV0aE1vZGVsS2V5OiBiYU1vZGVsS2V5LnRlYW1NZW1iZXJcbiAgICB9LFxuICAgIGZpZWxkczogWy4uLihleGlzdGluZ1RlYW1NZW1iZXJDb2xsZWN0aW9uPy5maWVsZHMgPz8gW10pLCAuLi4oY29sbGVjdGlvbkZpZWxkcyA/PyBbXSldXG4gIH1cblxuICBpZiAodHlwZW9mIHBsdWdpbk9wdGlvbnMucGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcz8udGVhbU1lbWJlcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0ZWFtTWVtYmVyQ29sbGVjdGlvbiA9IHBsdWdpbk9wdGlvbnMucGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcy50ZWFtTWVtYmVycyh7XG4gICAgICBjb2xsZWN0aW9uOiB0ZWFtTWVtYmVyQ29sbGVjdGlvblxuICAgIH0pXG4gIH1cblxuICBhc3NlcnRBbGxTY2hlbWFGaWVsZHModGVhbU1lbWJlckNvbGxlY3Rpb24sIHRlYW1NZW1iZXJTY2hlbWEpXG5cbiAgcmV0dXJuIHRlYW1NZW1iZXJDb2xsZWN0aW9uXG59XG5cbiJdLCJuYW1lcyI6WyJiYU1vZGVsS2V5IiwiZ2V0QWRtaW5BY2Nlc3MiLCJnZXRDb2xsZWN0aW9uRmllbGRzIiwiZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWciLCJnZXRTY2hlbWFGaWVsZE5hbWUiLCJhc3NlcnRBbGxTY2hlbWFGaWVsZHMiLCJidWlsZFRlYW1NZW1iZXJzQ29sbGVjdGlvbiIsImluY29taW5nQ29sbGVjdGlvbnMiLCJwbHVnaW5PcHRpb25zIiwicmVzb2x2ZWRTY2hlbWFzIiwidGVhbU1lbWJlclNsdWciLCJ0ZWFtTWVtYmVyIiwidGVhbU1lbWJlclNjaGVtYSIsImV4aXN0aW5nVGVhbU1lbWJlckNvbGxlY3Rpb24iLCJmaW5kIiwiY29sbGVjdGlvbiIsInNsdWciLCJmaWVsZE92ZXJyaWRlcyIsInRlYW1JZCIsImluZGV4IiwiYWRtaW4iLCJyZWFkT25seSIsImRlc2NyaXB0aW9uIiwidXNlcklkIiwiY29sbGVjdGlvbkZpZWxkcyIsInNjaGVtYSIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwidGVhbU1lbWJlckNvbGxlY3Rpb24iLCJoaWRkZW4iLCJoaWRlUGx1Z2luQ29sbGVjdGlvbnMiLCJ1c2VBc1RpdGxlIiwiZ3JvdXAiLCJjb2xsZWN0aW9uQWRtaW5Hcm91cCIsImFjY2VzcyIsImN1c3RvbSIsImJldHRlckF1dGhNb2RlbEtleSIsImZpZWxkcyIsInBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMiLCJ0ZWFtTWVtYmVycyJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBdUNBLFVBQVUsUUFBUSxrQkFBaUI7QUFDMUUsU0FBU0MsY0FBYyxRQUFRLGlDQUFnQztBQUMvRCxTQUFTQyxtQkFBbUIsUUFBUSw2Q0FBNEM7QUFDaEYsU0FBU0MsdUJBQXVCLEVBQUVDLGtCQUFrQixRQUFRLDRCQUEyQjtBQUN2RixTQUFTQyxxQkFBcUIsUUFBUSw0QkFBMkI7QUFNakUsT0FBTyxTQUFTQywyQkFBMkIsRUFBRUMsbUJBQW1CLEVBQUVDLGFBQWEsRUFBRUMsZUFBZSxFQUF3QjtJQUN0SCxNQUFNQyxpQkFBaUJQLHdCQUF3Qk0saUJBQWlCVCxXQUFXVyxVQUFVO0lBQ3JGLE1BQU1DLG1CQUFtQkgsZUFBZSxDQUFDVCxXQUFXVyxVQUFVLENBQUM7SUFFL0QsTUFBTUUsK0JBQStCTixvQkFBb0JPLElBQUksQ0FBQyxDQUFDQyxhQUFlQSxXQUFXQyxJQUFJLEtBQUtOO0lBRWxHLE1BQU1PLGlCQUFtRDtRQUN2REMsUUFBUSxJQUFPLENBQUE7Z0JBQ2JDLE9BQU87Z0JBQ1BDLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQXFDO1lBQzdFLENBQUE7UUFDQUMsUUFBUSxJQUFPLENBQUE7Z0JBQ2JKLE9BQU87Z0JBQ1BDLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQXlDO1lBQ2pGLENBQUE7SUFDRjtJQUVBLE1BQU1FLG1CQUFtQnRCLG9CQUFvQjtRQUMzQ3VCLFFBQVFiO1FBQ1JjLHNCQUFzQlQ7SUFDeEI7SUFFQSxJQUFJVSx1QkFBeUM7UUFDM0MsR0FBR2QsNEJBQTRCO1FBQy9CRyxNQUFNTjtRQUNOVSxPQUFPO1lBQ0xRLFFBQVFwQixjQUFjcUIscUJBQXFCLElBQUk7WUFDL0NDLFlBQVkxQixtQkFBbUJLLGlCQUFpQlQsV0FBV1csVUFBVSxFQUFFO1lBQ3ZFVyxhQUFhO1lBQ2JTLE9BQU92QixlQUFld0Isd0JBQXdCO1lBQzlDLEdBQUduQiw4QkFBOEJPLEtBQUs7UUFDeEM7UUFDQWEsUUFBUTtZQUNOLEdBQUdoQyxlQUFlTyxjQUFjO1lBQ2hDLEdBQUlLLDhCQUE4Qm9CLFVBQVUsQ0FBQyxDQUFDO1FBQ2hEO1FBQ0FDLFFBQVE7WUFDTixHQUFJckIsOEJBQThCcUIsVUFBVSxDQUFDLENBQUM7WUFDOUNDLG9CQUFvQm5DLFdBQVdXLFVBQVU7UUFDM0M7UUFDQXlCLFFBQVE7ZUFBS3ZCLDhCQUE4QnVCLFVBQVUsRUFBRTtlQUFPWixvQkFBb0IsRUFBRTtTQUFFO0lBQ3hGO0lBRUEsSUFBSSxPQUFPaEIsY0FBYzZCLHlCQUF5QixFQUFFQyxnQkFBZ0IsWUFBWTtRQUM5RVgsdUJBQXVCbkIsY0FBYzZCLHlCQUF5QixDQUFDQyxXQUFXLENBQUM7WUFDekV2QixZQUFZWTtRQUNkO0lBQ0Y7SUFFQXRCLHNCQUFzQnNCLHNCQUFzQmY7SUFFNUMsT0FBT2U7QUFDVCJ9