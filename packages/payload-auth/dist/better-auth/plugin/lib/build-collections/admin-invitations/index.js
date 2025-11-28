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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL2FkbWluLWludml0YXRpb25zL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzQWRtaW5XaXRoUm9sZXMgfSBmcm9tICcuLi91dGlscy9wYXlsb2FkLWFjY2VzcydcbmltcG9ydCB7IGdlbmVyYXRlQWRtaW5JbnZpdGVVcmwgfSBmcm9tICcuLi8uLi8uLi9wYXlsb2FkL3V0aWxzL2dlbmVyYXRlLWFkbWluLWludml0ZS11cmwnXG5pbXBvcnQgeyBnZXRVcmxCZWZvcmVDaGFuZ2VIb29rIH0gZnJvbSAnLi9ob29rcy9nZXQtdXJsLWJlZm9yZS1jaGFuZ2UnXG5pbXBvcnQgeyBnZXRBZG1pbkludml0ZVVybEFmdGVyUmVhZEhvb2sgfSBmcm9tICcuL2hvb2tzL2dldC11cmwtYWZ0ZXItcmVhZCdcbmltcG9ydCB7IGJhc2VTbHVncywgZGVmYXVsdHMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9jb25zdGFudHMnXG5pbXBvcnQgdHlwZSB7IENvbGxlY3Rpb25Db25maWcgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHR5cGUgeyBCZXR0ZXJBdXRoUGx1Z2luT3B0aW9ucyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRBZG1pbkludml0YXRpb25zQ29sbGVjdGlvbih7XG4gIGluY29taW5nQ29sbGVjdGlvbnMsXG4gIHBsdWdpbk9wdGlvbnNcbn06IHtcbiAgaW5jb21pbmdDb2xsZWN0aW9uczogQ29sbGVjdGlvbkNvbmZpZ1tdXG4gIHBsdWdpbk9wdGlvbnM6IEJldHRlckF1dGhQbHVnaW5PcHRpb25zXG59KTogQ29sbGVjdGlvbkNvbmZpZyB7XG4gIGNvbnN0IGdlbmVyYXRlQWRtaW5JbnZpdGVVcmxGbiA9IHBsdWdpbk9wdGlvbnMuYWRtaW5JbnZpdGF0aW9ucz8uZ2VuZXJhdGVJbnZpdGVVcmwgPz8gZ2VuZXJhdGVBZG1pbkludml0ZVVybFxuICBjb25zdCBhZG1pbkludml0YXRpb25TbHVnID0gcGx1Z2luT3B0aW9ucy5hZG1pbkludml0YXRpb25zPy5zbHVnID8/IGJhc2VTbHVncy5hZG1pbkludml0YXRpb25zXG4gIGNvbnN0IGFkbWluUm9sZXMgPSBwbHVnaW5PcHRpb25zLnVzZXJzPy5hZG1pblJvbGVzID8/IFtkZWZhdWx0cy5hZG1pblJvbGVdXG4gIGNvbnN0IHJvbGVzID0gcGx1Z2luT3B0aW9ucy51c2Vycz8ucm9sZXMgPz8gW2RlZmF1bHRzLnVzZXJSb2xlXVxuICBjb25zdCBhbGxSb2xlT3B0aW9ucyA9IFsuLi5uZXcgU2V0KFsuLi5hZG1pblJvbGVzLCAuLi5yb2xlc10pXS5tYXAoKHJvbGUpID0+ICh7XG4gICAgbGFiZWw6IHJvbGVcbiAgICAgIC5zcGxpdCgvWy1fXFxzXS8pXG4gICAgICAubWFwKCh3b3JkKSA9PiB3b3JkLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgd29yZC5zbGljZSgxKSlcbiAgICAgIC5qb2luKCcgJyksXG4gICAgdmFsdWU6IHJvbGVcbiAgfSkpXG4gIGNvbnN0IGV4aXN0aW5nQWRtaW5JbnZpdGF0aW9uQ29sbGVjdGlvbiA9IGluY29taW5nQ29sbGVjdGlvbnMuZmluZCgoY29sbGVjdGlvbikgPT4gY29sbGVjdGlvbi5zbHVnID09PSBhZG1pbkludml0YXRpb25TbHVnKSBhc1xuICAgIHwgQ29sbGVjdGlvbkNvbmZpZ1xuICAgIHwgdW5kZWZpbmVkXG5cbiAgbGV0IGFkbWluSW52aXRhdGlvbnNDb2xsZWN0aW9uOiBDb2xsZWN0aW9uQ29uZmlnID0ge1xuICAgIC4uLmV4aXN0aW5nQWRtaW5JbnZpdGF0aW9uQ29sbGVjdGlvbixcbiAgICBzbHVnOiBhZG1pbkludml0YXRpb25TbHVnLFxuICAgIGFkbWluOiB7XG4gICAgICBkZWZhdWx0Q29sdW1uczogWydyb2xlJywgJ3Rva2VuJywgJ3VybCddLFxuICAgICAgdXNlQXNUaXRsZTogJ3Rva2VuJyxcbiAgICAgIGdyb3VwOiBwbHVnaW5PcHRpb25zPy5jb2xsZWN0aW9uQWRtaW5Hcm91cCA/PyAnQXV0aCcsXG4gICAgICBoaWRkZW46IHBsdWdpbk9wdGlvbnMuYWRtaW5JbnZpdGF0aW9ucz8uaGlkZGVuLFxuICAgICAgLi4uZXhpc3RpbmdBZG1pbkludml0YXRpb25Db2xsZWN0aW9uPy5hZG1pblxuICAgIH0sXG4gICAgYWNjZXNzOiB7XG4gICAgICBjcmVhdGU6IGlzQWRtaW5XaXRoUm9sZXMoeyBhZG1pblJvbGVzIH0pLFxuICAgICAgcmVhZDogaXNBZG1pbldpdGhSb2xlcyh7IGFkbWluUm9sZXMgfSksXG4gICAgICBkZWxldGU6IGlzQWRtaW5XaXRoUm9sZXMoeyBhZG1pblJvbGVzIH0pLFxuICAgICAgdXBkYXRlOiBpc0FkbWluV2l0aFJvbGVzKHsgYWRtaW5Sb2xlcyB9KSxcbiAgICAgIC4uLihleGlzdGluZ0FkbWluSW52aXRhdGlvbkNvbGxlY3Rpb24/LmFjY2VzcyA/PyB7fSlcbiAgICB9LFxuICAgIHRpbWVzdGFtcHM6IHRydWUsXG4gICAgZmllbGRzOiBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnUm9sZScsXG4gICAgICAgIG5hbWU6ICdyb2xlJyxcbiAgICAgICAgdHlwZTogJ3NlbGVjdCcsXG4gICAgICAgIG9wdGlvbnM6IGFsbFJvbGVPcHRpb25zLFxuICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgZGVmYXVsdFZhbHVlOiBwbHVnaW5PcHRpb25zLnVzZXJzPy5kZWZhdWx0QWRtaW5Sb2xlID8/IGRlZmF1bHRzLmFkbWluUm9sZVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3Rva2VuJyxcbiAgICAgICAgbGFiZWw6ICdUb2tlbicsXG4gICAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGFkbWluOiB7XG4gICAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgICAgY29tcG9uZW50czoge1xuICAgICAgICAgICAgYWZ0ZXJJbnB1dDogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcGF0aDogJ3BheWxvYWQtYXV0aC9zaGFyZWQvcGF5bG9hZC9maWVsZHMjR2VuZXJhdGVVdWlkQnV0dG9uJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByZXF1aXJlZDogdHJ1ZVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3VybCcsXG4gICAgICAgIGxhYmVsOiAnVVJMJyxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBob29rczoge1xuICAgICAgICAgIGJlZm9yZUNoYW5nZTogW2dldFVybEJlZm9yZUNoYW5nZUhvb2soKV0sXG4gICAgICAgICAgYWZ0ZXJSZWFkOiBbXG4gICAgICAgICAgICBnZXRBZG1pbkludml0ZVVybEFmdGVyUmVhZEhvb2soe1xuICAgICAgICAgICAgICBnZW5lcmF0ZUFkbWluSW52aXRlVXJsRm5cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBhZG1pbjoge1xuICAgICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICAgIGNvbXBvbmVudHM6IHtcbiAgICAgICAgICAgIGFmdGVySW5wdXQ6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHBhdGg6ICdwYXlsb2FkLWF1dGgvc2hhcmVkL3BheWxvYWQvZmllbGRzI0ZpZWxkQ29weUJ1dHRvbidcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdmlydHVhbDogdHJ1ZVxuICAgICAgfVxuICAgIF1cbiAgfVxuXG4gIGlmIChwbHVnaW5PcHRpb25zLmFkbWluSW52aXRhdGlvbnM/LmNvbGxlY3Rpb25PdmVycmlkZXMpIHtcbiAgICBhZG1pbkludml0YXRpb25zQ29sbGVjdGlvbiA9IHBsdWdpbk9wdGlvbnMuYWRtaW5JbnZpdGF0aW9ucy5jb2xsZWN0aW9uT3ZlcnJpZGVzKHtcbiAgICAgIGNvbGxlY3Rpb246IGFkbWluSW52aXRhdGlvbnNDb2xsZWN0aW9uXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiBhZG1pbkludml0YXRpb25zQ29sbGVjdGlvblxufVxuIl0sIm5hbWVzIjpbImlzQWRtaW5XaXRoUm9sZXMiLCJnZW5lcmF0ZUFkbWluSW52aXRlVXJsIiwiZ2V0VXJsQmVmb3JlQ2hhbmdlSG9vayIsImdldEFkbWluSW52aXRlVXJsQWZ0ZXJSZWFkSG9vayIsImJhc2VTbHVncyIsImRlZmF1bHRzIiwiYnVpbGRBZG1pbkludml0YXRpb25zQ29sbGVjdGlvbiIsImluY29taW5nQ29sbGVjdGlvbnMiLCJwbHVnaW5PcHRpb25zIiwiZ2VuZXJhdGVBZG1pbkludml0ZVVybEZuIiwiYWRtaW5JbnZpdGF0aW9ucyIsImdlbmVyYXRlSW52aXRlVXJsIiwiYWRtaW5JbnZpdGF0aW9uU2x1ZyIsInNsdWciLCJhZG1pblJvbGVzIiwidXNlcnMiLCJhZG1pblJvbGUiLCJyb2xlcyIsInVzZXJSb2xlIiwiYWxsUm9sZU9wdGlvbnMiLCJTZXQiLCJtYXAiLCJyb2xlIiwibGFiZWwiLCJzcGxpdCIsIndvcmQiLCJjaGFyQXQiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwiam9pbiIsInZhbHVlIiwiZXhpc3RpbmdBZG1pbkludml0YXRpb25Db2xsZWN0aW9uIiwiZmluZCIsImNvbGxlY3Rpb24iLCJhZG1pbkludml0YXRpb25zQ29sbGVjdGlvbiIsImFkbWluIiwiZGVmYXVsdENvbHVtbnMiLCJ1c2VBc1RpdGxlIiwiZ3JvdXAiLCJjb2xsZWN0aW9uQWRtaW5Hcm91cCIsImhpZGRlbiIsImFjY2VzcyIsImNyZWF0ZSIsInJlYWQiLCJkZWxldGUiLCJ1cGRhdGUiLCJ0aW1lc3RhbXBzIiwiZmllbGRzIiwibmFtZSIsInR5cGUiLCJvcHRpb25zIiwicmVxdWlyZWQiLCJkZWZhdWx0VmFsdWUiLCJkZWZhdWx0QWRtaW5Sb2xlIiwiaW5kZXgiLCJyZWFkT25seSIsImNvbXBvbmVudHMiLCJhZnRlcklucHV0IiwicGF0aCIsImhvb2tzIiwiYmVmb3JlQ2hhbmdlIiwiYWZ0ZXJSZWFkIiwidmlydHVhbCIsImNvbGxlY3Rpb25PdmVycmlkZXMiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLGdCQUFnQixRQUFRLDBCQUF5QjtBQUMxRCxTQUFTQyxzQkFBc0IsUUFBUSxtREFBa0Q7QUFDekYsU0FBU0Msc0JBQXNCLFFBQVEsZ0NBQStCO0FBQ3RFLFNBQVNDLDhCQUE4QixRQUFRLDZCQUE0QjtBQUMzRSxTQUFTQyxTQUFTLEVBQUVDLFFBQVEsUUFBUSxxQkFBZ0M7QUFJcEUsT0FBTyxTQUFTQyxnQ0FBZ0MsRUFDOUNDLG1CQUFtQixFQUNuQkMsYUFBYSxFQUlkO0lBQ0MsTUFBTUMsMkJBQTJCRCxjQUFjRSxnQkFBZ0IsRUFBRUMscUJBQXFCVjtJQUN0RixNQUFNVyxzQkFBc0JKLGNBQWNFLGdCQUFnQixFQUFFRyxRQUFRVCxVQUFVTSxnQkFBZ0I7SUFDOUYsTUFBTUksYUFBYU4sY0FBY08sS0FBSyxFQUFFRCxjQUFjO1FBQUNULFNBQVNXLFNBQVM7S0FBQztJQUMxRSxNQUFNQyxRQUFRVCxjQUFjTyxLQUFLLEVBQUVFLFNBQVM7UUFBQ1osU0FBU2EsUUFBUTtLQUFDO0lBQy9ELE1BQU1DLGlCQUFpQjtXQUFJLElBQUlDLElBQUk7ZUFBSU47ZUFBZUc7U0FBTTtLQUFFLENBQUNJLEdBQUcsQ0FBQyxDQUFDQyxPQUFVLENBQUE7WUFDNUVDLE9BQU9ELEtBQ0pFLEtBQUssQ0FBQyxVQUNOSCxHQUFHLENBQUMsQ0FBQ0ksT0FBU0EsS0FBS0MsTUFBTSxDQUFDLEdBQUdDLFdBQVcsS0FBS0YsS0FBS0csS0FBSyxDQUFDLElBQ3hEQyxJQUFJLENBQUM7WUFDUkMsT0FBT1I7UUFDVCxDQUFBO0lBQ0EsTUFBTVMsb0NBQW9DeEIsb0JBQW9CeUIsSUFBSSxDQUFDLENBQUNDLGFBQWVBLFdBQVdwQixJQUFJLEtBQUtEO0lBSXZHLElBQUlzQiw2QkFBK0M7UUFDakQsR0FBR0gsaUNBQWlDO1FBQ3BDbEIsTUFBTUQ7UUFDTnVCLE9BQU87WUFDTEMsZ0JBQWdCO2dCQUFDO2dCQUFRO2dCQUFTO2FBQU07WUFDeENDLFlBQVk7WUFDWkMsT0FBTzlCLGVBQWUrQix3QkFBd0I7WUFDOUNDLFFBQVFoQyxjQUFjRSxnQkFBZ0IsRUFBRThCO1lBQ3hDLEdBQUdULG1DQUFtQ0ksS0FBSztRQUM3QztRQUNBTSxRQUFRO1lBQ05DLFFBQVExQyxpQkFBaUI7Z0JBQUVjO1lBQVc7WUFDdEM2QixNQUFNM0MsaUJBQWlCO2dCQUFFYztZQUFXO1lBQ3BDOEIsUUFBUTVDLGlCQUFpQjtnQkFBRWM7WUFBVztZQUN0QytCLFFBQVE3QyxpQkFBaUI7Z0JBQUVjO1lBQVc7WUFDdEMsR0FBSWlCLG1DQUFtQ1UsVUFBVSxDQUFDLENBQUM7UUFDckQ7UUFDQUssWUFBWTtRQUNaQyxRQUFRO1lBQ047Z0JBQ0V4QixPQUFPO2dCQUNQeUIsTUFBTTtnQkFDTkMsTUFBTTtnQkFDTkMsU0FBUy9CO2dCQUNUZ0MsVUFBVTtnQkFDVkMsY0FBYzVDLGNBQWNPLEtBQUssRUFBRXNDLG9CQUFvQmhELFNBQVNXLFNBQVM7WUFDM0U7WUFDQTtnQkFDRWdDLE1BQU07Z0JBQ056QixPQUFPO2dCQUNQK0IsT0FBTztnQkFDUEwsTUFBTTtnQkFDTmQsT0FBTztvQkFDTG9CLFVBQVU7b0JBQ1ZDLFlBQVk7d0JBQ1ZDLFlBQVk7NEJBQ1Y7Z0NBQ0VDLE1BQU07NEJBQ1I7eUJBQ0Q7b0JBQ0g7Z0JBQ0Y7Z0JBQ0FQLFVBQVU7WUFDWjtZQUNBO2dCQUNFSCxNQUFNO2dCQUNOekIsT0FBTztnQkFDUDBCLE1BQU07Z0JBQ05VLE9BQU87b0JBQ0xDLGNBQWM7d0JBQUMxRDtxQkFBeUI7b0JBQ3hDMkQsV0FBVzt3QkFDVDFELCtCQUErQjs0QkFDN0JNO3dCQUNGO3FCQUNEO2dCQUNIO2dCQUNBMEIsT0FBTztvQkFDTG9CLFVBQVU7b0JBQ1ZDLFlBQVk7d0JBQ1ZDLFlBQVk7NEJBQ1Y7Z0NBQ0VDLE1BQU07NEJBQ1I7eUJBQ0Q7b0JBQ0g7Z0JBQ0Y7Z0JBQ0FJLFNBQVM7WUFDWDtTQUNEO0lBQ0g7SUFFQSxJQUFJdEQsY0FBY0UsZ0JBQWdCLEVBQUVxRCxxQkFBcUI7UUFDdkQ3Qiw2QkFBNkIxQixjQUFjRSxnQkFBZ0IsQ0FBQ3FELG1CQUFtQixDQUFDO1lBQzlFOUIsWUFBWUM7UUFDZDtJQUNGO0lBRUEsT0FBT0E7QUFDVCJ9