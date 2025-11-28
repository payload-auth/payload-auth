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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3RlYW1zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhTW9kZWxLZXkgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnXG5pbXBvcnQgeyBnZXRBZG1pbkFjY2VzcyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvZ2V0LWFkbWluLWFjY2VzcydcbmltcG9ydCB7IGFzc2VydEFsbFNjaGVtYUZpZWxkcywgZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcsIGdldFNjaGVtYUZpZWxkTmFtZSB9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbi1zY2hlbWEnXG5pbXBvcnQgeyBnZXRDb2xsZWN0aW9uRmllbGRzIH0gZnJvbSAnLi91dGlscy90cmFuc2Zvcm0tc2NoZW1hLWZpZWxkcy10by1wYXlsb2FkJ1xuaW1wb3J0IHR5cGUgeyBUZWFtIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9nZW5lcmF0ZWQtdHlwZXMnXG5pbXBvcnQgdHlwZSB7IENvbGxlY3Rpb25Db25maWcgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHR5cGUgeyBCdWlsZENvbGxlY3Rpb25Qcm9wcywgRmllbGRPdmVycmlkZXMsIEZpZWxkUnVsZSB9IGZyb20gJy4uLy4uL3R5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRUZWFtc0NvbGxlY3Rpb24oeyBpbmNvbWluZ0NvbGxlY3Rpb25zLCBwbHVnaW5PcHRpb25zLCByZXNvbHZlZFNjaGVtYXMgfTogQnVpbGRDb2xsZWN0aW9uUHJvcHMpOiBDb2xsZWN0aW9uQ29uZmlnIHtcbiAgY29uc3QgdGVhbVNsdWcgPSBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyhyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkudGVhbSlcbiAgY29uc3QgdGVhbVNjaGVtYSA9IHJlc29sdmVkU2NoZW1hc1tiYU1vZGVsS2V5LnRlYW1dXG4gIGNvbnN0IGV4aXN0aW5nVGVhbUNvbGxlY3Rpb24gPSBpbmNvbWluZ0NvbGxlY3Rpb25zLmZpbmQoKGNvbGxlY3Rpb24pID0+IGNvbGxlY3Rpb24uc2x1ZyA9PT0gdGVhbVNsdWcpIGFzIENvbGxlY3Rpb25Db25maWcgfCB1bmRlZmluZWRcblxuICBjb25zdCBmaWVsZE92ZXJyaWRlczogRmllbGRPdmVycmlkZXM8a2V5b2YgVGVhbT4gPSB7XG4gICAgbmFtZTogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnVGhlIG5hbWUgb2YgdGhlIHRlYW0uJyB9XG4gICAgfSksXG4gICAgb3JnYW5pemF0aW9uSWQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjoge1xuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgb3JnYW5pemF0aW9uIHRoYXQgdGhlIHRlYW0gYmVsb25ncyB0by4nXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHRlYW1GaWVsZFJ1bGVzOiBGaWVsZFJ1bGVbXSA9IFtcbiAgICB7XG4gICAgICBjb25kaXRpb246IChmaWVsZCkgPT4gZmllbGQudHlwZSA9PT0gJ2RhdGUnLFxuICAgICAgdHJhbnNmb3JtOiAoZmllbGQpID0+ICh7XG4gICAgICAgIC4uLmZpZWxkLFxuICAgICAgICBzYXZlVG9KV1Q6IGZhbHNlLFxuICAgICAgICBhZG1pbjoge1xuICAgICAgICAgIGRpc2FibGVCdWxrRWRpdDogdHJ1ZSxcbiAgICAgICAgICBoaWRkZW46IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgaW5kZXg6IHRydWUsXG4gICAgICAgIGxhYmVsOiAoeyB0IH06IGFueSkgPT4gdCgnZ2VuZXJhbDp1cGRhdGVkQXQnKVxuICAgICAgfSlcbiAgICB9XG4gIF1cblxuICBjb25zdCBjb2xsZWN0aW9uRmllbGRzID0gZ2V0Q29sbGVjdGlvbkZpZWxkcyh7XG4gICAgc2NoZW1hOiB0ZWFtU2NoZW1hLFxuICAgIGZpZWxkUnVsZXM6IHRlYW1GaWVsZFJ1bGVzLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmaWVsZE92ZXJyaWRlc1xuICB9KVxuXG4gIGxldCB0ZWFtQ29sbGVjdGlvbjogQ29sbGVjdGlvbkNvbmZpZyA9IHtcbiAgICAuLi5leGlzdGluZ1RlYW1Db2xsZWN0aW9uLFxuICAgIHNsdWc6IHRlYW1TbHVnLFxuICAgIGFkbWluOiB7XG4gICAgICBoaWRkZW46IHBsdWdpbk9wdGlvbnMuaGlkZVBsdWdpbkNvbGxlY3Rpb25zID8/IGZhbHNlLFxuICAgICAgdXNlQXNUaXRsZTogZ2V0U2NoZW1hRmllbGROYW1lKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS50ZWFtLCAnbmFtZScpLFxuICAgICAgZGVzY3JpcHRpb246ICdUZWFtcyBhcmUgZ3JvdXBzIG9mIHVzZXJzIHRoYXQgc2hhcmUgYWNjZXNzIHRvIGNlcnRhaW4gcmVzb3VyY2VzLicsXG4gICAgICBncm91cDogcGx1Z2luT3B0aW9ucz8uY29sbGVjdGlvbkFkbWluR3JvdXAgPz8gJ0F1dGgnLFxuICAgICAgLi4uZXhpc3RpbmdUZWFtQ29sbGVjdGlvbj8uYWRtaW5cbiAgICB9LFxuICAgIGFjY2Vzczoge1xuICAgICAgLi4uZ2V0QWRtaW5BY2Nlc3MocGx1Z2luT3B0aW9ucyksXG4gICAgICAuLi4oZXhpc3RpbmdUZWFtQ29sbGVjdGlvbj8uYWNjZXNzID8/IHt9KVxuICAgIH0sXG4gICAgY3VzdG9tOiB7XG4gICAgICAuLi4oZXhpc3RpbmdUZWFtQ29sbGVjdGlvbj8uY3VzdG9tID8/IHt9KSxcbiAgICAgIGJldHRlckF1dGhNb2RlbEtleTogYmFNb2RlbEtleS50ZWFtXG4gICAgfSxcbiAgICBmaWVsZHM6IFsuLi4oZXhpc3RpbmdUZWFtQ29sbGVjdGlvbj8uZmllbGRzID8/IFtdKSwgLi4uKGNvbGxlY3Rpb25GaWVsZHMgPz8gW10pXVxuICB9XG5cbiAgaWYgKHR5cGVvZiBwbHVnaW5PcHRpb25zLnBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXM/LnRlYW1zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdGVhbUNvbGxlY3Rpb24gPSBwbHVnaW5PcHRpb25zLnBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMudGVhbXMoe1xuICAgICAgY29sbGVjdGlvbjogdGVhbUNvbGxlY3Rpb25cbiAgICB9KVxuICB9XG5cbiAgYXNzZXJ0QWxsU2NoZW1hRmllbGRzKHRlYW1Db2xsZWN0aW9uLCB0ZWFtU2NoZW1hKVxuXG4gIHJldHVybiB0ZWFtQ29sbGVjdGlvblxufVxuIl0sIm5hbWVzIjpbImJhTW9kZWxLZXkiLCJnZXRBZG1pbkFjY2VzcyIsImFzc2VydEFsbFNjaGVtYUZpZWxkcyIsImdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIiwiZ2V0U2NoZW1hRmllbGROYW1lIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsImJ1aWxkVGVhbXNDb2xsZWN0aW9uIiwiaW5jb21pbmdDb2xsZWN0aW9ucyIsInBsdWdpbk9wdGlvbnMiLCJyZXNvbHZlZFNjaGVtYXMiLCJ0ZWFtU2x1ZyIsInRlYW0iLCJ0ZWFtU2NoZW1hIiwiZXhpc3RpbmdUZWFtQ29sbGVjdGlvbiIsImZpbmQiLCJjb2xsZWN0aW9uIiwic2x1ZyIsImZpZWxkT3ZlcnJpZGVzIiwibmFtZSIsImFkbWluIiwiZGVzY3JpcHRpb24iLCJvcmdhbml6YXRpb25JZCIsInJlYWRPbmx5IiwidGVhbUZpZWxkUnVsZXMiLCJjb25kaXRpb24iLCJmaWVsZCIsInR5cGUiLCJ0cmFuc2Zvcm0iLCJzYXZlVG9KV1QiLCJkaXNhYmxlQnVsa0VkaXQiLCJoaWRkZW4iLCJpbmRleCIsImxhYmVsIiwidCIsImNvbGxlY3Rpb25GaWVsZHMiLCJzY2hlbWEiLCJmaWVsZFJ1bGVzIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJ0ZWFtQ29sbGVjdGlvbiIsImhpZGVQbHVnaW5Db2xsZWN0aW9ucyIsInVzZUFzVGl0bGUiLCJncm91cCIsImNvbGxlY3Rpb25BZG1pbkdyb3VwIiwiYWNjZXNzIiwiY3VzdG9tIiwiYmV0dGVyQXV0aE1vZGVsS2V5IiwiZmllbGRzIiwicGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcyIsInRlYW1zIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxVQUFVLFFBQVEsa0JBQWlCO0FBQzVDLFNBQVNDLGNBQWMsUUFBUSxpQ0FBZ0M7QUFDL0QsU0FBU0MscUJBQXFCLEVBQUVDLHVCQUF1QixFQUFFQyxrQkFBa0IsUUFBUSw0QkFBMkI7QUFDOUcsU0FBU0MsbUJBQW1CLFFBQVEsNkNBQTRDO0FBS2hGLE9BQU8sU0FBU0MscUJBQXFCLEVBQUVDLG1CQUFtQixFQUFFQyxhQUFhLEVBQUVDLGVBQWUsRUFBd0I7SUFDaEgsTUFBTUMsV0FBV1Asd0JBQXdCTSxpQkFBaUJULFdBQVdXLElBQUk7SUFDekUsTUFBTUMsYUFBYUgsZUFBZSxDQUFDVCxXQUFXVyxJQUFJLENBQUM7SUFDbkQsTUFBTUUseUJBQXlCTixvQkFBb0JPLElBQUksQ0FBQyxDQUFDQyxhQUFlQSxXQUFXQyxJQUFJLEtBQUtOO0lBRTVGLE1BQU1PLGlCQUE2QztRQUNqREMsTUFBTSxJQUFPLENBQUE7Z0JBQ1hDLE9BQU87b0JBQUVDLGFBQWE7Z0JBQXdCO1lBQ2hELENBQUE7UUFDQUMsZ0JBQWdCLElBQU8sQ0FBQTtnQkFDckJGLE9BQU87b0JBQ0xHLFVBQVU7b0JBQ1ZGLGFBQWE7Z0JBQ2Y7WUFDRixDQUFBO0lBQ0Y7SUFFQSxNQUFNRyxpQkFBOEI7UUFDbEM7WUFDRUMsV0FBVyxDQUFDQyxRQUFVQSxNQUFNQyxJQUFJLEtBQUs7WUFDckNDLFdBQVcsQ0FBQ0YsUUFBVyxDQUFBO29CQUNyQixHQUFHQSxLQUFLO29CQUNSRyxXQUFXO29CQUNYVCxPQUFPO3dCQUNMVSxpQkFBaUI7d0JBQ2pCQyxRQUFRO29CQUNWO29CQUNBQyxPQUFPO29CQUNQQyxPQUFPLENBQUMsRUFBRUMsQ0FBQyxFQUFPLEdBQUtBLEVBQUU7Z0JBQzNCLENBQUE7UUFDRjtLQUNEO0lBRUQsTUFBTUMsbUJBQW1CN0Isb0JBQW9CO1FBQzNDOEIsUUFBUXZCO1FBQ1J3QixZQUFZYjtRQUNaYyxzQkFBc0JwQjtJQUN4QjtJQUVBLElBQUlxQixpQkFBbUM7UUFDckMsR0FBR3pCLHNCQUFzQjtRQUN6QkcsTUFBTU47UUFDTlMsT0FBTztZQUNMVyxRQUFRdEIsY0FBYytCLHFCQUFxQixJQUFJO1lBQy9DQyxZQUFZcEMsbUJBQW1CSyxpQkFBaUJULFdBQVdXLElBQUksRUFBRTtZQUNqRVMsYUFBYTtZQUNicUIsT0FBT2pDLGVBQWVrQyx3QkFBd0I7WUFDOUMsR0FBRzdCLHdCQUF3Qk0sS0FBSztRQUNsQztRQUNBd0IsUUFBUTtZQUNOLEdBQUcxQyxlQUFlTyxjQUFjO1lBQ2hDLEdBQUlLLHdCQUF3QjhCLFVBQVUsQ0FBQyxDQUFDO1FBQzFDO1FBQ0FDLFFBQVE7WUFDTixHQUFJL0Isd0JBQXdCK0IsVUFBVSxDQUFDLENBQUM7WUFDeENDLG9CQUFvQjdDLFdBQVdXLElBQUk7UUFDckM7UUFDQW1DLFFBQVE7ZUFBS2pDLHdCQUF3QmlDLFVBQVUsRUFBRTtlQUFPWixvQkFBb0IsRUFBRTtTQUFFO0lBQ2xGO0lBRUEsSUFBSSxPQUFPMUIsY0FBY3VDLHlCQUF5QixFQUFFQyxVQUFVLFlBQVk7UUFDeEVWLGlCQUFpQjlCLGNBQWN1Qyx5QkFBeUIsQ0FBQ0MsS0FBSyxDQUFDO1lBQzdEakMsWUFBWXVCO1FBQ2Q7SUFDRjtJQUVBcEMsc0JBQXNCb0MsZ0JBQWdCMUI7SUFFdEMsT0FBTzBCO0FBQ1QifQ==