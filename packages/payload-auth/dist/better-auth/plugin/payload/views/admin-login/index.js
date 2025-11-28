import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { AdminLoginClient } from "./client";
import { redirect } from "next/navigation";
import { Logo } from "../../../../../shared/components/logo";
import { getSafeRedirect } from "../../utils/get-safe-redirect";
import { checkPluginExists } from "../../../helpers/check-plugin-exists";
import { RenderServerComponent } from "@payloadcms/ui/elements/RenderServerComponent";
import { adminRoutes, defaults, supportedBAPluginIds } from "../../../constants";
import { MinimalTemplate } from "@payloadcms/next/templates";
export const loginBaseClass = 'login';
const AdminLogin = async ({ initPageResult, params, searchParams, pluginOptions, adminInvitationsSlug })=>{
    const { locale, permissions, req } = initPageResult;
    const { i18n, payload: { config, collections }, payload, user } = req;
    const { admin: { components: { afterLogin, beforeLogin } = {}, user: userSlug }, routes: { admin: adminRoute } } = config;
    const adminRole = pluginOptions.users?.defaultAdminRole ?? defaults.adminRole;
    const redirectUrl = getSafeRedirect(searchParams?.redirect ?? '', adminRoute);
    if (user) {
        redirect(redirectUrl);
    }
    const adminCount = await req.payload.count({
        collection: userSlug,
        where: {
            role: {
                equals: adminRole
            }
        }
    });
    if (adminCount.totalDocs === 0) {
        // Check if we already have an admin invitation
        const existingInvitations = await req.payload.find({
            collection: adminInvitationsSlug,
            where: {
                role: {
                    equals: adminRole
                }
            }
        });
        let token;
        if (existingInvitations.totalDocs > 0) {
            // Use existing token
            token = existingInvitations.docs[0].token;
        } else {
            // Generate a new secure invite token
            token = crypto.randomUUID();
            await req.payload.create({
                collection: adminInvitationsSlug,
                data: {
                    role: adminRole,
                    token
                }
            });
        }
        redirect(`${adminRoute}${adminRoutes.adminSignup}?token=${token}`);
    }
    // Filter out the first component from afterLogin array or set to undefined if not more than 1
    // This is because of the custom login redirect component, we don't want an infinite loop
    const filteredAfterLogin = Array.isArray(afterLogin) && afterLogin.length > 1 ? afterLogin.slice(1) : undefined;
    const prefillAutoLogin = typeof config.admin?.autoLogin === 'object' && config.admin?.autoLogin.prefillOnly;
    const prefillUsername = prefillAutoLogin && typeof config.admin?.autoLogin === 'object' ? config.admin?.autoLogin.username : undefined;
    const prefillEmail = prefillAutoLogin && typeof config.admin?.autoLogin === 'object' ? config.admin?.autoLogin.email : undefined;
    const prefillPassword = prefillAutoLogin && typeof config.admin?.autoLogin === 'object' ? config.admin?.autoLogin.password : undefined;
    const hasUsernamePlugin = checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.username);
    const hasPasskeyPlugin = checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.passkey);
    const loginMethods = pluginOptions.admin?.loginMethods ?? [];
    const loginWithUsername = collections?.[userSlug]?.config.auth.loginWithUsername;
    const canLoginWithUsername = (hasUsernamePlugin && loginWithUsername) ?? false;
    return /*#__PURE__*/ _jsxs(MinimalTemplate, {
        className: loginBaseClass,
        children: [
            /*#__PURE__*/ _jsx("div", {
                className: `${loginBaseClass}__brand`,
                children: /*#__PURE__*/ _jsx(Logo, {
                    i18n: i18n,
                    locale: locale,
                    params: params,
                    payload: payload,
                    permissions: permissions,
                    searchParams: searchParams,
                    user: user ?? undefined
                })
            }),
            RenderServerComponent({
                Component: beforeLogin,
                importMap: payload.importMap,
                serverProps: {
                    i18n,
                    locale,
                    params,
                    payload,
                    permissions,
                    searchParams,
                    user: user ?? undefined
                }
            }),
            /*#__PURE__*/ _jsx(AdminLoginClient, {
                loginWithUsername: canLoginWithUsername,
                hasUsernamePlugin: hasUsernamePlugin,
                hasPasskeyPlugin: hasPasskeyPlugin,
                loginMethods: loginMethods,
                prefillEmail: prefillEmail,
                prefillPassword: prefillPassword,
                prefillUsername: prefillUsername,
                searchParams: searchParams ?? {},
                baseURL: pluginOptions.betterAuthOptions?.baseURL,
                basePath: pluginOptions.betterAuthOptions?.basePath
            }),
            RenderServerComponent({
                Component: filteredAfterLogin,
                importMap: payload.importMap,
                serverProps: {
                    i18n,
                    locale,
                    params,
                    payload,
                    permissions,
                    searchParams,
                    user: user ?? undefined
                }
            })
        ]
    });
};
export default AdminLogin;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC92aWV3cy9hZG1pbi1sb2dpbi9pbmRleC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQWRtaW5Mb2dpbkNsaWVudCB9IGZyb20gJy4vY2xpZW50J1xuaW1wb3J0IHsgcmVkaXJlY3QgfSBmcm9tICduZXh0L25hdmlnYXRpb24nXG5pbXBvcnQgeyBMb2dvIH0gZnJvbSAnQC9zaGFyZWQvY29tcG9uZW50cy9sb2dvJ1xuaW1wb3J0IHsgZ2V0U2FmZVJlZGlyZWN0IH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC91dGlscy9nZXQtc2FmZS1yZWRpcmVjdCdcbmltcG9ydCB7IGNoZWNrUGx1Z2luRXhpc3RzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vaGVscGVycy9jaGVjay1wbHVnaW4tZXhpc3RzJ1xuaW1wb3J0IHsgUmVuZGVyU2VydmVyQ29tcG9uZW50IH0gZnJvbSAnQHBheWxvYWRjbXMvdWkvZWxlbWVudHMvUmVuZGVyU2VydmVyQ29tcG9uZW50J1xuaW1wb3J0IHsgYWRtaW5Sb3V0ZXMsIGRlZmF1bHRzLCBzdXBwb3J0ZWRCQVBsdWdpbklkcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2NvbnN0YW50cydcbmltcG9ydCB7IE1pbmltYWxUZW1wbGF0ZSB9IGZyb20gJ0BwYXlsb2FkY21zL25leHQvdGVtcGxhdGVzJ1xuaW1wb3J0IHsgdHlwZSBBZG1pblZpZXdTZXJ2ZXJQcm9wcywgdHlwZSBTZXJ2ZXJQcm9wcyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgdHlwZSB7IEJldHRlckF1dGhQbHVnaW5PcHRpb25zIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vdHlwZXMnXG5cbmV4cG9ydCBjb25zdCBsb2dpbkJhc2VDbGFzcyA9ICdsb2dpbidcblxuaW50ZXJmYWNlIEFkbWluTG9naW5Qcm9wcyBleHRlbmRzIEFkbWluVmlld1NlcnZlclByb3BzIHtcbiAgYWRtaW5JbnZpdGF0aW9uc1NsdWc6IHN0cmluZ1xuICBwbHVnaW5PcHRpb25zOiBCZXR0ZXJBdXRoUGx1Z2luT3B0aW9uc1xufVxuXG5jb25zdCBBZG1pbkxvZ2luOiBSZWFjdC5GQzxBZG1pbkxvZ2luUHJvcHM+ID0gYXN5bmMgKHtcbiAgaW5pdFBhZ2VSZXN1bHQsXG4gIHBhcmFtcyxcbiAgc2VhcmNoUGFyYW1zLFxuICBwbHVnaW5PcHRpb25zLFxuICBhZG1pbkludml0YXRpb25zU2x1Z1xufTogQWRtaW5Mb2dpblByb3BzKSA9PiB7XG4gIGNvbnN0IHsgbG9jYWxlLCBwZXJtaXNzaW9ucywgcmVxIH0gPSBpbml0UGFnZVJlc3VsdFxuICBjb25zdCB7XG4gICAgaTE4bixcbiAgICBwYXlsb2FkOiB7IGNvbmZpZywgY29sbGVjdGlvbnMgfSxcbiAgICBwYXlsb2FkLFxuICAgIHVzZXJcbiAgfSA9IHJlcVxuXG4gIGNvbnN0IHtcbiAgICBhZG1pbjogeyBjb21wb25lbnRzOiB7IGFmdGVyTG9naW4sIGJlZm9yZUxvZ2luIH0gPSB7fSwgdXNlcjogdXNlclNsdWcgfSxcbiAgICByb3V0ZXM6IHsgYWRtaW46IGFkbWluUm91dGUgfVxuICB9ID0gY29uZmlnXG5cbiAgY29uc3QgYWRtaW5Sb2xlID0gcGx1Z2luT3B0aW9ucy51c2Vycz8uZGVmYXVsdEFkbWluUm9sZSA/PyBkZWZhdWx0cy5hZG1pblJvbGVcbiAgY29uc3QgcmVkaXJlY3RVcmwgPSBnZXRTYWZlUmVkaXJlY3Qoc2VhcmNoUGFyYW1zPy5yZWRpcmVjdCA/PyAnJywgYWRtaW5Sb3V0ZSlcblxuICBpZiAodXNlcikge1xuICAgIHJlZGlyZWN0KHJlZGlyZWN0VXJsKVxuICB9XG5cbiAgY29uc3QgYWRtaW5Db3VudCA9IGF3YWl0IHJlcS5wYXlsb2FkLmNvdW50KHtcbiAgICBjb2xsZWN0aW9uOiB1c2VyU2x1ZyxcbiAgICB3aGVyZToge1xuICAgICAgcm9sZToge1xuICAgICAgICBlcXVhbHM6IGFkbWluUm9sZVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICBpZiAoYWRtaW5Db3VudC50b3RhbERvY3MgPT09IDApIHtcbiAgICAvLyBDaGVjayBpZiB3ZSBhbHJlYWR5IGhhdmUgYW4gYWRtaW4gaW52aXRhdGlvblxuICAgIGNvbnN0IGV4aXN0aW5nSW52aXRhdGlvbnMgPSBhd2FpdCByZXEucGF5bG9hZC5maW5kKHtcbiAgICAgIGNvbGxlY3Rpb246IGFkbWluSW52aXRhdGlvbnNTbHVnLFxuICAgICAgd2hlcmU6IHtcbiAgICAgICAgcm9sZToge1xuICAgICAgICAgIGVxdWFsczogYWRtaW5Sb2xlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgbGV0IHRva2VuXG5cbiAgICBpZiAoZXhpc3RpbmdJbnZpdGF0aW9ucy50b3RhbERvY3MgPiAwKSB7XG4gICAgICAvLyBVc2UgZXhpc3RpbmcgdG9rZW5cbiAgICAgIHRva2VuID0gZXhpc3RpbmdJbnZpdGF0aW9ucy5kb2NzWzBdLnRva2VuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEdlbmVyYXRlIGEgbmV3IHNlY3VyZSBpbnZpdGUgdG9rZW5cbiAgICAgIHRva2VuID0gY3J5cHRvLnJhbmRvbVVVSUQoKVxuICAgICAgYXdhaXQgcmVxLnBheWxvYWQuY3JlYXRlKHtcbiAgICAgICAgY29sbGVjdGlvbjogYWRtaW5JbnZpdGF0aW9uc1NsdWcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICByb2xlOiBhZG1pblJvbGUsXG4gICAgICAgICAgdG9rZW5cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICByZWRpcmVjdChgJHthZG1pblJvdXRlfSR7YWRtaW5Sb3V0ZXMuYWRtaW5TaWdudXB9P3Rva2VuPSR7dG9rZW59YClcbiAgfVxuXG4gIC8vIEZpbHRlciBvdXQgdGhlIGZpcnN0IGNvbXBvbmVudCBmcm9tIGFmdGVyTG9naW4gYXJyYXkgb3Igc2V0IHRvIHVuZGVmaW5lZCBpZiBub3QgbW9yZSB0aGFuIDFcbiAgLy8gVGhpcyBpcyBiZWNhdXNlIG9mIHRoZSBjdXN0b20gbG9naW4gcmVkaXJlY3QgY29tcG9uZW50LCB3ZSBkb24ndCB3YW50IGFuIGluZmluaXRlIGxvb3BcbiAgY29uc3QgZmlsdGVyZWRBZnRlckxvZ2luID0gQXJyYXkuaXNBcnJheShhZnRlckxvZ2luKSAmJiBhZnRlckxvZ2luLmxlbmd0aCA+IDEgPyBhZnRlckxvZ2luLnNsaWNlKDEpIDogdW5kZWZpbmVkXG4gIGNvbnN0IHByZWZpbGxBdXRvTG9naW4gPSB0eXBlb2YgY29uZmlnLmFkbWluPy5hdXRvTG9naW4gPT09ICdvYmplY3QnICYmIGNvbmZpZy5hZG1pbj8uYXV0b0xvZ2luLnByZWZpbGxPbmx5XG4gIGNvbnN0IHByZWZpbGxVc2VybmFtZSA9IHByZWZpbGxBdXRvTG9naW4gJiYgdHlwZW9mIGNvbmZpZy5hZG1pbj8uYXV0b0xvZ2luID09PSAnb2JqZWN0JyA/IGNvbmZpZy5hZG1pbj8uYXV0b0xvZ2luLnVzZXJuYW1lIDogdW5kZWZpbmVkXG4gIGNvbnN0IHByZWZpbGxFbWFpbCA9IHByZWZpbGxBdXRvTG9naW4gJiYgdHlwZW9mIGNvbmZpZy5hZG1pbj8uYXV0b0xvZ2luID09PSAnb2JqZWN0JyA/IGNvbmZpZy5hZG1pbj8uYXV0b0xvZ2luLmVtYWlsIDogdW5kZWZpbmVkXG4gIGNvbnN0IHByZWZpbGxQYXNzd29yZCA9IHByZWZpbGxBdXRvTG9naW4gJiYgdHlwZW9mIGNvbmZpZy5hZG1pbj8uYXV0b0xvZ2luID09PSAnb2JqZWN0JyA/IGNvbmZpZy5hZG1pbj8uYXV0b0xvZ2luLnBhc3N3b3JkIDogdW5kZWZpbmVkXG4gIGNvbnN0IGhhc1VzZXJuYW1lUGx1Z2luID0gY2hlY2tQbHVnaW5FeGlzdHMocGx1Z2luT3B0aW9ucy5iZXR0ZXJBdXRoT3B0aW9ucyA/PyB7fSwgc3VwcG9ydGVkQkFQbHVnaW5JZHMudXNlcm5hbWUpXG4gIGNvbnN0IGhhc1Bhc3NrZXlQbHVnaW4gPSBjaGVja1BsdWdpbkV4aXN0cyhwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zID8/IHt9LCBzdXBwb3J0ZWRCQVBsdWdpbklkcy5wYXNza2V5KVxuICBjb25zdCBsb2dpbk1ldGhvZHMgPSBwbHVnaW5PcHRpb25zLmFkbWluPy5sb2dpbk1ldGhvZHMgPz8gW11cbiAgY29uc3QgbG9naW5XaXRoVXNlcm5hbWUgPSBjb2xsZWN0aW9ucz8uW3VzZXJTbHVnXT8uY29uZmlnLmF1dGgubG9naW5XaXRoVXNlcm5hbWVcbiAgY29uc3QgY2FuTG9naW5XaXRoVXNlcm5hbWUgPSAoaGFzVXNlcm5hbWVQbHVnaW4gJiYgbG9naW5XaXRoVXNlcm5hbWUpID8/IGZhbHNlXG5cbiAgcmV0dXJuIChcbiAgICA8TWluaW1hbFRlbXBsYXRlIGNsYXNzTmFtZT17bG9naW5CYXNlQ2xhc3N9PlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake2xvZ2luQmFzZUNsYXNzfV9fYnJhbmRgfT5cbiAgICAgICAgPExvZ29cbiAgICAgICAgICBpMThuPXtpMThufVxuICAgICAgICAgIGxvY2FsZT17bG9jYWxlfVxuICAgICAgICAgIHBhcmFtcz17cGFyYW1zfVxuICAgICAgICAgIHBheWxvYWQ9e3BheWxvYWR9XG4gICAgICAgICAgcGVybWlzc2lvbnM9e3Blcm1pc3Npb25zfVxuICAgICAgICAgIHNlYXJjaFBhcmFtcz17c2VhcmNoUGFyYW1zfVxuICAgICAgICAgIHVzZXI9e3VzZXIgPz8gdW5kZWZpbmVkfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgICB7UmVuZGVyU2VydmVyQ29tcG9uZW50KHtcbiAgICAgICAgQ29tcG9uZW50OiBiZWZvcmVMb2dpbixcbiAgICAgICAgaW1wb3J0TWFwOiBwYXlsb2FkLmltcG9ydE1hcCxcbiAgICAgICAgc2VydmVyUHJvcHM6IHtcbiAgICAgICAgICBpMThuLFxuICAgICAgICAgIGxvY2FsZSxcbiAgICAgICAgICBwYXJhbXMsXG4gICAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgICBwZXJtaXNzaW9ucyxcbiAgICAgICAgICBzZWFyY2hQYXJhbXMsXG4gICAgICAgICAgdXNlcjogdXNlciA/PyB1bmRlZmluZWRcbiAgICAgICAgfSBzYXRpc2ZpZXMgU2VydmVyUHJvcHNcbiAgICAgIH0pfVxuICAgICAgPEFkbWluTG9naW5DbGllbnRcbiAgICAgICAgbG9naW5XaXRoVXNlcm5hbWU9e2NhbkxvZ2luV2l0aFVzZXJuYW1lfVxuICAgICAgICBoYXNVc2VybmFtZVBsdWdpbj17aGFzVXNlcm5hbWVQbHVnaW59XG4gICAgICAgIGhhc1Bhc3NrZXlQbHVnaW49e2hhc1Bhc3NrZXlQbHVnaW59XG4gICAgICAgIGxvZ2luTWV0aG9kcz17bG9naW5NZXRob2RzfVxuICAgICAgICBwcmVmaWxsRW1haWw9e3ByZWZpbGxFbWFpbH1cbiAgICAgICAgcHJlZmlsbFBhc3N3b3JkPXtwcmVmaWxsUGFzc3dvcmR9XG4gICAgICAgIHByZWZpbGxVc2VybmFtZT17cHJlZmlsbFVzZXJuYW1lfVxuICAgICAgICBzZWFyY2hQYXJhbXM9e3NlYXJjaFBhcmFtcyA/PyB7fX1cbiAgICAgICAgYmFzZVVSTD17cGx1Z2luT3B0aW9ucy5iZXR0ZXJBdXRoT3B0aW9ucz8uYmFzZVVSTH1cbiAgICAgICAgYmFzZVBhdGg9e3BsdWdpbk9wdGlvbnMuYmV0dGVyQXV0aE9wdGlvbnM/LmJhc2VQYXRofVxuICAgICAgLz5cbiAgICAgIHtSZW5kZXJTZXJ2ZXJDb21wb25lbnQoe1xuICAgICAgICBDb21wb25lbnQ6IGZpbHRlcmVkQWZ0ZXJMb2dpbixcbiAgICAgICAgaW1wb3J0TWFwOiBwYXlsb2FkLmltcG9ydE1hcCxcbiAgICAgICAgc2VydmVyUHJvcHM6IHtcbiAgICAgICAgICBpMThuLFxuICAgICAgICAgIGxvY2FsZSxcbiAgICAgICAgICBwYXJhbXMsXG4gICAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgICBwZXJtaXNzaW9ucyxcbiAgICAgICAgICBzZWFyY2hQYXJhbXMsXG4gICAgICAgICAgdXNlcjogdXNlciA/PyB1bmRlZmluZWRcbiAgICAgICAgfSBzYXRpc2ZpZXMgU2VydmVyUHJvcHNcbiAgICAgIH0pfVxuICAgIDwvTWluaW1hbFRlbXBsYXRlPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IEFkbWluTG9naW5cbiJdLCJuYW1lcyI6WyJSZWFjdCIsIkFkbWluTG9naW5DbGllbnQiLCJyZWRpcmVjdCIsIkxvZ28iLCJnZXRTYWZlUmVkaXJlY3QiLCJjaGVja1BsdWdpbkV4aXN0cyIsIlJlbmRlclNlcnZlckNvbXBvbmVudCIsImFkbWluUm91dGVzIiwiZGVmYXVsdHMiLCJzdXBwb3J0ZWRCQVBsdWdpbklkcyIsIk1pbmltYWxUZW1wbGF0ZSIsImxvZ2luQmFzZUNsYXNzIiwiQWRtaW5Mb2dpbiIsImluaXRQYWdlUmVzdWx0IiwicGFyYW1zIiwic2VhcmNoUGFyYW1zIiwicGx1Z2luT3B0aW9ucyIsImFkbWluSW52aXRhdGlvbnNTbHVnIiwibG9jYWxlIiwicGVybWlzc2lvbnMiLCJyZXEiLCJpMThuIiwicGF5bG9hZCIsImNvbmZpZyIsImNvbGxlY3Rpb25zIiwidXNlciIsImFkbWluIiwiY29tcG9uZW50cyIsImFmdGVyTG9naW4iLCJiZWZvcmVMb2dpbiIsInVzZXJTbHVnIiwicm91dGVzIiwiYWRtaW5Sb3V0ZSIsImFkbWluUm9sZSIsInVzZXJzIiwiZGVmYXVsdEFkbWluUm9sZSIsInJlZGlyZWN0VXJsIiwiYWRtaW5Db3VudCIsImNvdW50IiwiY29sbGVjdGlvbiIsIndoZXJlIiwicm9sZSIsImVxdWFscyIsInRvdGFsRG9jcyIsImV4aXN0aW5nSW52aXRhdGlvbnMiLCJmaW5kIiwidG9rZW4iLCJkb2NzIiwiY3J5cHRvIiwicmFuZG9tVVVJRCIsImNyZWF0ZSIsImRhdGEiLCJhZG1pblNpZ251cCIsImZpbHRlcmVkQWZ0ZXJMb2dpbiIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsInNsaWNlIiwidW5kZWZpbmVkIiwicHJlZmlsbEF1dG9Mb2dpbiIsImF1dG9Mb2dpbiIsInByZWZpbGxPbmx5IiwicHJlZmlsbFVzZXJuYW1lIiwidXNlcm5hbWUiLCJwcmVmaWxsRW1haWwiLCJlbWFpbCIsInByZWZpbGxQYXNzd29yZCIsInBhc3N3b3JkIiwiaGFzVXNlcm5hbWVQbHVnaW4iLCJiZXR0ZXJBdXRoT3B0aW9ucyIsImhhc1Bhc3NrZXlQbHVnaW4iLCJwYXNza2V5IiwibG9naW5NZXRob2RzIiwibG9naW5XaXRoVXNlcm5hbWUiLCJhdXRoIiwiY2FuTG9naW5XaXRoVXNlcm5hbWUiLCJjbGFzc05hbWUiLCJkaXYiLCJDb21wb25lbnQiLCJpbXBvcnRNYXAiLCJzZXJ2ZXJQcm9wcyIsImJhc2VVUkwiLCJiYXNlUGF0aCJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU9BLFdBQVcsUUFBTztBQUN6QixTQUFTQyxnQkFBZ0IsUUFBUSxXQUFVO0FBQzNDLFNBQVNDLFFBQVEsUUFBUSxrQkFBaUI7QUFDMUMsU0FBU0MsSUFBSSxRQUFRLHdDQUEwQjtBQUMvQyxTQUFTQyxlQUFlLFFBQVEsZ0NBQXNEO0FBQ3RGLFNBQVNDLGlCQUFpQixRQUFRLHVDQUFrRDtBQUNwRixTQUFTQyxxQkFBcUIsUUFBUSxnREFBK0M7QUFDckYsU0FBU0MsV0FBVyxFQUFFQyxRQUFRLEVBQUVDLG9CQUFvQixRQUFRLHFCQUFnQztBQUM1RixTQUFTQyxlQUFlLFFBQVEsNkJBQTRCO0FBSTVELE9BQU8sTUFBTUMsaUJBQWlCLFFBQU87QUFPckMsTUFBTUMsYUFBd0MsT0FBTyxFQUNuREMsY0FBYyxFQUNkQyxNQUFNLEVBQ05DLFlBQVksRUFDWkMsYUFBYSxFQUNiQyxvQkFBb0IsRUFDSjtJQUNoQixNQUFNLEVBQUVDLE1BQU0sRUFBRUMsV0FBVyxFQUFFQyxHQUFHLEVBQUUsR0FBR1A7SUFDckMsTUFBTSxFQUNKUSxJQUFJLEVBQ0pDLFNBQVMsRUFBRUMsTUFBTSxFQUFFQyxXQUFXLEVBQUUsRUFDaENGLE9BQU8sRUFDUEcsSUFBSSxFQUNMLEdBQUdMO0lBRUosTUFBTSxFQUNKTSxPQUFPLEVBQUVDLFlBQVksRUFBRUMsVUFBVSxF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