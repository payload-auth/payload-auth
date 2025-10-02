import { adminRoutes, baModelKey, baseSlugs, supportedBAPluginIds } from "../constants";
import { checkPluginExists } from "../helpers/check-plugin-exists";
/**
 * Applies all admin-related overrides when `disableDefaultPayloadAuth` is `true`.
 * Mutates the provided Payload config in-place.
 */ export function applyDisabledDefaultAuthConfig({ config, pluginOptions, collectionMap, resolvedBetterAuthSchemas }) {
    config.admin = {
        ...config.admin,
        components: {
            ...config.admin?.components,
            afterLogin: [
                {
                    path: 'payload-auth/better-auth/plugin/rsc#RSCRedirect',
                    serverProps: {
                        pluginOptions,
                        redirectTo: `${config.routes?.admin === undefined ? '/admin' : config.routes.admin.replace(/\/+$/, '')}${adminRoutes.adminLogin}`
                    }
                },
                ...config.admin?.components?.afterLogin || []
            ],
            logout: {
                Button: {
                    path: 'payload-auth/better-auth/plugin/client#LogoutButton'
                }
            },
            views: {
                ...config.admin?.components?.views,
                adminLogin: {
                    path: adminRoutes.adminLogin,
                    Component: {
                        path: 'payload-auth/better-auth/plugin/rsc#AdminLogin',
                        serverProps: {
                            pluginOptions,
                            adminInvitationsSlug: collectionMap[baseSlugs.adminInvitations].slug
                        }
                    }
                },
                adminSignup: {
                    path: adminRoutes.adminSignup,
                    Component: {
                        path: 'payload-auth/better-auth/plugin/rsc#AdminSignup',
                        serverProps: {
                            pluginOptions,
                            adminInvitationsSlug: collectionMap[baseSlugs.adminInvitations].slug
                        }
                    }
                },
                forgotPassword: {
                    path: adminRoutes.forgotPassword,
                    Component: {
                        path: 'payload-auth/better-auth/plugin/rsc#ForgotPassword',
                        serverProps: {
                            pluginOptions
                        }
                    }
                },
                resetPassword: {
                    path: adminRoutes.resetPassword,
                    Component: {
                        path: 'payload-auth/better-auth/plugin/rsc#ResetPassword',
                        serverProps: {
                            pluginOptions
                        }
                    }
                },
                ...checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.twoFactor) && {
                    twoFactorVerify: {
                        path: adminRoutes.twoFactorVerify,
                        Component: {
                            path: 'payload-auth/better-auth/plugin/rsc#TwoFactorVerify',
                            serverProps: {
                                pluginOptions: pluginOptions,
                                verificationsSlug: resolvedBetterAuthSchemas[baModelKey.verification].modelName
                            }
                        }
                    }
                }
            }
        },
        routes: {
            ...config.admin?.routes,
            login: adminRoutes.loginRedirect
        }
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2FwcGx5LWRpc2FibGVkLWRlZmF1bHQtYXV0aC1jb25maWcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYWRtaW5Sb3V0ZXMsIGJhTW9kZWxLZXksIGJhc2VTbHVncywgc3VwcG9ydGVkQkFQbHVnaW5JZHMgfSBmcm9tICcuLi9jb25zdGFudHMnXG5pbXBvcnQgeyBjaGVja1BsdWdpbkV4aXN0cyB9IGZyb20gJy4uL2hlbHBlcnMvY2hlY2stcGx1Z2luLWV4aXN0cydcbmltcG9ydCB0eXBlIHsgQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnMsIEJldHRlckF1dGhTY2hlbWFzIH0gZnJvbSAnLi4vdHlwZXMnXG5pbXBvcnQgdHlwZSB7IENvbmZpZywgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5cbi8qKlxuICogQXBwbGllcyBhbGwgYWRtaW4tcmVsYXRlZCBvdmVycmlkZXMgd2hlbiBgZGlzYWJsZURlZmF1bHRQYXlsb2FkQXV0aGAgaXMgYHRydWVgLlxuICogTXV0YXRlcyB0aGUgcHJvdmlkZWQgUGF5bG9hZCBjb25maWcgaW4tcGxhY2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseURpc2FibGVkRGVmYXVsdEF1dGhDb25maWcoe1xuICBjb25maWcsXG4gIHBsdWdpbk9wdGlvbnMsXG4gIGNvbGxlY3Rpb25NYXAsXG4gIHJlc29sdmVkQmV0dGVyQXV0aFNjaGVtYXNcbn06IHtcbiAgY29uZmlnOiBDb25maWdcbiAgcGx1Z2luT3B0aW9uczogQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnNcbiAgY29sbGVjdGlvbk1hcDogUmVjb3JkPHN0cmluZywgQ29sbGVjdGlvbkNvbmZpZz5cbiAgcmVzb2x2ZWRCZXR0ZXJBdXRoU2NoZW1hczogQmV0dGVyQXV0aFNjaGVtYXNcbn0pOiB2b2lkIHtcbiAgY29uZmlnLmFkbWluID0ge1xuICAgIC4uLmNvbmZpZy5hZG1pbixcbiAgICBjb21wb25lbnRzOiB7XG4gICAgICAuLi5jb25maWcuYWRtaW4/LmNvbXBvbmVudHMsXG4gICAgICBhZnRlckxvZ2luOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwYXRoOiAncGF5bG9hZC1hdXRoL2JldHRlci1hdXRoL3BsdWdpbi9yc2MjUlNDUmVkaXJlY3QnLFxuICAgICAgICAgIHNlcnZlclByb3BzOiB7XG4gICAgICAgICAgICBwbHVnaW5PcHRpb25zLFxuICAgICAgICAgICAgcmVkaXJlY3RUbzogYCR7Y29uZmlnLnJvdXRlcz8uYWRtaW4gPT09IHVuZGVmaW5lZCA/ICcvYWRtaW4nIDogY29uZmlnLnJvdXRlcy5hZG1pbi5yZXBsYWNlKC9cXC8rJC8sICcnKX0ke2FkbWluUm91dGVzLmFkbWluTG9naW59YFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLi4uKGNvbmZpZy5hZG1pbj8uY29tcG9uZW50cz8uYWZ0ZXJMb2dpbiB8fCBbXSlcbiAgICAgIF0sXG4gICAgICBsb2dvdXQ6IHtcbiAgICAgICAgQnV0dG9uOiB7XG4gICAgICAgICAgcGF0aDogJ3BheWxvYWQtYXV0aC9iZXR0ZXItYXV0aC9wbHVnaW4vY2xpZW50I0xvZ291dEJ1dHRvbidcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgIC4uLmNvbmZpZy5hZG1pbj8uY29tcG9uZW50cz8udmlld3MsXG4gICAgICAgIGFkbWluTG9naW46IHtcbiAgICAgICAgICBwYXRoOiBhZG1pblJvdXRlcy5hZG1pbkxvZ2luLFxuICAgICAgICAgIENvbXBvbmVudDoge1xuICAgICAgICAgICAgcGF0aDogJ3BheWxvYWQtYXV0aC9iZXR0ZXItYXV0aC9wbHVnaW4vcnNjI0FkbWluTG9naW4nLFxuICAgICAgICAgICAgc2VydmVyUHJvcHM6IHtcbiAgICAgICAgICAgICAgcGx1Z2luT3B0aW9ucyxcbiAgICAgICAgICAgICAgYWRtaW5JbnZpdGF0aW9uc1NsdWc6IGNvbGxlY3Rpb25NYXBbYmFzZVNsdWdzLmFkbWluSW52aXRhdGlvbnNdLnNsdWdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGFkbWluU2lnbnVwOiB7XG4gICAgICAgICAgcGF0aDogYWRtaW5Sb3V0ZXMuYWRtaW5TaWdudXAsXG4gICAgICAgICAgQ29tcG9uZW50OiB7XG4gICAgICAgICAgICBwYXRoOiAncGF5bG9hZC1hdXRoL2JldHRlci1hdXRoL3BsdWdpbi9yc2MjQWRtaW5TaWdudXAnLFxuICAgICAgICAgICAgc2VydmVyUHJvcHM6IHtcbiAgICAgICAgICAgICAgcGx1Z2luT3B0aW9ucyxcbiAgICAgICAgICAgICAgYWRtaW5JbnZpdGF0aW9uc1NsdWc6IGNvbGxlY3Rpb25NYXBbYmFzZVNsdWdzLmFkbWluSW52aXRhdGlvbnNdLnNsdWdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGZvcmdvdFBhc3N3b3JkOiB7XG4gICAgICAgICAgcGF0aDogYWRtaW5Sb3V0ZXMuZm9yZ290UGFzc3dvcmQsXG4gICAgICAgICAgQ29tcG9uZW50OiB7XG4gICAgICAgICAgICBwYXRoOiAncGF5bG9hZC1hdXRoL2JldHRlci1hdXRoL3BsdWdpbi9yc2MjRm9yZ290UGFzc3dvcmQnLFxuICAgICAgICAgICAgc2VydmVyUHJvcHM6IHtcbiAgICAgICAgICAgICAgcGx1Z2luT3B0aW9uc1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcmVzZXRQYXNzd29yZDoge1xuICAgICAgICAgIHBhdGg6IGFkbWluUm91dGVzLnJlc2V0UGFzc3dvcmQsXG4gICAgICAgICAgQ29tcG9uZW50OiB7XG4gICAgICAgICAgICBwYXRoOiAncGF5bG9hZC1hdXRoL2JldHRlci1hdXRoL3BsdWdpbi9yc2MjUmVzZXRQYXNzd29yZCcsXG4gICAgICAgICAgICBzZXJ2ZXJQcm9wczoge1xuICAgICAgICAgICAgICBwbHVnaW5PcHRpb25zXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAuLi4oY2hlY2tQbHVnaW5FeGlzdHMocGx1Z2luT3B0aW9ucy5iZXR0ZXJBdXRoT3B0aW9ucyA/PyB7fSwgc3VwcG9ydGVkQkFQbHVnaW5JZHMudHdvRmFjdG9yKSAmJiB7XG4gICAgICAgICAgdHdvRmFjdG9yVmVyaWZ5OiB7XG4gICAgICAgICAgICBwYXRoOiBhZG1pblJvdXRlcy50d29GYWN0b3JWZXJpZnksXG4gICAgICAgICAgICBDb21wb25lbnQ6IHtcbiAgICAgICAgICAgICAgcGF0aDogJ3BheWxvYWQtYXV0aC9iZXR0ZXItYXV0aC9wbHVnaW4vcnNjI1R3b0ZhY3RvclZlcmlmeScsXG4gICAgICAgICAgICAgIHNlcnZlclByb3BzOiB7XG4gICAgICAgICAgICAgICAgcGx1Z2luT3B0aW9uczogcGx1Z2luT3B0aW9ucyxcbiAgICAgICAgICAgICAgICB2ZXJpZmljYXRpb25zU2x1ZzogcmVzb2x2ZWRCZXR0ZXJBdXRoU2NoZW1hc1tiYU1vZGVsS2V5LnZlcmlmaWNhdGlvbl0ubW9kZWxOYW1lXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICByb3V0ZXM6IHtcbiAgICAgIC4uLmNvbmZpZy5hZG1pbj8ucm91dGVzLFxuICAgICAgbG9naW46IGFkbWluUm91dGVzLmxvZ2luUmVkaXJlY3RcbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJhZG1pblJvdXRlcyIsImJhTW9kZWxLZXkiLCJiYXNlU2x1Z3MiLCJzdXBwb3J0ZWRCQVBsdWdpbklkcyIsImNoZWNrUGx1Z2luRXhpc3RzIiwiYXBwbHlEaXNhYmxlZERlZmF1bHRBdXRoQ29uZmlnIiwiY29uZmlnIiwicGx1Z2luT3B0aW9ucyIsImNvbGxlY3Rpb25NYXAiLCJyZXNvbHZlZEJldHRlckF1dGhTY2hlbWFzIiwiYWRtaW4iLCJjb21wb25lbnRzIiwiYWZ0ZXJMb2dpbiIsInBhdGgiLCJzZXJ2ZXJQcm9wcyIsInJlZGlyZWN0VG8iLCJyb3V0ZXMiLCJ1bmRlZmluZWQiLCJyZXBsYWNlIiwiYWRtaW5Mb2dpbiIsImxvZ291dCIsIkJ1dHRvbiIsInZpZXdzIiwiQ29tcG9uZW50IiwiYWRtaW5JbnZpdGF0aW9uc1NsdWciLCJhZG1pbkludml0YXRpb25zIiwic2x1ZyIsImFkbWluU2lnbnVwIiwiZm9yZ290UGFzc3dvcmQiLCJyZXNldFBhc3N3b3JkIiwiYmV0dGVyQXV0aE9wdGlvbnMiLCJ0d29GYWN0b3IiLCJ0d29GYWN0b3JWZXJpZnkiLCJ2ZXJpZmljYXRpb25zU2x1ZyIsInZlcmlmaWNhdGlvbiIsIm1vZGVsTmFtZSIsImxvZ2luIiwibG9naW5SZWRpcmVjdCJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsV0FBVyxFQUFFQyxVQUFVLEVBQUVDLFNBQVMsRUFBRUMsb0JBQW9CLFFBQVEsZUFBYztBQUN2RixTQUFTQyxpQkFBaUIsUUFBUSxpQ0FBZ0M7QUFJbEU7OztDQUdDLEdBQ0QsT0FBTyxTQUFTQywrQkFBK0IsRUFDN0NDLE1BQU0sRUFDTkMsYUFBYSxFQUNiQyxhQUFhLEVBQ2JDLHlCQUF5QixFQU0xQjtJQUNDSCxPQUFPSSxLQUFLLEdBQUc7UUFDYixHQUFHSixPQUFPSSxLQUFLO1FBQ2ZDLFlBQVk7WUFDVixHQUFHTCxPQUFPSSxLQUFLLEVBQUVDLFVBQVU7WUFDM0JDLFlBQVk7Z0JBQ1Y7b0JBQ0VDLE1BQU07b0JBQ05DLGFBQWE7d0JBQ1hQO3dCQUNBUSxZQUFZLEdBQUdULE9BQU9VLE1BQU0sRUFBRU4sVUFBVU8sWUFBWSxXQUFXWCxPQUFPVSxNQUFNLENBQUNOLEtBQUssQ0FBQ1EsT0FBTyxDQUFDLFFBQVEsTUFBTWxCLFlBQVltQixVQUFVLEVBQUU7b0JBQ25JO2dCQUNGO21CQUNJYixPQUFPSSxLQUFLLEVBQUVDLFlBQVlDLGNBQWMsRUFBRTthQUMvQztZQUNEUSxRQUFRO2dCQUNOQyxRQUFRO29CQUNOUixNQUFNO2dCQUNSO1lBQ0Y7WUFDQVMsT0FBTztnQkFDTCxHQUFHaEIsT0FBT0ksS0FBSyxFQUFFQyxZQUFZVyxLQUFLO2dCQUNsQ0gsWUFBWTtvQkFDVk4sTUFBTWIsWUFBWW1CLFVBQVU7b0JBQzVCSSxXQUFXO3dCQUNUVixNQUFNO3dCQUNOQyxhQUFhOzRCQUNYUDs0QkFDQWlCLHNCQUFzQmhCLGFBQWEsQ0FBQ04sVUFBVXVCLGdCQUFnQixDQUFDLENBQUNDLElBQUk7d0JBQ3RFO29CQUNGO2dCQUNGO2dCQUNBQyxhQUFhO29CQUNYZCxNQUFNYixZQUFZMkIsV0FBVztvQkFDN0JKLFdBQVc7d0JBQ1RWLE1BQU07d0JBQ05DLGFBQWE7NEJBQ1hQOzRCQUNBaUIsc0JBQXNCaEIsYUFBYSxDQUFDTixVQUFVdUIsZ0JBQWdCLENBQUMsQ0FBQ0MsSUFBSTt3QkFDdEU7b0JBQ0Y7Z0JBQ0Y7Z0JBQ0FFLGdCQUFnQjtvQkFDZGYsTUFBTWIsWUFBWTRCLGNBQWM7b0JBQ2hDTCxXQUFXO3dCQUNUVixNQUFNO3dCQUNOQyxhQUFhOzRCQUNYUDt3QkFDRjtvQkFDRjtnQkFDRjtnQkFDQXNCLGVBQWU7b0JBQ2JoQixNQUFNYixZQUFZNkIsYUFBYTtvQkFDL0JOLFdBQVc7d0JBQ1RWLE1BQU07d0JBQ05DLGFBQWE7NEJBQ1hQO3dCQUNGO29CQUNGO2dCQUNGO2dCQUNBLEdBQUlILGtCQUFrQkcsY0FBY3VCLGlCQUFpQixJQUFJLENBQUMsR0FBRzNCLHFCQUFxQjRCLFNBQVMsS0FBSztvQkFDOUZDLGlCQUFpQjt3QkFDZm5CLE1BQU1iLFlBQVlnQyxlQUFlO3dCQUNqQ1QsV0FBVzs0QkFDVFYsTUFBTTs0QkFDTkMsYUFBYTtnQ0FDWFAsZUFBZUE7Z0NBQ2YwQixtQkFBbUJ4Qix5QkFBeUIsQ0FBQ1IsV0FBV2lDLFlBQVksQ0FBQyxDQUFDQyxTQUFTOzRCQUNqRjt3QkFDRjtvQkFDRjtnQkFDRixDQUFDO1lBQ0g7UUFDRjtRQUNBbkIsUUFBUTtZQUNOLEdBQUdWLE9BQU9JLEtBQUssRUFBRU0sTUFBTTtZQUN2Qm9CLE9BQU9wQyxZQUFZcUMsYUFBYTtRQUNsQztJQUNGO0FBQ0YifQ==