import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { assertAllSchemaFields, getSchemaCollectionSlug, getSchemaFieldName } from "./utils/collection-schema";
export function buildInvitationsCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const invitationSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.invitation);
    const invitationSchema = resolvedSchemas[baModelKey.invitation];
    const existingInvitationCollection = incomingCollections.find((collection)=>collection.slug === invitationSlug);
    const fieldOverrides = {
        email: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The email of the user being invited.'
                }
            }),
        inviterId: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The user who invited the user.'
                }
            }),
        teamId: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The team that the user is being invited to.'
                }
            }),
        organizationId: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The organization that the user is being invited to.'
                }
            }),
        role: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The role of the user being invited.'
                }
            }),
        status: ()=>({
                defaultValue: 'pending',
                admin: {
                    readOnly: true,
                    description: 'The status of the invitation.'
                }
            }),
        expiresAt: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The date and time when the invitation will expire.'
                }
            })
    };
    const collectionFields = getCollectionFields({
        schema: invitationSchema,
        additionalProperties: fieldOverrides
    });
    let invitationCollection = {
        ...existingInvitationCollection,
        slug: invitationSlug,
        admin: {
            hidden: pluginOptions.hidePluginCollections ?? false,
            useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.invitation, 'email'),
            description: 'Invitations to join an organization',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingInvitationCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingInvitationCollection?.access ?? {}
        },
        custom: {
            ...existingInvitationCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.invitation
        },
        fields: [
            ...existingInvitationCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.pluginCollectionOverrides?.invitations === 'function') {
        invitationCollection = pluginOptions.pluginCollectionOverrides.invitations({
            collection: invitationCollection
        });
    }
    assertAllSchemaFields(invitationCollection, invitationSchema);
    return invitationCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL2ludml0YXRpb25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhTW9kZWxLZXkgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnXG5pbXBvcnQgeyBnZXRBZG1pbkFjY2VzcyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvZ2V0LWFkbWluLWFjY2VzcydcbmltcG9ydCB7IGdldENvbGxlY3Rpb25GaWVsZHMgfSBmcm9tICcuL3V0aWxzL3RyYW5zZm9ybS1zY2hlbWEtZmllbGRzLXRvLXBheWxvYWQnXG5pbXBvcnQgeyBhc3NlcnRBbGxTY2hlbWFGaWVsZHMsIGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnLCBnZXRTY2hlbWFGaWVsZE5hbWUgfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuXG5pbXBvcnQgdHlwZSB7IENvbGxlY3Rpb25Db25maWcgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHR5cGUgeyBJbnZpdGF0aW9uIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9nZW5lcmF0ZWQtdHlwZXMnXG5pbXBvcnQgdHlwZSB7IEJ1aWxkQ29sbGVjdGlvblByb3BzLCBGaWVsZE92ZXJyaWRlcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRJbnZpdGF0aW9uc0NvbGxlY3Rpb24oeyBpbmNvbWluZ0NvbGxlY3Rpb25zLCBwbHVnaW5PcHRpb25zLCByZXNvbHZlZFNjaGVtYXMgfTogQnVpbGRDb2xsZWN0aW9uUHJvcHMpOiBDb2xsZWN0aW9uQ29uZmlnIHtcbiAgY29uc3QgaW52aXRhdGlvblNsdWcgPSBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyhyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkuaW52aXRhdGlvbilcbiAgY29uc3QgaW52aXRhdGlvblNjaGVtYSA9IHJlc29sdmVkU2NoZW1hc1tiYU1vZGVsS2V5Lmludml0YXRpb25dXG4gIGNvbnN0IGV4aXN0aW5nSW52aXRhdGlvbkNvbGxlY3Rpb24gPSBpbmNvbWluZ0NvbGxlY3Rpb25zLmZpbmQoKGNvbGxlY3Rpb24pID0+IGNvbGxlY3Rpb24uc2x1ZyA9PT0gaW52aXRhdGlvblNsdWcpIGFzXG4gICAgfCBDb2xsZWN0aW9uQ29uZmlnXG4gICAgfCB1bmRlZmluZWRcblxuICBjb25zdCBmaWVsZE92ZXJyaWRlczogRmllbGRPdmVycmlkZXM8a2V5b2YgSW52aXRhdGlvbj4gPSB7XG4gICAgZW1haWw6ICgpID0+ICh7XG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBlbWFpbCBvZiB0aGUgdXNlciBiZWluZyBpbnZpdGVkLicgfVxuICAgIH0pLFxuICAgIGludml0ZXJJZDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSB1c2VyIHdobyBpbnZpdGVkIHRoZSB1c2VyLicgfVxuICAgIH0pLFxuICAgIHRlYW1JZDogKCkgPT4gKHtcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIHRlYW0gdGhhdCB0aGUgdXNlciBpcyBiZWluZyBpbnZpdGVkIHRvLicgfVxuICAgIH0pLFxuICAgIG9yZ2FuaXphdGlvbklkOiAoKSA9PiAoe1xuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgb3JnYW5pemF0aW9uIHRoYXQgdGhlIHVzZXIgaXMgYmVpbmcgaW52aXRlZCB0by4nIH1cbiAgICB9KSxcbiAgICByb2xlOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIHJvbGUgb2YgdGhlIHVzZXIgYmVpbmcgaW52aXRlZC4nIH1cbiAgICB9KSxcbiAgICBzdGF0dXM6ICgpID0+ICh7XG4gICAgICBkZWZhdWx0VmFsdWU6ICdwZW5kaW5nJyxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBzdGF0dXMgb2YgdGhlIGludml0YXRpb24uJyB9XG4gICAgfSksXG4gICAgZXhwaXJlc0F0OiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIGRhdGUgYW5kIHRpbWUgd2hlbiB0aGUgaW52aXRhdGlvbiB3aWxsIGV4cGlyZS4nIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgY29sbGVjdGlvbkZpZWxkcyA9IGdldENvbGxlY3Rpb25GaWVsZHMoe1xuICAgIHNjaGVtYTogaW52aXRhdGlvblNjaGVtYSxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmllbGRPdmVycmlkZXNcbiAgfSlcblxuICBsZXQgaW52aXRhdGlvbkNvbGxlY3Rpb246IENvbGxlY3Rpb25Db25maWcgPSB7XG4gICAgLi4uZXhpc3RpbmdJbnZpdGF0aW9uQ29sbGVjdGlvbixcbiAgICBzbHVnOiBpbnZpdGF0aW9uU2x1ZyxcbiAgICBhZG1pbjoge1xuICAgICAgaGlkZGVuOiBwbHVnaW5PcHRpb25zLmhpZGVQbHVnaW5Db2xsZWN0aW9ucyA/PyBmYWxzZSxcbiAgICAgIHVzZUFzVGl0bGU6IGdldFNjaGVtYUZpZWxkTmFtZShyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkuaW52aXRhdGlvbiwgJ2VtYWlsJyksXG4gICAgICBkZXNjcmlwdGlvbjogJ0ludml0YXRpb25zIHRvIGpvaW4gYW4gb3JnYW5pemF0aW9uJyxcbiAgICAgIGdyb3VwOiBwbHVnaW5PcHRpb25zPy5jb2xsZWN0aW9uQWRtaW5Hcm91cCA/PyAnQXV0aCcsXG4gICAgICAuLi5leGlzdGluZ0ludml0YXRpb25Db2xsZWN0aW9uPy5hZG1pblxuICAgIH0sXG4gICAgYWNjZXNzOiB7XG4gICAgICAuLi5nZXRBZG1pbkFjY2VzcyhwbHVnaW5PcHRpb25zKSxcbiAgICAgIC4uLihleGlzdGluZ0ludml0YXRpb25Db2xsZWN0aW9uPy5hY2Nlc3MgPz8ge30pXG4gICAgfSxcbiAgICBjdXN0b206IHtcbiAgICAgIC4uLihleGlzdGluZ0ludml0YXRpb25Db2xsZWN0aW9uPy5jdXN0b20gPz8ge30pLFxuICAgICAgYmV0dGVyQXV0aE1vZGVsS2V5OiBiYU1vZGVsS2V5Lmludml0YXRpb25cbiAgICB9LFxuICAgIGZpZWxkczogWy4uLihleGlzdGluZ0ludml0YXRpb25Db2xsZWN0aW9uPy5maWVsZHMgPz8gW10pLCAuLi4oY29sbGVjdGlvbkZpZWxkcyA/PyBbXSldXG4gIH1cblxuICBpZiAodHlwZW9mIHBsdWdpbk9wdGlvbnMucGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcz8uaW52aXRhdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBpbnZpdGF0aW9uQ29sbGVjdGlvbiA9IHBsdWdpbk9wdGlvbnMucGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcy5pbnZpdGF0aW9ucyh7XG4gICAgICBjb2xsZWN0aW9uOiBpbnZpdGF0aW9uQ29sbGVjdGlvblxuICAgIH0pXG4gIH1cblxuICBhc3NlcnRBbGxTY2hlbWFGaWVsZHMoaW52aXRhdGlvbkNvbGxlY3Rpb24sIGludml0YXRpb25TY2hlbWEpXG5cbiAgcmV0dXJuIGludml0YXRpb25Db2xsZWN0aW9uXG59XG4iXSwibmFtZXMiOlsiYmFNb2RlbEtleSIsImdldEFkbWluQWNjZXNzIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsImFzc2VydEFsbFNjaGVtYUZpZWxkcyIsImdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIiwiZ2V0U2NoZW1hRmllbGROYW1lIiwiYnVpbGRJbnZpdGF0aW9uc0NvbGxlY3Rpb24iLCJpbmNvbWluZ0NvbGxlY3Rpb25zIiwicGx1Z2luT3B0aW9ucyIsInJlc29sdmVkU2NoZW1hcyIsImludml0YXRpb25TbHVnIiwiaW52aXRhdGlvbiIsImludml0YXRpb25TY2hlbWEiLCJleGlzdGluZ0ludml0YXRpb25Db2xsZWN0aW9uIiwiZmluZCIsImNvbGxlY3Rpb24iLCJzbHVnIiwiZmllbGRPdmVycmlkZXMiLCJlbWFpbCIsImluZGV4IiwiYWRtaW4iLCJyZWFkT25seSIsImRlc2NyaXB0aW9uIiwiaW52aXRlcklkIiwidGVhbUlkIiwib3JnYW5pemF0aW9uSWQiLCJyb2xlIiwic3RhdHVzIiwiZGVmYXVsdFZhbHVlIiwiZXhwaXJlc0F0IiwiY29sbGVjdGlvbkZpZWxkcyIsInNjaGVtYSIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwiaW52aXRhdGlvbkNvbGxlY3Rpb24iLCJoaWRkZW4iLCJoaWRlUGx1Z2luQ29sbGVjdGlvbnMiLCJ1c2VBc1RpdGxlIiwiZ3JvdXAiLCJjb2xsZWN0aW9uQWRtaW5Hcm91cCIsImFjY2VzcyIsImN1c3RvbSIsImJldHRlckF1dGhNb2RlbEtleSIsImZpZWxkcyIsInBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMiLCJpbnZpdGF0aW9ucyJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsVUFBVSxRQUFRLGtCQUFpQjtBQUM1QyxTQUFTQyxjQUFjLFFBQVEsaUNBQWdDO0FBQy9ELFNBQVNDLG1CQUFtQixRQUFRLDZDQUE0QztBQUNoRixTQUFTQyxxQkFBcUIsRUFBRUMsdUJBQXVCLEVBQUVDLGtCQUFrQixRQUFRLDRCQUEyQjtBQU05RyxPQUFPLFNBQVNDLDJCQUEyQixFQUFFQyxtQkFBbUIsRUFBRUMsYUFBYSxFQUFFQyxlQUFlLEVBQXdCO0lBQ3RILE1BQU1DLGlCQUFpQk4sd0JBQXdCSyxpQkFBaUJULFdBQVdXLFVBQVU7SUFDckYsTUFBTUMsbUJBQW1CSCxlQUFlLENBQUNULFdBQVdXLFVBQVUsQ0FBQztJQUMvRCxNQUFNRSwrQkFBK0JOLG9CQUFvQk8sSUFBSSxDQUFDLENBQUNDLGFBQWVBLFdBQVdDLElBQUksS0FBS047SUFJbEcsTUFBTU8saUJBQW1EO1FBQ3ZEQyxPQUFPLElBQU8sQ0FBQTtnQkFDWkMsT0FBTztnQkFDUEMsT0FBTztvQkFBRUMsVUFBVTtvQkFBTUMsYUFBYTtnQkFBdUM7WUFDL0UsQ0FBQTtRQUNBQyxXQUFXLElBQU8sQ0FBQTtnQkFDaEJILE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQWlDO1lBQ3pFLENBQUE7UUFDQUUsUUFBUSxJQUFPLENBQUE7Z0JBQ2JMLE9BQU87Z0JBQ1BDLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQThDO1lBQ3RGLENBQUE7UUFDQUcsZ0JBQWdCLElBQU8sQ0FBQTtnQkFDckJOLE9BQU87Z0JBQ1BDLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQXNEO1lBQzlGLENBQUE7UUFDQUksTUFBTSxJQUFPLENBQUE7Z0JBQ1hOLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQXNDO1lBQzlFLENBQUE7UUFDQUssUUFBUSxJQUFPLENBQUE7Z0JBQ2JDLGNBQWM7Z0JBQ2RSLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQWdDO1lBQ3hFLENBQUE7UUFDQU8sV0FBVyxJQUFPLENBQUE7Z0JBQ2hCVCxPQUFPO29CQUFFQyxVQUFVO29CQUFNQyxhQUFhO2dCQUFxRDtZQUM3RixDQUFBO0lBQ0Y7SUFFQSxNQUFNUSxtQkFBbUI1QixvQkFBb0I7UUFDM0M2QixRQUFRbkI7UUFDUm9CLHNCQUFzQmY7SUFDeEI7SUFFQSxJQUFJZ0IsdUJBQXlDO1FBQzNDLEdBQUdwQiw0QkFBNEI7UUFDL0JHLE1BQU1OO1FBQ05VLE9BQU87WUFDTGMsUUFBUTFCLGNBQWMyQixxQkFBcUIsSUFBSTtZQUMvQ0MsWUFBWS9CLG1CQUFtQkksaUJBQWlCVCxXQUFXVyxVQUFVLEVBQUU7WUFDdkVXLGFBQWE7WUFDYmUsT0FBTzdCLGVBQWU4Qix3QkFBd0I7WUFDOUMsR0FBR3pCLDhCQUE4Qk8sS0FBSztRQUN4QztRQUNBbUIsUUFBUTtZQUNOLEdBQUd0QyxlQUFlTyxjQUFjO1lBQ2hDLEdBQUlLLDhCQUE4QjBCLFVBQVUsQ0FBQyxDQUFDO1FBQ2hEO1FBQ0FDLFFBQVE7WUFDTixHQUFJM0IsOEJBQThCMkIsVUFBVSxDQUFDLENBQUM7WUFDOUNDLG9CQUFvQnpDLFdBQVdXLFVBQVU7UUFDM0M7UUFDQStCLFFBQVE7ZUFBSzdCLDhCQUE4QjZCLFVBQVUsRUFBRTtlQUFPWixvQkFBb0IsRUFBRTtTQUFFO0lBQ3hGO0lBRUEsSUFBSSxPQUFPdEIsY0FBY21DLHlCQUF5QixFQUFFQyxnQkFBZ0IsWUFBWTtRQUM5RVgsdUJBQXVCekIsY0FBY21DLHlCQUF5QixDQUFDQyxXQUFXLENBQUM7WUFDekU3QixZQUFZa0I7UUFDZDtJQUNGO0lBRUE5QixzQkFBc0I4QixzQkFBc0JyQjtJQUU1QyxPQUFPcUI7QUFDVCJ9