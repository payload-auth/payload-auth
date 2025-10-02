import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { getSchemaCollectionSlug, getSchemaFieldName } from "./utils/collection-schema";
import { assertAllSchemaFields } from "./utils/collection-schema";
export function buildMembersCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const memberSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.member);
    const memberSchema = resolvedSchemas[baModelKey.member];
    const existingMemberCollection = incomingCollections.find((collection)=>collection.slug === memberSlug);
    const fieldOverrides = {
        organizationId: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The organization that the member belongs to.'
                }
            }),
        userId: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The user that is a member of the organization.'
                }
            }),
        teamId: ()=>({
                admin: {
                    description: 'The team that the member belongs to.'
                }
            }),
        role: ()=>({
                defaultValue: 'member',
                admin: {
                    description: 'The role of the member in the organization.'
                }
            })
    };
    const collectionFields = getCollectionFields({
        schema: memberSchema,
        additionalProperties: fieldOverrides
    });
    let memberCollection = {
        ...existingMemberCollection,
        slug: memberSlug,
        admin: {
            hidden: pluginOptions.hidePluginCollections ?? false,
            useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.member, 'organizationId'),
            description: 'Members of an organization.',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingMemberCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingMemberCollection?.access ?? {}
        },
        custom: {
            ...existingMemberCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.member
        },
        fields: [
            ...existingMemberCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.pluginCollectionOverrides?.members === 'function') {
        memberCollection = pluginOptions.pluginCollectionOverrides.members({
            collection: memberCollection
        });
    }
    assertAllSchemaFields(memberCollection, memberSchema);
    return memberCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL21lbWJlcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmFNb2RlbEZpZWxkS2V5c1RvRmllbGROYW1lcywgYmFNb2RlbEtleSB9IGZyb20gJy4uLy4uL2NvbnN0YW50cydcbmltcG9ydCB7IGdldEFkbWluQWNjZXNzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9nZXQtYWRtaW4tYWNjZXNzJ1xuaW1wb3J0IHsgZ2V0Q29sbGVjdGlvbkZpZWxkcyB9IGZyb20gJy4vdXRpbHMvdHJhbnNmb3JtLXNjaGVtYS1maWVsZHMtdG8tcGF5bG9hZCdcbmltcG9ydCB7IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnLCBnZXRTY2hlbWFGaWVsZE5hbWUgfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuaW1wb3J0IHsgYXNzZXJ0QWxsU2NoZW1hRmllbGRzIH0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcblxuaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB0eXBlIHsgQnVpbGRDb2xsZWN0aW9uUHJvcHMsIEZpZWxkT3ZlcnJpZGVzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vdHlwZXMnXG5pbXBvcnQgdHlwZSB7IE1lbWJlciB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvZ2VuZXJhdGVkLXR5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRNZW1iZXJzQ29sbGVjdGlvbih7IGluY29taW5nQ29sbGVjdGlvbnMsIHBsdWdpbk9wdGlvbnMsIHJlc29sdmVkU2NoZW1hcyB9OiBCdWlsZENvbGxlY3Rpb25Qcm9wcyk6IENvbGxlY3Rpb25Db25maWcge1xuICBjb25zdCBtZW1iZXJTbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5Lm1lbWJlcilcbiAgY29uc3QgbWVtYmVyU2NoZW1hID0gcmVzb2x2ZWRTY2hlbWFzW2JhTW9kZWxLZXkubWVtYmVyXVxuXG4gIGNvbnN0IGV4aXN0aW5nTWVtYmVyQ29sbGVjdGlvbiA9IGluY29taW5nQ29sbGVjdGlvbnMuZmluZCgoY29sbGVjdGlvbikgPT4gY29sbGVjdGlvbi5zbHVnID09PSBtZW1iZXJTbHVnKSBhcyBDb2xsZWN0aW9uQ29uZmlnIHwgdW5kZWZpbmVkXG5cbiAgY29uc3QgZmllbGRPdmVycmlkZXM6IEZpZWxkT3ZlcnJpZGVzPGtleW9mIE1lbWJlcj4gPSB7XG4gICAgb3JnYW5pemF0aW9uSWQ6ICgpID0+ICh7XG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBvcmdhbml6YXRpb24gdGhhdCB0aGUgbWVtYmVyIGJlbG9uZ3MgdG8uJyB9XG4gICAgfSksXG4gICAgdXNlcklkOiAoKSA9PiAoe1xuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgdXNlciB0aGF0IGlzIGEgbWVtYmVyIG9mIHRoZSBvcmdhbml6YXRpb24uJyB9XG4gICAgfSksXG4gICAgdGVhbUlkOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdUaGUgdGVhbSB0aGF0IHRoZSBtZW1iZXIgYmVsb25ncyB0by4nIH1cbiAgICB9KSxcbiAgICByb2xlOiAoKSA9PiAoe1xuICAgICAgZGVmYXVsdFZhbHVlOiAnbWVtYmVyJyxcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnVGhlIHJvbGUgb2YgdGhlIG1lbWJlciBpbiB0aGUgb3JnYW5pemF0aW9uLicgfVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBjb2xsZWN0aW9uRmllbGRzID0gZ2V0Q29sbGVjdGlvbkZpZWxkcyh7XG4gICAgc2NoZW1hOiBtZW1iZXJTY2hlbWEsXG4gICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZpZWxkT3ZlcnJpZGVzXG4gIH0pXG5cbiAgbGV0IG1lbWJlckNvbGxlY3Rpb246IENvbGxlY3Rpb25Db25maWcgPSB7XG4gICAgLi4uZXhpc3RpbmdNZW1iZXJDb2xsZWN0aW9uLFxuICAgIHNsdWc6IG1lbWJlclNsdWcsXG4gICAgYWRtaW46IHtcbiAgICAgIGhpZGRlbjogcGx1Z2luT3B0aW9ucy5oaWRlUGx1Z2luQ29sbGVjdGlvbnMgPz8gZmFsc2UsXG4gICAgICB1c2VBc1RpdGxlOiBnZXRTY2hlbWFGaWVsZE5hbWUocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5Lm1lbWJlciwgJ29yZ2FuaXphdGlvbklkJyksXG4gICAgICBkZXNjcmlwdGlvbjogJ01lbWJlcnMgb2YgYW4gb3JnYW5pemF0aW9uLicsXG4gICAgICBncm91cDogcGx1Z2luT3B0aW9ucz8uY29sbGVjdGlvbkFkbWluR3JvdXAgPz8gJ0F1dGgnLFxuICAgICAgLi4uZXhpc3RpbmdNZW1iZXJDb2xsZWN0aW9uPy5hZG1pblxuICAgIH0sXG4gICAgYWNjZXNzOiB7XG4gICAgICAuLi5nZXRBZG1pbkFjY2VzcyhwbHVnaW5PcHRpb25zKSxcbiAgICAgIC4uLihleGlzdGluZ01lbWJlckNvbGxlY3Rpb24/LmFjY2VzcyA/PyB7fSlcbiAgICB9LFxuICAgIGN1c3RvbToge1xuICAgICAgLi4uKGV4aXN0aW5nTWVtYmVyQ29sbGVjdGlvbj8uY3VzdG9tID8/IHt9KSxcbiAgICAgIGJldHRlckF1dGhNb2RlbEtleTogYmFNb2RlbEtleS5tZW1iZXJcbiAgICB9LFxuICAgIGZpZWxkczogWy4uLihleGlzdGluZ01lbWJlckNvbGxlY3Rpb24/LmZpZWxkcyA/PyBbXSksIC4uLihjb2xsZWN0aW9uRmllbGRzID8/IFtdKV1cbiAgfVxuXG4gIGlmICh0eXBlb2YgcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzPy5tZW1iZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgbWVtYmVyQ29sbGVjdGlvbiA9IHBsdWdpbk9wdGlvbnMucGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcy5tZW1iZXJzKHtcbiAgICAgIGNvbGxlY3Rpb246IG1lbWJlckNvbGxlY3Rpb25cbiAgICB9KVxuICB9XG5cbiAgYXNzZXJ0QWxsU2NoZW1hRmllbGRzKG1lbWJlckNvbGxlY3Rpb24sIG1lbWJlclNjaGVtYSlcblxuICByZXR1cm4gbWVtYmVyQ29sbGVjdGlvblxufVxuIl0sIm5hbWVzIjpbImJhTW9kZWxLZXkiLCJnZXRBZG1pbkFjY2VzcyIsImdldENvbGxlY3Rpb25GaWVsZHMiLCJnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyIsImdldFNjaGVtYUZpZWxkTmFtZSIsImFzc2VydEFsbFNjaGVtYUZpZWxkcyIsImJ1aWxkTWVtYmVyc0NvbGxlY3Rpb24iLCJpbmNvbWluZ0NvbGxlY3Rpb25zIiwicGx1Z2luT3B0aW9ucyIsInJlc29sdmVkU2NoZW1hcyIsIm1lbWJlclNsdWciLCJtZW1iZXIiLCJtZW1iZXJTY2hlbWEiLCJleGlzdGluZ01lbWJlckNvbGxlY3Rpb24iLCJmaW5kIiwiY29sbGVjdGlvbiIsInNsdWciLCJmaWVsZE92ZXJyaWRlcyIsIm9yZ2FuaXphdGlvbklkIiwiaW5kZXgiLCJhZG1pbiIsInJlYWRPbmx5IiwiZGVzY3JpcHRpb24iLCJ1c2VySWQiLCJ0ZWFtSWQiLCJyb2xlIiwiZGVmYXVsdFZhbHVlIiwiY29sbGVjdGlvbkZpZWxkcyIsInNjaGVtYSIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwibWVtYmVyQ29sbGVjdGlvbiIsImhpZGRlbiIsImhpZGVQbHVnaW5Db2xsZWN0aW9ucyIsInVzZUFzVGl0bGUiLCJncm91cCIsImNvbGxlY3Rpb25BZG1pbkdyb3VwIiwiYWNjZXNzIiwiY3VzdG9tIiwiYmV0dGVyQXV0aE1vZGVsS2V5IiwiZmllbGRzIiwicGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcyIsIm1lbWJlcnMiXSwibWFwcGluZ3MiOiJBQUFBLFNBQXVDQSxVQUFVLFFBQVEsa0JBQWlCO0FBQzFFLFNBQVNDLGNBQWMsUUFBUSxpQ0FBZ0M7QUFDL0QsU0FBU0MsbUJBQW1CLFFBQVEsNkNBQTRDO0FBQ2hGLFNBQVNDLHVCQUF1QixFQUFFQyxrQkFBa0IsUUFBUSw0QkFBMkI7QUFDdkYsU0FBU0MscUJBQXFCLFFBQVEsNEJBQTJCO0FBTWpFLE9BQU8sU0FBU0MsdUJBQXVCLEVBQUVDLG1CQUFtQixFQUFFQyxhQUFhLEVBQUVDLGVBQWUsRUFBd0I7SUFDbEgsTUFBTUMsYUFBYVAsd0JBQXdCTSxpQkFBaUJULFdBQVdXLE1BQU07SUFDN0UsTUFBTUMsZUFBZUgsZUFBZSxDQUFDVCxXQUFXVyxNQUFNLENBQUM7SUFFdkQsTUFBTUUsMkJBQTJCTixvQkFBb0JPLElBQUksQ0FBQyxDQUFDQyxhQUFlQSxXQUFXQyxJQUFJLEtBQUtOO0lBRTlGLE1BQU1PLGlCQUErQztRQUNuREMsZ0JBQWdCLElBQU8sQ0FBQTtnQkFDckJDLE9BQU87Z0JBQ1BDLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQStDO1lBQ3ZGLENBQUE7UUFDQUMsUUFBUSxJQUFPLENBQUE7Z0JBQ2JKLE9BQU87Z0JBQ1BDLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQWlEO1lBQ3pGLENBQUE7UUFDQUUsUUFBUSxJQUFPLENBQUE7Z0JBQ2JKLE9BQU87b0JBQUVFLGFBQWE7Z0JBQXVDO1lBQy9ELENBQUE7UUFDQUcsTUFBTSxJQUFPLENBQUE7Z0JBQ1hDLGNBQWM7Z0JBQ2ROLE9BQU87b0JBQUVFLGFBQWE7Z0JBQThDO1lBQ3RFLENBQUE7SUFDRjtJQUVBLE1BQU1LLG1CQUFtQnpCLG9CQUFvQjtRQUMzQzBCLFFBQVFoQjtRQUNSaUIsc0JBQXNCWjtJQUN4QjtJQUVBLElBQUlhLG1CQUFxQztRQUN2QyxHQUFHakIsd0JBQXdCO1FBQzNCRyxNQUFNTjtRQUNOVSxPQUFPO1lBQ0xXLFFBQVF2QixjQUFjd0IscUJBQXFCLElBQUk7WUFDL0NDLFlBQVk3QixtQkFBbUJLLGlCQUFpQlQsV0FBV1csTUFBTSxFQUFFO1lBQ25FVyxhQUFhO1lBQ2JZLE9BQU8xQixlQUFlMkIsd0JBQXdCO1lBQzlDLEdBQUd0QiwwQkFBMEJPLEtBQUs7UUFDcEM7UUFDQWdCLFFBQVE7WUFDTixHQUFHbkMsZUFBZU8sY0FBYztZQUNoQyxHQUFJSywwQkFBMEJ1QixVQUFVLENBQUMsQ0FBQztRQUM1QztRQUNBQyxRQUFRO1lBQ04sR0FBSXhCLDBCQUEwQndCLFVBQVUsQ0FBQyxDQUFDO1lBQzFDQyxvQkFBb0J0QyxXQUFXVyxNQUFNO1FBQ3ZDO1FBQ0E0QixRQUFRO2VBQUsxQiwwQkFBMEIwQixVQUFVLEVBQUU7ZUFBT1osb0JBQW9CLEVBQUU7U0FBRTtJQUNwRjtJQUVBLElBQUksT0FBT25CLGNBQWNnQyx5QkFBeUIsRUFBRUMsWUFBWSxZQUFZO1FBQzFFWCxtQkFBbUJ0QixjQUFjZ0MseUJBQXlCLENBQUNDLE9BQU8sQ0FBQztZQUNqRTFCLFlBQVllO1FBQ2Q7SUFDRjtJQUVBekIsc0JBQXNCeUIsa0JBQWtCbEI7SUFFeEMsT0FBT2tCO0FBQ1QifQ==