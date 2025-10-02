import { isAdminWithRoles } from "../utils/payload-access";
import { generateAdminInviteUrl } from "../../../payload/utils/generate-admin-invite-url";
import { getUrlBeforeChangeHook } from "./hooks/get-url-before-change";
import { getAdminInviteUrlAfterReadHook } from "./hooks/get-url-after-read";
import { baseSlugs, defaults } from "../../../constants";
export function buildAdminInvitationsCollection({ incomingCollections, pluginOptions }) {
    const generateAdminInviteUrlFn = pluginOptions.adminInvitations?.generateInviteUrl ?? generateAdminInviteUrl;
    const adminInvitationSlug = pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations;
    const adminRoles = pluginOptions.users?.adminRoles ?? [
        defaults.adminRole
    ];
    const roles = pluginOptions.users?.roles ?? [
        defaults.userRole
    ];
    const allRoleOptions = [
        ...new Set([
            ...adminRoles,
            ...roles
        ])
    ].map((role)=>({
            label: role.split(/[-_\s]/).map((word)=>word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            value: role
        }));
    const existingAdminInvitationCollection = incomingCollections.find((collection)=>collection.slug === adminInvitationSlug);
    let adminInvitationsCollection = {
        ...existingAdminInvitationCollection,
        slug: adminInvitationSlug,
        admin: {
            defaultColumns: [
                'role',
                'token',
                'url'
            ],
            useAsTitle: 'token',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            hidden: pluginOptions.adminInvitations?.hidden,
            ...existingAdminInvitationCollection?.admin
        },
        access: {
            create: isAdminWithRoles({
                adminRoles
            }),
            read: isAdminWithRoles({
                adminRoles
            }),
            delete: isAdminWithRoles({
                adminRoles
            }),
            update: isAdminWithRoles({
                adminRoles
            }),
            ...existingAdminInvitationCollection?.access ?? {}
        },
        timestamps: true,
        fields: [
            {
                label: 'Role',
                name: 'role',
                type: 'select',
                options: allRoleOptions,
                required: true,
                defaultValue: pluginOptions.users?.defaultAdminRole ?? defaults.adminRole
            },
            {
                name: 'token',
                label: 'Token',
                index: true,
                type: 'text',
                admin: {
                    readOnly: true,
                    components: {
                        afterInput: [
                            {
                                path: 'payload-auth/shared/payload/fields#GenerateUuidButton'
                            }
                        ]
                    }
                },
                required: true
            },
            {
                name: 'url',
                label: 'URL',
                type: 'text',
                hooks: {
                    beforeChange: [
                        getUrlBeforeChangeHook()
                    ],
                    afterRead: [
                        getAdminInviteUrlAfterReadHook({
                            generateAdminInviteUrlFn
                        })
                    ]
                },
                admin: {
                    readOnly: true,
                    components: {
                        afterInput: [
                            {
                                path: 'payload-auth/shared/payload/fields#FieldCopyButton'
                            }
                        ]
                    }
                },
                virtual: true
            }
        ]
    };
    if (pluginOptions.adminInvitations?.collectionOverrides) {
        adminInvitationsCollection = pluginOptions.adminInvitations.collectionOverrides({
            collection: adminInvitationsCollection
        });
    }
    return adminInvitationsCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL2FkbWluLWludml0YXRpb25zL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzQWRtaW5XaXRoUm9sZXMgfSBmcm9tICcuLi91dGlscy9wYXlsb2FkLWFjY2VzcydcbmltcG9ydCB7IGdlbmVyYXRlQWRtaW5JbnZpdGVVcmwgfSBmcm9tICcuLi8uLi8uLi9wYXlsb2FkL3V0aWxzL2dlbmVyYXRlLWFkbWluLWludml0ZS11cmwnXG5pbXBvcnQgeyBnZXRVcmxCZWZvcmVDaGFuZ2VIb29rIH0gZnJvbSAnLi9ob29rcy9nZXQtdXJsLWJlZm9yZS1jaGFuZ2UnXG5pbXBvcnQgeyBnZXRBZG1pbkludml0ZVVybEFmdGVyUmVhZEhvb2sgfSBmcm9tICcuL2hvb2tzL2dldC11cmwtYWZ0ZXItcmVhZCdcbmltcG9ydCB7IGJhc2VTbHVncywgZGVmYXVsdHMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9jb25zdGFudHMnXG5cbmltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgdHlwZSB7IEJldHRlckF1dGhQbHVnaW5PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vdHlwZXMnXG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEFkbWluSW52aXRhdGlvbnNDb2xsZWN0aW9uKHtcbiAgaW5jb21pbmdDb2xsZWN0aW9ucyxcbiAgcGx1Z2luT3B0aW9uc1xufToge1xuICBpbmNvbWluZ0NvbGxlY3Rpb25zOiBDb2xsZWN0aW9uQ29uZmlnW11cbiAgcGx1Z2luT3B0aW9uczogQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnNcbn0pOiBDb2xsZWN0aW9uQ29uZmlnIHtcbiAgY29uc3QgZ2VuZXJhdGVBZG1pbkludml0ZVVybEZuID0gcGx1Z2luT3B0aW9ucy5hZG1pbkludml0YXRpb25zPy5nZW5lcmF0ZUludml0ZVVybCA/PyBnZW5lcmF0ZUFkbWluSW52aXRlVXJsXG4gIGNvbnN0IGFkbWluSW52aXRhdGlvblNsdWcgPSBwbHVnaW5PcHRpb25zLmFkbWluSW52aXRhdGlvbnM/LnNsdWcgPz8gYmFzZVNsdWdzLmFkbWluSW52aXRhdGlvbnNcbiAgY29uc3QgYWRtaW5Sb2xlcyA9IHBsdWdpbk9wdGlvbnMudXNlcnM/LmFkbWluUm9sZXMgPz8gW2RlZmF1bHRzLmFkbWluUm9sZV1cbiAgY29uc3Qgcm9sZXMgPSBwbHVnaW5PcHRpb25zLnVzZXJzPy5yb2xlcyA/PyBbZGVmYXVsdHMudXNlclJvbGVdXG4gIGNvbnN0IGFsbFJvbGVPcHRpb25zID0gWy4uLm5ldyBTZXQoWy4uLmFkbWluUm9sZXMsIC4uLnJvbGVzXSldLm1hcCgocm9sZSkgPT4gKHtcbiAgICBsYWJlbDogcm9sZVxuICAgICAgLnNwbGl0KC9bLV9cXHNdLylcbiAgICAgIC5tYXAoKHdvcmQpID0+IHdvcmQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB3b3JkLnNsaWNlKDEpKVxuICAgICAgLmpvaW4oJyAnKSxcbiAgICB2YWx1ZTogcm9sZVxuICB9KSlcbiAgY29uc3QgZXhpc3RpbmdBZG1pbkludml0YXRpb25Db2xsZWN0aW9uID0gaW5jb21pbmdDb2xsZWN0aW9ucy5maW5kKChjb2xsZWN0aW9uKSA9PiBjb2xsZWN0aW9uLnNsdWcgPT09IGFkbWluSW52aXRhdGlvblNsdWcpIGFzXG4gICAgfCBDb2xsZWN0aW9uQ29uZmlnXG4gICAgfCB1bmRlZmluZWRcblxuICBsZXQgYWRtaW5JbnZpdGF0aW9uc0NvbGxlY3Rpb246IENvbGxlY3Rpb25Db25maWcgPSB7XG4gICAgLi4uZXhpc3RpbmdBZG1pbkludml0YXRpb25Db2xsZWN0aW9uLFxuICAgIHNsdWc6IGFkbWluSW52aXRhdGlvblNsdWcsXG4gICAgYWRtaW46IHtcbiAgICAgIGRlZmF1bHRDb2x1bW5zOiBbJ3JvbGUnLCAndG9rZW4nLCAndXJsJ10sXG4gICAgICB1c2VBc1RpdGxlOiAndG9rZW4nLFxuICAgICAgZ3JvdXA6IHBsdWdpbk9wdGlvbnM/LmNvbGxlY3Rpb25BZG1pbkdyb3VwID8/ICdBdXRoJyxcbiAgICAgIGhpZGRlbjogcGx1Z2luT3B0aW9ucy5hZG1pbkludml0YXRpb25zPy5oaWRkZW4sXG4gICAgICAuLi5leGlzdGluZ0FkbWluSW52aXRhdGlvbkNvbGxlY3Rpb24/LmFkbWluXG4gICAgfSxcbiAgICBhY2Nlc3M6IHtcbiAgICAgIGNyZWF0ZTogaXNBZG1pbldpdGhSb2xlcyh7IGFkbWluUm9sZXMgfSksXG4gICAgICByZWFkOiBpc0FkbWluV2l0aFJvbGVzKHsgYWRtaW5Sb2xlcyB9KSxcbiAgICAgIGRlbGV0ZTogaXNBZG1pbldpdGhSb2xlcyh7IGFkbWluUm9sZXMgfSksXG4gICAgICB1cGRhdGU6IGlzQWRtaW5XaXRoUm9sZXMoeyBhZG1pblJvbGVzIH0pLFxuICAgICAgLi4uKGV4aXN0aW5nQWRtaW5JbnZpdGF0aW9uQ29sbGVjdGlvbj8uYWNjZXNzID8/IHt9KVxuICAgIH0sXG4gICAgdGltZXN0YW1wczogdHJ1ZSxcbiAgICBmaWVsZHM6IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdSb2xlJyxcbiAgICAgICAgbmFtZTogJ3JvbGUnLFxuICAgICAgICB0eXBlOiAnc2VsZWN0JyxcbiAgICAgICAgb3B0aW9uczogYWxsUm9sZU9wdGlvbnMsXG4gICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICBkZWZhdWx0VmFsdWU6IHBsdWdpbk9wdGlvbnMudXNlcnM/LmRlZmF1bHRBZG1pblJvbGUgPz8gZGVmYXVsdHMuYWRtaW5Sb2xlXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAndG9rZW4nLFxuICAgICAgICBsYWJlbDogJ1Rva2VuJyxcbiAgICAgICAgaW5kZXg6IHRydWUsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgYWRtaW46IHtcbiAgICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgICBjb21wb25lbnRzOiB7XG4gICAgICAgICAgICBhZnRlcklucHV0OiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBwYXRoOiAncGF5bG9hZC1hdXRoL3NoYXJlZC9wYXlsb2FkL2ZpZWxkcyNHZW5lcmF0ZVV1aWRCdXR0b24nXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHJlcXVpcmVkOiB0cnVlXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAndXJsJyxcbiAgICAgICAgbGFiZWw6ICdVUkwnLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGhvb2tzOiB7XG4gICAgICAgICAgYmVmb3JlQ2hhbmdlOiBbZ2V0VXJsQmVmb3JlQ2hhbmdlSG9vaygpXSxcbiAgICAgICAgICBhZnRlclJlYWQ6IFtcbiAgICAgICAgICAgIGdldEFkbWluSW52aXRlVXJsQWZ0ZXJSZWFkSG9vayh7XG4gICAgICAgICAgICAgIGdlbmVyYXRlQWRtaW5JbnZpdGVVcmxGblxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIGFkbWluOiB7XG4gICAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgICAgY29tcG9uZW50czoge1xuICAgICAgICAgICAgYWZ0ZXJJbnB1dDogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcGF0aDogJ3BheWxvYWQtYXV0aC9zaGFyZWQvcGF5bG9hZC9maWVsZHMjRmllbGRDb3B5QnV0dG9uJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB2aXJ0dWFsOiB0cnVlXG4gICAgICB9XG4gICAgXVxuICB9XG5cbiAgaWYgKHBsdWdpbk9wdGlvbnMuYWRtaW5JbnZpdGF0aW9ucz8uY29sbGVjdGlvbk92ZXJyaWRlcykge1xuICAgIGFkbWluSW52aXRhdGlvbnNDb2xsZWN0aW9uID0gcGx1Z2luT3B0aW9ucy5hZG1pbkludml0YXRpb25zLmNvbGxlY3Rpb25PdmVycmlkZXMoe1xuICAgICAgY29sbGVjdGlvbjogYWRtaW5JbnZpdGF0aW9uc0NvbGxlY3Rpb25cbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIGFkbWluSW52aXRhdGlvbnNDb2xsZWN0aW9uXG59XG4iXSwibmFtZXMiOlsiaXNBZG1pbldpdGhSb2xlcyIsImdlbmVyYXRlQWRtaW5JbnZpdGVVcmwiLCJnZXRVcmxCZWZvcmVDaGFuZ2VIb29rIiwiZ2V0QWRtaW5JbnZpdGVVcmxBZnRlclJlYWRIb29rIiwiYmFzZVNsdWdzIiwiZGVmYXVsdHMiLCJidWlsZEFkbWluSW52aXRhdGlvbnNDb2xsZWN0aW9uIiwiaW5jb21pbmdDb2xsZWN0aW9ucyIsInBsdWdpbk9wdGlvbnMiLCJnZW5lcmF0ZUFkbWluSW52aXRlVXJsRm4iLCJhZG1pbkludml0YXRpb25zIiwiZ2VuZXJhdGVJbnZpdGVVcmwiLCJhZG1pbkludml0YXRpb25TbHVnIiwic2x1ZyIsImFkbWluUm9sZXMiLCJ1c2VycyIsImFkbWluUm9sZSIsInJvbGVzIiwidXNlclJvbGUiLCJhbGxSb2xlT3B0aW9ucyIsIlNldCIsIm1hcCIsInJvbGUiLCJsYWJlbCIsInNwbGl0Iiwid29yZCIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJqb2luIiwidmFsdWUiLCJleGlzdGluZ0FkbWluSW52aXRhdGlvbkNvbGxlY3Rpb24iLCJmaW5kIiwiY29sbGVjdGlvbiIsImFkbWluSW52aXRhdGlvbnNDb2xsZWN0aW9uIiwiYWRtaW4iLCJkZWZhdWx0Q29sdW1ucyIsInVzZUFzVGl0bGUiLCJncm91cCIsImNvbGxlY3Rpb25BZG1pbkdyb3VwIiwiaGlkZGVuIiwiYWNjZXNzIiwiY3JlYXRlIiwicmVhZCIsImRlbGV0ZSIsInVwZGF0ZSIsInRpbWVzdGFtcHMiLCJmaWVsZHMiLCJuYW1lIiwidHlwZSIsIm9wdGlvbnMiLCJyZXF1aXJlZCIsImRlZmF1bHRWYWx1ZSIsImRlZmF1bHRBZG1pblJvbGUiLCJpbmRleCIsInJlYWRPbmx5IiwiY29tcG9uZW50cyIsImFmdGVySW5wdXQiLCJwYXRoIiwiaG9va3MiLCJiZWZvcmVDaGFuZ2UiLCJhZnRlclJlYWQiLCJ2aXJ0dWFsIiwiY29sbGVjdGlvbk92ZXJyaWRlcyJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsZ0JBQWdCLFFBQVEsMEJBQXlCO0FBQzFELFNBQVNDLHNCQUFzQixRQUFRLG1EQUFrRDtBQUN6RixTQUFTQyxzQkFBc0IsUUFBUSxnQ0FBK0I7QUFDdEUsU0FBU0MsOEJBQThCLFFBQVEsNkJBQTRCO0FBQzNFLFNBQVNDLFNBQVMsRUFBRUMsUUFBUSxRQUFRLHFCQUFnQztBQUtwRSxPQUFPLFNBQVNDLGdDQUFnQyxFQUM5Q0MsbUJBQW1CLEVBQ25CQyxhQUFhLEVBSWQ7SUFDQyxNQUFNQywyQkFBMkJELGNBQWNFLGdCQUFnQixFQUFFQyxxQkFBcUJWO0lBQ3RGLE1BQU1XLHNCQUFzQkosY0FBY0UsZ0JBQWdCLEVBQUVHLFFBQVFULFVBQVVNLGdCQUFnQjtJQUM5RixNQUFNSSxhQUFhTixjQUFjTyxLQUFLLEVBQUVELGNBQWM7UUFBQ1QsU0FBU1csU0FBUztLQUFDO0lBQzFFLE1BQU1DLFFBQVFULGNBQWNPLEtBQUssRUFBRUUsU0FBUztRQUFDWixTQUFTYSxRQUFRO0tBQUM7SUFDL0QsTUFBTUMsaUJBQWlCO1dBQUksSUFBSUMsSUFBSTtlQUFJTjtlQUFlRztTQUFNO0tBQUUsQ0FBQ0ksR0FBRyxDQUFDLENBQUNDLE9BQVUsQ0FBQTtZQUM1RUMsT0FBT0QsS0FDSkUsS0FBSyxDQUFDLFVBQ05ILEdBQUcsQ0FBQyxDQUFDSSxPQUFTQSxLQUFLQyxNQUFNLENBQUMsR0FBR0MsV0FBVyxLQUFLRixLQUFLRyxLQUFLLENBQUMsSUFDeERDLElBQUksQ0FBQztZQUNSQyxPQUFPUjtRQUNULENBQUE7SUFDQSxNQUFNUyxvQ0FBb0N4QixvQkFBb0J5QixJQUFJLENBQUMsQ0FBQ0MsYUFBZUEsV0FBV3BCLElBQUksS0FBS0Q7SUFJdkcsSUFBSXNCLDZCQUErQztRQUNqRCxHQUFHSCxpQ0FBaUM7UUFDcENsQixNQUFNRDtRQUNOdUIsT0FBTztZQUNMQyxnQkFBZ0I7Z0JBQUM7Z0JBQVE7Z0JBQVM7YUFBTTtZQUN4Q0MsWUFBWTtZQUNaQyxPQUFPOUIsZUFBZStCLHdCQUF3QjtZQUM5Q0MsUUFBUWhDLGNBQWNFLGdCQUFnQixFQUFFOEI7WUFDeEMsR0FBR1QsbUNBQW1DSSxLQUFLO1FBQzdDO1FBQ0FNLFFBQVE7WUFDTkMsUUFBUTFDLGlCQUFpQjtnQkFBRWM7WUFBVztZQUN0QzZCLE1BQU0zQyxpQkFBaUI7Z0JBQUVjO1lBQVc7WUFDcEM4QixRQUFRNUMsaUJBQWlCO2dCQUFFYztZQUFXO1lBQ3RDK0IsUUFBUTdDLGlCQUFpQjtnQkFBRWM7WUFBVztZQUN0QyxHQUFJaUIsbUNBQW1DVSxVQUFVLENBQUMsQ0FBQztRQUNyRDtRQUNBSyxZQUFZO1FBQ1pDLFFBQVE7WUFDTjtnQkFDRXhCLE9BQU87Z0JBQ1B5QixNQUFNO2dCQUNOQyxNQUFNO2dCQUNOQyxTQUFTL0I7Z0JBQ1RnQyxVQUFVO2dCQUNWQyxjQUFjNUMsY0FBY08sS0FBSyxFQUFFc0Msb0JBQW9CaEQsU0FBU1csU0FBUztZQUMzRTtZQUNBO2dCQUNFZ0MsTUFBTTtnQkFDTnpCLE9BQU87Z0JBQ1ArQixPQUFPO2dCQUNQTCxNQUFNO2dCQUNOZCxPQUFPO29CQUNMb0IsVUFBVTtvQkFDVkMsWUFBWTt3QkFDVkMsWUFBWTs0QkFDVjtnQ0FDRUMsTUFBTTs0QkFDUjt5QkFDRDtvQkFDSDtnQkFDRjtnQkFDQVAsVUFBVTtZQUNaO1lBQ0E7Z0JBQ0VILE1BQU07Z0JBQ056QixPQUFPO2dCQUNQMEIsTUFBTTtnQkFDTlUsT0FBTztvQkFDTEMsY0FBYzt3QkFBQzFEO3FCQUF5QjtvQkFDeEMyRCxXQUFXO3dCQUNUMUQsK0JBQStCOzRCQUM3Qk07d0JBQ0Y7cUJBQ0Q7Z0JBQ0g7Z0JBQ0EwQixPQUFPO29CQUNMb0IsVUFBVTtvQkFDVkMsWUFBWTt3QkFDVkMsWUFBWTs0QkFDVjtnQ0FDRUMsTUFBTTs0QkFDUjt5QkFDRDtvQkFDSDtnQkFDRjtnQkFDQUksU0FBUztZQUNYO1NBQ0Q7SUFDSDtJQUVBLElBQUl0RCxjQUFjRSxnQkFBZ0IsRUFBRXFELHFCQUFxQjtRQUN2RDdCLDZCQUE2QjFCLGNBQWNFLGdCQUFnQixDQUFDcUQsbUJBQW1CLENBQUM7WUFDOUU5QixZQUFZQztRQUNkO0lBQ0Y7SUFFQSxPQUFPQTtBQUNUIn0=