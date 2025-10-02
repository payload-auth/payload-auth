import { withClerkUsersCollection } from "./plugin/collections/users";
import { defaultClerkMapping, createMappingWithRequiredClerkFields } from "./utils/clerk-user";
export * from "./plugin/auth-strategy";
export * from "./plugin/collections/users";
export function clerkPlugin(pluginOptions = {}) {
    return (config)=>{
        if (pluginOptions.disabled) {
            return config;
        }
        const clerkToPayloadMappingFunction = createMappingWithRequiredClerkFields(pluginOptions?.users?.clerkToPayloadMapping ?? defaultClerkMapping);
        pluginOptions.users = pluginOptions.users ?? {};
        pluginOptions.users.clerkToPayloadMapping = clerkToPayloadMappingFunction;
        config.custom = {
            ...config.custom,
            hasClerkPlugin: true,
            clerkPlugin: {
                clerkToPayloadMapping: clerkToPayloadMappingFunction
            }
        };
        if (!config.collections) {
            config.collections = [];
        }
        config.admin = {
            ...config.admin,
            components: {
                logout: {
                    Button: {
                        path: 'payload-auth/clerk/admin/ui#LogoutButton'
                    }
                },
                ...config.admin?.components,
                afterLogin: [
                    {
                        path: 'payload-auth/clerk/admin/ui#AfterLoginForm',
                        clientProps: {
                            redirectOnLoginTo: config?.routes?.admin
                        }
                    }
                ]
            }
        };
        const userSlug = pluginOptions.users?.slug ?? 'users';
        const existingUserCollection = config.collections.find((collection)=>collection.slug === userSlug);
        if (existingUserCollection) {
            const index = config.collections.findIndex((collection)=>collection.slug === userSlug);
            config.collections[index] = withClerkUsersCollection({
                collection: existingUserCollection,
                options: pluginOptions,
                apiBasePath: config?.routes?.api ?? undefined,
                adminBasePath: config?.routes?.admin ?? undefined
            });
        } else {
            config.collections.push(withClerkUsersCollection({
                options: pluginOptions,
                apiBasePath: config?.routes?.api ?? undefined,
                adminBasePath: config?.routes?.admin ?? undefined
            }));
        }
        return config;
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGVyay9wbHVnaW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb25maWcgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHR5cGUgeyBDbGVya1BsdWdpbk9wdGlvbnMgfSBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHsgd2l0aENsZXJrVXNlcnNDb2xsZWN0aW9uIH0gZnJvbSAnLi9wbHVnaW4vY29sbGVjdGlvbnMvdXNlcnMnXG5pbXBvcnQgeyBkZWZhdWx0Q2xlcmtNYXBwaW5nLCBjcmVhdGVNYXBwaW5nV2l0aFJlcXVpcmVkQ2xlcmtGaWVsZHMgfSBmcm9tICcuL3V0aWxzL2NsZXJrLXVzZXInXG5cbmV4cG9ydCAqIGZyb20gJy4vcGx1Z2luL2F1dGgtc3RyYXRlZ3knXG5leHBvcnQgKiBmcm9tICcuL3BsdWdpbi9jb2xsZWN0aW9ucy91c2VycydcblxuZXhwb3J0IGZ1bmN0aW9uIGNsZXJrUGx1Z2luKHBsdWdpbk9wdGlvbnM6IENsZXJrUGx1Z2luT3B0aW9ucyA9IHt9KSB7XG4gIHJldHVybiAoY29uZmlnOiBDb25maWcpOiBDb25maWcgPT4ge1xuICAgIGlmIChwbHVnaW5PcHRpb25zLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm4gY29uZmlnXG4gICAgfVxuXG4gICAgY29uc3QgY2xlcmtUb1BheWxvYWRNYXBwaW5nRnVuY3Rpb24gPSBjcmVhdGVNYXBwaW5nV2l0aFJlcXVpcmVkQ2xlcmtGaWVsZHMoXG4gICAgICBwbHVnaW5PcHRpb25zPy51c2Vycz8uY2xlcmtUb1BheWxvYWRNYXBwaW5nID8/IGRlZmF1bHRDbGVya01hcHBpbmdcbiAgICApXG4gICAgcGx1Z2luT3B0aW9ucy51c2VycyA9IHBsdWdpbk9wdGlvbnMudXNlcnMgPz8ge31cbiAgICBwbHVnaW5PcHRpb25zLnVzZXJzLmNsZXJrVG9QYXlsb2FkTWFwcGluZyA9IGNsZXJrVG9QYXlsb2FkTWFwcGluZ0Z1bmN0aW9uXG5cbiAgICBjb25maWcuY3VzdG9tID0ge1xuICAgICAgLi4uY29uZmlnLmN1c3RvbSxcbiAgICAgIGhhc0NsZXJrUGx1Z2luOiB0cnVlLFxuICAgICAgY2xlcmtQbHVnaW46IHtcbiAgICAgICAgY2xlcmtUb1BheWxvYWRNYXBwaW5nOiBjbGVya1RvUGF5bG9hZE1hcHBpbmdGdW5jdGlvblxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghY29uZmlnLmNvbGxlY3Rpb25zKSB7XG4gICAgICBjb25maWcuY29sbGVjdGlvbnMgPSBbXVxuICAgIH1cblxuICAgIGNvbmZpZy5hZG1pbiA9IHtcbiAgICAgIC4uLmNvbmZpZy5hZG1pbixcbiAgICAgIGNvbXBvbmVudHM6IHtcbiAgICAgICAgbG9nb3V0OiB7XG4gICAgICAgICAgQnV0dG9uOiB7XG4gICAgICAgICAgICBwYXRoOiAncGF5bG9hZC1hdXRoL2NsZXJrL2FkbWluL3VpI0xvZ291dEJ1dHRvbidcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC4uLmNvbmZpZy5hZG1pbj8uY29tcG9uZW50cyxcbiAgICAgICAgYWZ0ZXJMb2dpbjogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHBhdGg6ICdwYXlsb2FkLWF1dGgvY2xlcmsvYWRtaW4vdWkjQWZ0ZXJMb2dpbkZvcm0nLFxuICAgICAgICAgICAgY2xpZW50UHJvcHM6IHsgcmVkaXJlY3RPbkxvZ2luVG86IGNvbmZpZz8ucm91dGVzPy5hZG1pbiB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHVzZXJTbHVnID0gcGx1Z2luT3B0aW9ucy51c2Vycz8uc2x1ZyA/PyAndXNlcnMnXG5cbiAgICBjb25zdCBleGlzdGluZ1VzZXJDb2xsZWN0aW9uID0gY29uZmlnLmNvbGxlY3Rpb25zLmZpbmQoKGNvbGxlY3Rpb246IGFueSkgPT4gY29sbGVjdGlvbi5zbHVnID09PSB1c2VyU2x1ZylcblxuICAgIGlmIChleGlzdGluZ1VzZXJDb2xsZWN0aW9uKSB7XG4gICAgICBjb25zdCBpbmRleCA9IGNvbmZpZy5jb2xsZWN0aW9ucy5maW5kSW5kZXgoKGNvbGxlY3Rpb246IGFueSkgPT4gY29sbGVjdGlvbi5zbHVnID09PSB1c2VyU2x1ZylcbiAgICAgIGNvbmZpZy5jb2xsZWN0aW9uc1tpbmRleF0gPSB3aXRoQ2xlcmtVc2Vyc0NvbGxlY3Rpb24oe1xuICAgICAgICBjb2xsZWN0aW9uOiBleGlzdGluZ1VzZXJDb2xsZWN0aW9uLFxuICAgICAgICBvcHRpb25zOiBwbHVnaW5PcHRpb25zLFxuICAgICAgICBhcGlCYXNlUGF0aDogY29uZmlnPy5yb3V0ZXM/LmFwaSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGFkbWluQmFzZVBhdGg6IGNvbmZpZz8ucm91dGVzPy5hZG1pbiA/PyB1bmRlZmluZWRcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbmZpZy5jb2xsZWN0aW9ucy5wdXNoKFxuICAgICAgICB3aXRoQ2xlcmtVc2Vyc0NvbGxlY3Rpb24oe1xuICAgICAgICAgIG9wdGlvbnM6IHBsdWdpbk9wdGlvbnMsXG4gICAgICAgICAgYXBpQmFzZVBhdGg6IGNvbmZpZz8ucm91dGVzPy5hcGkgPz8gdW5kZWZpbmVkLFxuICAgICAgICAgIGFkbWluQmFzZVBhdGg6IGNvbmZpZz8ucm91dGVzPy5hZG1pbiA/PyB1bmRlZmluZWRcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnXG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJ3aXRoQ2xlcmtVc2Vyc0NvbGxlY3Rpb24iLCJkZWZhdWx0Q2xlcmtNYXBwaW5nIiwiY3JlYXRlTWFwcGluZ1dpdGhSZXF1aXJlZENsZXJrRmllbGRzIiwiY2xlcmtQbHVnaW4iLCJwbHVnaW5PcHRpb25zIiwiY29uZmlnIiwiZGlzYWJsZWQiLCJjbGVya1RvUGF5bG9hZE1hcHBpbmdGdW5jdGlvbiIsInVzZXJzIiwiY2xlcmtUb1BheWxvYWRNYXBwaW5nIiwiY3VzdG9tIiwiaGFzQ2xlcmtQbHVnaW4iLCJjb2xsZWN0aW9ucyIsImFkbWluIiwiY29tcG9uZW50cyIsImxvZ291dCIsIkJ1dHRvbiIsInBhdGgiLCJhZnRlckxvZ2luIiwiY2xpZW50UHJvcHMiLCJyZWRpcmVjdE9uTG9naW5UbyIsInJvdXRlcyIsInVzZXJTbHVnIiwic2x1ZyIsImV4aXN0aW5nVXNlckNvbGxlY3Rpb24iLCJmaW5kIiwiY29sbGVjdGlvbiIsImluZGV4IiwiZmluZEluZGV4Iiwib3B0aW9ucyIsImFwaUJhc2VQYXRoIiwiYXBpIiwidW5kZWZpbmVkIiwiYWRtaW5CYXNlUGF0aCIsInB1c2giXSwibWFwcGluZ3MiOiJBQUVBLFNBQVNBLHdCQUF3QixRQUFRLDZCQUE0QjtBQUNyRSxTQUFTQyxtQkFBbUIsRUFBRUMsb0NBQW9DLFFBQVEscUJBQW9CO0FBRTlGLGNBQWMseUJBQXdCO0FBQ3RDLGNBQWMsNkJBQTRCO0FBRTFDLE9BQU8sU0FBU0MsWUFBWUMsZ0JBQW9DLENBQUMsQ0FBQztJQUNoRSxPQUFPLENBQUNDO1FBQ04sSUFBSUQsY0FBY0UsUUFBUSxFQUFFO1lBQzFCLE9BQU9EO1FBQ1Q7UUFFQSxNQUFNRSxnQ0FBZ0NMLHFDQUNwQ0UsZUFBZUksT0FBT0MseUJBQXlCUjtRQUVqREcsY0FBY0ksS0FBSyxHQUFHSixjQUFjSSxLQUFLLElBQUksQ0FBQztRQUM5Q0osY0FBY0ksS0FBSyxDQUFDQyxxQkFBcUIsR0FBR0Y7UUFFNUNGLE9BQU9LLE1BQU0sR0FBRztZQUNkLEdBQUdMLE9BQU9LLE1BQU07WUFDaEJDLGdCQUFnQjtZQUNoQlIsYUFBYTtnQkFDWE0sdUJBQXVCRjtZQUN6QjtRQUNGO1FBRUEsSUFBSSxDQUFDRixPQUFPTyxXQUFXLEVBQUU7WUFDdkJQLE9BQU9PLFdBQVcsR0FBRyxFQUFFO1FBQ3pCO1FBRUFQLE9BQU9RLEtBQUssR0FBRztZQUNiLEdBQUdSLE9BQU9RLEtBQUs7WUFDZkMsWUFBWTtnQkFDVkMsUUFBUTtvQkFDTkMsUUFBUTt3QkFDTkMsTUFBTTtvQkFDUjtnQkFDRjtnQkFDQSxHQUFHWixPQUFPUSxLQUFLLEVBQUVDLFVBQVU7Z0JBQzNCSSxZQUFZO29CQUNWO3dCQUNFRCxNQUFNO3dCQUNORSxhQUFhOzRCQUFFQyxtQkFBbUJmLFFBQVFnQixRQUFRUjt3QkFBTTtvQkFDMUQ7aUJBQ0Q7WUFDSDtRQUNGO1FBQ0EsTUFBTVMsV0FBV2xCLGNBQWNJLEtBQUssRUFBRWUsUUFBUTtRQUU5QyxNQUFNQyx5QkFBeUJuQixPQUFPTyxXQUFXLENBQUNhLElBQUksQ0FBQyxDQUFDQyxhQUFvQkEsV0FBV0gsSUFBSSxLQUFLRDtRQUVoRyxJQUFJRSx3QkFBd0I7WUFDMUIsTUFBTUcsUUFBUXRCLE9BQU9PLFdBQVcsQ0FBQ2dCLFNBQVMsQ0FBQyxDQUFDRixhQUFvQkEsV0FBV0gsSUFBSSxLQUFLRDtZQUNwRmpCLE9BQU9PLFdBQVcsQ0FBQ2UsTUFBTSxHQUFHM0IseUJBQXlCO2dCQUNuRDBCLFlBQVlGO2dCQUNaSyxTQUFTekI7Z0JBQ1QwQixhQUFhekIsUUFBUWdCLFFBQVFVLE9BQU9DO2dCQUNwQ0MsZUFBZTVCLFFBQVFnQixRQUFRUixTQUFTbUI7WUFDMUM7UUFDRixPQUFPO1lBQ0wzQixPQUFPTyxXQUFXLENBQUNzQixJQUFJLENBQ3JCbEMseUJBQXlCO2dCQUN2QjZCLFNBQVN6QjtnQkFDVDBCLGFBQWF6QixRQUFRZ0IsUUFBUVUsT0FBT0M7Z0JBQ3BDQyxlQUFlNUIsUUFBUWdCLFFBQVFSLFNBQVNtQjtZQUMxQztRQUVKO1FBRUEsT0FBTzNCO0lBQ1Q7QUFDRiJ9