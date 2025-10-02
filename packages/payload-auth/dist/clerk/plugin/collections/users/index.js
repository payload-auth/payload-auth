import { clerkAuthStrategy } from "../../auth-strategy";
import { getCreateAccess, getDeleteAccess, getReadAccess, getUpdateAccess } from "./access";
import { syncClerkUsersEndpoint } from "./endpoints/sync-from-clerk";
import { clerkWebhookEndpoint } from "./endpoints/webhook/index";
import { clerkUserFields } from "./fields";
import { cookies } from "next/headers";
export function withClerkUsersCollection({ collection = {
    slug: 'users'
}, options, apiBasePath = '/api', adminBasePath = '/admin' }) {
    const userSlug = options.users?.slug ?? 'users';
    const adminRoles = options.users?.adminRoles ?? [
        'admin'
    ];
    let clerkUserCollection = {
        ...collection,
        slug: userSlug,
        admin: {
            useAsTitle: 'email',
            defaultColumns: [
                'email',
                'clerkId',
                'firstName',
                'lastName'
            ],
            hidden: options.users?.hidden ?? false,
            ...collection.admin || {},
            components: {
                Description: {
                    path: 'payload-auth/clerk/admin/ui#SyncClerkUsersButton',
                    clientProps: {
                        userCollectionSlug: userSlug,
                        apiBasePath,
                        adminBasePath
                    }
                }
            }
        },
        fields: [
            ...collection.fields || [],
            ...clerkUserFields
        ],
        auth: {
            ...typeof collection?.auth === 'object' ? collection.auth : {},
            strategies: [
                clerkAuthStrategy(userSlug)
            ]
        },
        access: {
            read: getReadAccess({
                adminRoles
            }),
            create: getCreateAccess({
                adminRoles
            }),
            update: getUpdateAccess({
                adminRoles
            }),
            delete: getDeleteAccess({
                adminRoles
            })
        },
        endpoints: [
            ...collection.endpoints || [],
            clerkWebhookEndpoint({
                userSlug,
                options
            }),
            syncClerkUsersEndpoint({
                userCollectionSlug: userSlug
            })
        ],
        hooks: {
            afterLogout: [
                async ()=>{
                    const cookieStore = await cookies();
                    // Get all cookies and delete any with __session or __clerk in their name
                    const allCookies = cookieStore.getAll();
                    allCookies.forEach((cookie)=>{
                        if (cookie.name.includes('__session') || cookie.name.includes('__clerk')) {
                            cookieStore.delete(cookie.name);
                        }
                    });
                }
            ]
        }
    };
    if (options.users?.collectionOverrides) {
        clerkUserCollection = options.users.collectionOverrides({
            collection: clerkUserCollection
        });
    }
    return clerkUserCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jbGVyay9wbHVnaW4vY29sbGVjdGlvbnMvdXNlcnMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdHlwZSBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB0eXBlIHsgQ2xlcmtQbHVnaW5PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vdHlwZXMnXG5pbXBvcnQgeyBjbGVya0F1dGhTdHJhdGVneSB9IGZyb20gJy4uLy4uL2F1dGgtc3RyYXRlZ3knXG5pbXBvcnQgeyBnZXRDcmVhdGVBY2Nlc3MsIGdldERlbGV0ZUFjY2VzcywgZ2V0UmVhZEFjY2VzcywgZ2V0VXBkYXRlQWNjZXNzIH0gZnJvbSAnLi9hY2Nlc3MnXG5pbXBvcnQgeyBzeW5jQ2xlcmtVc2Vyc0VuZHBvaW50IH0gZnJvbSAnLi9lbmRwb2ludHMvc3luYy1mcm9tLWNsZXJrJ1xuaW1wb3J0IHsgY2xlcmtXZWJob29rRW5kcG9pbnQgfSBmcm9tICcuL2VuZHBvaW50cy93ZWJob29rL2luZGV4J1xuaW1wb3J0IHsgY2xlcmtVc2VyRmllbGRzIH0gZnJvbSAnLi9maWVsZHMnXG5pbXBvcnQgeyBjb29raWVzIH0gZnJvbSAnbmV4dC9oZWFkZXJzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIFdpdGhDbGVya1VzZXJzQ29sbGVjdGlvbk9wdGlvbnMge1xuICBjb2xsZWN0aW9uPzogUGFydGlhbDxDb2xsZWN0aW9uQ29uZmlnPlxuICBvcHRpb25zOiBDbGVya1BsdWdpbk9wdGlvbnNcbiAgYXBpQmFzZVBhdGg/OiBzdHJpbmdcbiAgYWRtaW5CYXNlUGF0aD86IHN0cmluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aENsZXJrVXNlcnNDb2xsZWN0aW9uKHtcbiAgY29sbGVjdGlvbiA9IHsgc2x1ZzogJ3VzZXJzJyB9LFxuICBvcHRpb25zLFxuICBhcGlCYXNlUGF0aCA9ICcvYXBpJyxcbiAgYWRtaW5CYXNlUGF0aCA9ICcvYWRtaW4nXG59OiBXaXRoQ2xlcmtVc2Vyc0NvbGxlY3Rpb25PcHRpb25zKTogQ29sbGVjdGlvbkNvbmZpZyB7XG4gIGNvbnN0IHVzZXJTbHVnID0gb3B0aW9ucy51c2Vycz8uc2x1ZyA/PyAndXNlcnMnXG4gIGNvbnN0IGFkbWluUm9sZXMgPSBvcHRpb25zLnVzZXJzPy5hZG1pblJvbGVzID8/IFsnYWRtaW4nXVxuXG4gIGxldCBjbGVya1VzZXJDb2xsZWN0aW9uOiBDb2xsZWN0aW9uQ29uZmlnID0ge1xuICAgIC4uLmNvbGxlY3Rpb24sXG4gICAgc2x1ZzogdXNlclNsdWcsXG4gICAgYWRtaW46IHtcbiAgICAgIHVzZUFzVGl0bGU6ICdlbWFpbCcsXG4gICAgICBkZWZhdWx0Q29sdW1uczogWydlbWFpbCcsICdjbGVya0lkJywgJ2ZpcnN0TmFtZScsICdsYXN0TmFtZSddLFxuICAgICAgaGlkZGVuOiBvcHRpb25zLnVzZXJzPy5oaWRkZW4gPz8gZmFsc2UsXG4gICAgICAuLi4oY29sbGVjdGlvbi5hZG1pbiB8fCB7fSksXG4gICAgICBjb21wb25lbnRzOiB7XG4gICAgICAgIERlc2NyaXB0aW9uOiB7XG4gICAgICAgICAgcGF0aDogJ3BheWxvYWQtYXV0aC9jbGVyay9hZG1pbi91aSNTeW5jQ2xlcmtVc2Vyc0J1dHRvbicsXG4gICAgICAgICAgY2xpZW50UHJvcHM6IHtcbiAgICAgICAgICAgIHVzZXJDb2xsZWN0aW9uU2x1ZzogdXNlclNsdWcsXG4gICAgICAgICAgICBhcGlCYXNlUGF0aCxcbiAgICAgICAgICAgIGFkbWluQmFzZVBhdGhcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGZpZWxkczogWy4uLihjb2xsZWN0aW9uLmZpZWxkcyB8fCBbXSksIC4uLmNsZXJrVXNlckZpZWxkc10sXG4gICAgYXV0aDoge1xuICAgICAgLi4uKHR5cGVvZiBjb2xsZWN0aW9uPy5hdXRoID09PSAnb2JqZWN0JyA/IGNvbGxlY3Rpb24uYXV0aCA6IHt9KSxcbiAgICAgIHN0cmF0ZWdpZXM6IFtjbGVya0F1dGhTdHJhdGVneSh1c2VyU2x1ZyldXG4gICAgfSxcbiAgICBhY2Nlc3M6IHtcbiAgICAgIHJlYWQ6IGdldFJlYWRBY2Nlc3MoeyBhZG1pblJvbGVzIH0pLFxuICAgICAgY3JlYXRlOiBnZXRDcmVhdGVBY2Nlc3MoeyBhZG1pblJvbGVzIH0pLFxuICAgICAgdXBkYXRlOiBnZXRVcGRhdGVBY2Nlc3MoeyBhZG1pblJvbGVzIH0pLFxuICAgICAgZGVsZXRlOiBnZXREZWxldGVBY2Nlc3MoeyBhZG1pblJvbGVzIH0pXG4gICAgfSxcbiAgICBlbmRwb2ludHM6IFtcbiAgICAgIC4uLihjb2xsZWN0aW9uLmVuZHBvaW50cyB8fCBbXSksXG4gICAgICBjbGVya1dlYmhvb2tFbmRwb2ludCh7IHVzZXJTbHVnLCBvcHRpb25zIH0pLFxuICAgICAgc3luY0NsZXJrVXNlcnNFbmRwb2ludCh7IHVzZXJDb2xsZWN0aW9uU2x1ZzogdXNlclNsdWcgfSlcbiAgICBdLFxuICAgIGhvb2tzOiB7XG4gICAgICBhZnRlckxvZ291dDogW1xuICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgY29va2llU3RvcmUgPSBhd2FpdCBjb29raWVzKClcblxuICAgICAgICAgIC8vIEdldCBhbGwgY29va2llcyBhbmQgZGVsZXRlIGFueSB3aXRoIF9fc2Vzc2lvbiBvciBfX2NsZXJrIGluIHRoZWlyIG5hbWVcbiAgICAgICAgICBjb25zdCBhbGxDb29raWVzID0gY29va2llU3RvcmUuZ2V0QWxsKClcbiAgICAgICAgICBhbGxDb29raWVzLmZvckVhY2goKGNvb2tpZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGNvb2tpZS5uYW1lLmluY2x1ZGVzKCdfX3Nlc3Npb24nKSB8fCBjb29raWUubmFtZS5pbmNsdWRlcygnX19jbGVyaycpKSB7XG4gICAgICAgICAgICAgIGNvb2tpZVN0b3JlLmRlbGV0ZShjb29raWUubmFtZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICB9XG5cbiAgaWYgKG9wdGlvbnMudXNlcnM/LmNvbGxlY3Rpb25PdmVycmlkZXMpIHtcbiAgICBjbGVya1VzZXJDb2xsZWN0aW9uID0gb3B0aW9ucy51c2Vycy5jb2xsZWN0aW9uT3ZlcnJpZGVzKHtcbiAgICAgIGNvbGxlY3Rpb246IGNsZXJrVXNlckNvbGxlY3Rpb25cbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIGNsZXJrVXNlckNvbGxlY3Rpb25cbn1cbiJdLCJuYW1lcyI6WyJjbGVya0F1dGhTdHJhdGVneSIsImdldENyZWF0ZUFjY2VzcyIsImdldERlbGV0ZUFjY2VzcyIsImdldFJlYWRBY2Nlc3MiLCJnZXRVcGRhdGVBY2Nlc3MiLCJzeW5jQ2xlcmtVc2Vyc0VuZHBvaW50IiwiY2xlcmtXZWJob29rRW5kcG9pbnQiLCJjbGVya1VzZXJGaWVsZHMiLCJjb29raWVzIiwid2l0aENsZXJrVXNlcnNDb2xsZWN0aW9uIiwiY29sbGVjdGlvbiIsInNsdWciLCJvcHRpb25zIiwiYXBpQmFzZVBhdGgiLCJhZG1pbkJhc2VQYXRoIiwidXNlclNsdWciLCJ1c2VycyIsImFkbWluUm9sZXMiLCJjbGVya1VzZXJDb2xsZWN0aW9uIiwiYWRtaW4iLCJ1c2VBc1RpdGxlIiwiZGVmYXVsdENvbHVtbnMiLCJoaWRkZW4iLCJjb21wb25lbnRzIiwiRGVzY3JpcHRpb24iLCJwYXRoIiwiY2xpZW50UHJvcHMiLCJ1c2VyQ29sbGVjdGlvblNsdWciLCJmaWVsZHMiLCJhdXRoIiwic3RyYXRlZ2llcyIsImFjY2VzcyIsInJlYWQiLCJjcmVhdGUiLCJ1cGRhdGUiLCJkZWxldGUiLCJlbmRwb2ludHMiLCJob29rcyIsImFmdGVyTG9nb3V0IiwiY29va2llU3RvcmUiLCJhbGxDb29raWVzIiwiZ2V0QWxsIiwiZm9yRWFjaCIsImNvb2tpZSIsIm5hbWUiLCJpbmNsdWRlcyIsImNvbGxlY3Rpb25PdmVycmlkZXMiXSwibWFwcGluZ3MiOiJBQUVBLFNBQVNBLGlCQUFpQixRQUFRLHNCQUFx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