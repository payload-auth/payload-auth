import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { AdminLoginClient } from "./client";
import { redirect } from "next/navigation";
import { Logo } from "../../../../../shared/components/logo";
import { getSafeRedirect } from "../../utils/get-safe-redirect";
import { MinimalTemplate } from "@payloadcms/next/templates";
import { checkPluginExists } from "../../../helpers/check-plugin-exists";
import { RenderServerComponent } from "@payloadcms/ui/elements/RenderServerComponent";
import { adminRoutes, defaults, supportedBAPluginIds } from "../../../constants";
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC92aWV3cy9hZG1pbi1sb2dpbi9pbmRleC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQWRtaW5Mb2dpbkNsaWVudCB9IGZyb20gJy4vY2xpZW50J1xuaW1wb3J0IHsgcmVkaXJlY3QgfSBmcm9tICduZXh0L25hdmlnYXRpb24nXG5pbXBvcnQgeyBMb2dvIH0gZnJvbSAnQC9zaGFyZWQvY29tcG9uZW50cy9sb2dvJ1xuaW1wb3J0IHsgZ2V0U2FmZVJlZGlyZWN0IH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC91dGlscy9nZXQtc2FmZS1yZWRpcmVjdCdcbmltcG9ydCB7IE1pbmltYWxUZW1wbGF0ZSB9IGZyb20gJ0BwYXlsb2FkY21zL25leHQvdGVtcGxhdGVzJ1xuaW1wb3J0IHsgY2hlY2tQbHVnaW5FeGlzdHMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9oZWxwZXJzL2NoZWNrLXBsdWdpbi1leGlzdHMnXG5pbXBvcnQgeyBSZW5kZXJTZXJ2ZXJDb21wb25lbnQgfSBmcm9tICdAcGF5bG9hZGNtcy91aS9lbGVtZW50cy9SZW5kZXJTZXJ2ZXJDb21wb25lbnQnXG5pbXBvcnQgeyBhZG1pblJvdXRlcywgZGVmYXVsdHMsIHN1cHBvcnRlZEJBUGx1Z2luSWRzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vY29uc3RhbnRzJ1xuXG5pbXBvcnQgeyB0eXBlIEFkbWluVmlld1NlcnZlclByb3BzLCB0eXBlIFNlcnZlclByb3BzIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB0eXBlIHsgQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi90eXBlcydcblxuZXhwb3J0IGNvbnN0IGxvZ2luQmFzZUNsYXNzID0gJ2xvZ2luJ1xuXG5pbnRlcmZhY2UgQWRtaW5Mb2dpblByb3BzIGV4dGVuZHMgQWRtaW5WaWV3U2VydmVyUHJvcHMge1xuICBhZG1pbkludml0YXRpb25zU2x1Zzogc3RyaW5nXG4gIHBsdWdpbk9wdGlvbnM6IEJldHRlckF1dGhQbHVnaW5PcHRpb25zXG59XG5cbmNvbnN0IEFkbWluTG9naW46IFJlYWN0LkZDPEFkbWluTG9naW5Qcm9wcz4gPSBhc3luYyAoe1xuICBpbml0UGFnZVJlc3VsdCxcbiAgcGFyYW1zLFxuICBzZWFyY2hQYXJhbXMsXG4gIHBsdWdpbk9wdGlvbnMsXG4gIGFkbWluSW52aXRhdGlvbnNTbHVnXG59OiBBZG1pbkxvZ2luUHJvcHMpID0+IHtcbiAgY29uc3QgeyBsb2NhbGUsIHBlcm1pc3Npb25zLCByZXEgfSA9IGluaXRQYWdlUmVzdWx0XG4gIGNvbnN0IHtcbiAgICBpMThuLFxuICAgIHBheWxvYWQ6IHsgY29uZmlnLCBjb2xsZWN0aW9ucyB9LFxuICAgIHBheWxvYWQsXG4gICAgdXNlclxuICB9ID0gcmVxXG5cbiAgY29uc3Qge1xuICAgIGFkbWluOiB7IGNvbXBvbmVudHM6IHsgYWZ0ZXJMb2dpbiwgYmVmb3JlTG9naW4gfSA9IHt9LCB1c2VyOiB1c2VyU2x1ZyB9LFxuICAgIHJvdXRlczogeyBhZG1pbjogYWRtaW5Sb3V0ZSB9XG4gIH0gPSBjb25maWdcblxuICBjb25zdCBhZG1pblJvbGUgPSBwbHVnaW5PcHRpb25zLnVzZXJzPy5kZWZhdWx0QWRtaW5Sb2xlID8/IGRlZmF1bHRzLmFkbWluUm9sZVxuICBjb25zdCByZWRpcmVjdFVybCA9IGdldFNhZmVSZWRpcmVjdChzZWFyY2hQYXJhbXM/LnJlZGlyZWN0ID8/ICcnLCBhZG1pblJvdXRlKVxuXG4gIGlmICh1c2VyKSB7XG4gICAgcmVkaXJlY3QocmVkaXJlY3RVcmwpXG4gIH1cblxuICBjb25zdCBhZG1pbkNvdW50ID0gYXdhaXQgcmVxLnBheWxvYWQuY291bnQoe1xuICAgIGNvbGxlY3Rpb246IHVzZXJTbHVnLFxuICAgIHdoZXJlOiB7XG4gICAgICByb2xlOiB7XG4gICAgICAgIGVxdWFsczogYWRtaW5Sb2xlXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIGlmIChhZG1pbkNvdW50LnRvdGFsRG9jcyA9PT0gMCkge1xuICAgIC8vIENoZWNrIGlmIHdlIGFscmVhZHkgaGF2ZSBhbiBhZG1pbiBpbnZpdGF0aW9uXG4gICAgY29uc3QgZXhpc3RpbmdJbnZpdGF0aW9ucyA9IGF3YWl0IHJlcS5wYXlsb2FkLmZpbmQoe1xuICAgICAgY29sbGVjdGlvbjogYWRtaW5JbnZpdGF0aW9uc1NsdWcsXG4gICAgICB3aGVyZToge1xuICAgICAgICByb2xlOiB7XG4gICAgICAgICAgZXF1YWxzOiBhZG1pblJvbGVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBsZXQgdG9rZW5cblxuICAgIGlmIChleGlzdGluZ0ludml0YXRpb25zLnRvdGFsRG9jcyA+IDApIHtcbiAgICAgIC8vIFVzZSBleGlzdGluZyB0b2tlblxuICAgICAgdG9rZW4gPSBleGlzdGluZ0ludml0YXRpb25zLmRvY3NbMF0udG9rZW5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gR2VuZXJhdGUgYSBuZXcgc2VjdXJlIGludml0ZSB0b2tlblxuICAgICAgdG9rZW4gPSBjcnlwdG8ucmFuZG9tVVVJRCgpXG4gICAgICBhd2FpdCByZXEucGF5bG9hZC5jcmVhdGUoe1xuICAgICAgICBjb2xsZWN0aW9uOiBhZG1pbkludml0YXRpb25zU2x1ZyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHJvbGU6IGFkbWluUm9sZSxcbiAgICAgICAgICB0b2tlblxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIHJlZGlyZWN0KGAke2FkbWluUm91dGV9JHthZG1pblJvdXRlcy5hZG1pblNpZ251cH0/dG9rZW49JHt0b2tlbn1gKVxuICB9XG5cbiAgLy8gRmlsdGVyIG91dCB0aGUgZmlyc3QgY29tcG9uZW50IGZyb20gYWZ0ZXJMb2dpbiBhcnJheSBvciBzZXQgdG8gdW5kZWZpbmVkIGlmIG5vdCBtb3JlIHRoYW4gMVxuICAvLyBUaGlzIGlzIGJlY2F1c2Ugb2YgdGhlIGN1c3RvbSBsb2dpbiByZWRpcmVjdCBjb21wb25lbnQsIHdlIGRvbid0IHdhbnQgYW4gaW5maW5pdGUgbG9vcFxuICBjb25zdCBmaWx0ZXJlZEFmdGVyTG9naW4gPSBBcnJheS5pc0FycmF5KGFmdGVyTG9naW4pICYmIGFmdGVyTG9naW4ubGVuZ3RoID4gMSA/IGFmdGVyTG9naW4uc2xpY2UoMSkgOiB1bmRlZmluZWRcbiAgY29uc3QgcHJlZmlsbEF1dG9Mb2dpbiA9IHR5cGVvZiBjb25maWcuYWRtaW4/LmF1dG9Mb2dpbiA9PT0gJ29iamVjdCcgJiYgY29uZmlnLmFkbWluPy5hdXRvTG9naW4ucHJlZmlsbE9ubHlcbiAgY29uc3QgcHJlZmlsbFVzZXJuYW1lID0gcHJlZmlsbEF1dG9Mb2dpbiAmJiB0eXBlb2YgY29uZmlnLmFkbWluPy5hdXRvTG9naW4gPT09ICdvYmplY3QnID8gY29uZmlnLmFkbWluPy5hdXRvTG9naW4udXNlcm5hbWUgOiB1bmRlZmluZWRcbiAgY29uc3QgcHJlZmlsbEVtYWlsID0gcHJlZmlsbEF1dG9Mb2dpbiAmJiB0eXBlb2YgY29uZmlnLmFkbWluPy5hdXRvTG9naW4gPT09ICdvYmplY3QnID8gY29uZmlnLmFkbWluPy5hdXRvTG9naW4uZW1haWwgOiB1bmRlZmluZWRcbiAgY29uc3QgcHJlZmlsbFBhc3N3b3JkID0gcHJlZmlsbEF1dG9Mb2dpbiAmJiB0eXBlb2YgY29uZmlnLmFkbWluPy5hdXRvTG9naW4gPT09ICdvYmplY3QnID8gY29uZmlnLmFkbWluPy5hdXRvTG9naW4ucGFzc3dvcmQgOiB1bmRlZmluZWRcbiAgY29uc3QgaGFzVXNlcm5hbWVQbHVnaW4gPSBjaGVja1BsdWdpbkV4aXN0cyhwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zID8/IHt9LCBzdXBwb3J0ZWRCQVBsdWdpbklkcy51c2VybmFtZSlcbiAgY29uc3QgaGFzUGFzc2tleVBsdWdpbiA9IGNoZWNrUGx1Z2luRXhpc3RzKHBsdWdpbk9wdGlvbnMuYmV0dGVyQXV0aE9wdGlvbnMgPz8ge30sIHN1cHBvcnRlZEJBUGx1Z2luSWRzLnBhc3NrZXkpXG4gIGNvbnN0IGxvZ2luTWV0aG9kcyA9IHBsdWdpbk9wdGlvbnMuYWRtaW4/LmxvZ2luTWV0aG9kcyA/PyBbXVxuICBjb25zdCBsb2dpbldpdGhVc2VybmFtZSA9IGNvbGxlY3Rpb25zPy5bdXNlclNsdWddPy5jb25maWcuYXV0aC5sb2dpbldpdGhVc2VybmFtZVxuICBjb25zdCBjYW5Mb2dpbldpdGhVc2VybmFtZSA9IChoYXNVc2VybmFtZVBsdWdpbiAmJiBsb2dpbldpdGhVc2VybmFtZSkgPz8gZmFsc2VcblxuICByZXR1cm4gKFxuICAgIDxNaW5pbWFsVGVtcGxhdGUgY2xhc3NOYW1lPXtsb2dpbkJhc2VDbGFzc30+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7bG9naW5CYXNlQ2xhc3N9X19icmFuZGB9PlxuICAgICAgICA8TG9nb1xuICAgICAgICAgIGkxOG49e2kxOG59XG4gICAgICAgICAgbG9jYWxlPXtsb2NhbGV9XG4gICAgICAgICAgcGFyYW1zPXtwYXJhbXN9XG4gICAgICAgICAgcGF5bG9hZD17cGF5bG9hZH1cbiAgICAgICAgICBwZXJtaXNzaW9ucz17cGVybWlzc2lvbnN9XG4gICAgICAgICAgc2VhcmNoUGFyYW1zPXtzZWFyY2hQYXJhbXN9XG4gICAgICAgICAgdXNlcj17dXNlciA/PyB1bmRlZmluZWR9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIHtSZW5kZXJTZXJ2ZXJDb21wb25lbnQoe1xuICAgICAgICBDb21wb25lbnQ6IGJlZm9yZUxvZ2luLFxuICAgICAgICBpbXBvcnRNYXA6IHBheWxvYWQuaW1wb3J0TWFwLFxuICAgICAgICBzZXJ2ZXJQcm9wczoge1xuICAgICAgICAgIGkxOG4sXG4gICAgICAgICAgbG9jYWxlLFxuICAgICAgICAgIHBhcmFtcyxcbiAgICAgICAgICBwYXlsb2FkLFxuICAgICAgICAgIHBlcm1pc3Npb25zLFxuICAgICAgICAgIHNlYXJjaFBhcmFtcyxcbiAgICAgICAgICB1c2VyOiB1c2VyID8/IHVuZGVmaW5lZFxuICAgICAgICB9IHNhdGlzZmllcyBTZXJ2ZXJQcm9wc1xuICAgICAgfSl9XG4gICAgICA8QWRtaW5Mb2dpbkNsaWVudFxuICAgICAgICBsb2dpbldpdGhVc2VybmFtZT17Y2FuTG9naW5XaXRoVXNlcm5hbWV9XG4gICAgICAgIGhhc1VzZXJuYW1lUGx1Z2luPXtoYXNVc2VybmFtZVBsdWdpbn1cbiAgICAgICAgaGFzUGFzc2tleVBsdWdpbj17aGFzUGFzc2tleVBsdWdpbn1cbiAgICAgICAgbG9naW5NZXRob2RzPXtsb2dpbk1ldGhvZHN9XG4gICAgICAgIHByZWZpbGxFbWFpbD17cHJlZmlsbEVtYWlsfVxuICAgICAgICBwcmVmaWxsUGFzc3dvcmQ9e3ByZWZpbGxQYXNzd29yZH1cbiAgICAgICAgcHJlZmlsbFVzZXJuYW1lPXtwcmVmaWxsVXNlcm5hbWV9XG4gICAgICAgIHNlYXJjaFBhcmFtcz17c2VhcmNoUGFyYW1zID8/IHt9fVxuICAgICAgICBiYXNlVVJMPXtwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zPy5iYXNlVVJMfVxuICAgICAgICBiYXNlUGF0aD17cGx1Z2luT3B0aW9ucy5iZXR0ZXJBdXRoT3B0aW9ucz8uYmFzZVBhdGh9XG4gICAgICAvPlxuICAgICAge1JlbmRlclNlcnZlckNvbXBvbmVudCh7XG4gICAgICAgIENvbXBvbmVudDogZmlsdGVyZWRBZnRlckxvZ2luLFxuICAgICAgICBpbXBvcnRNYXA6IHBheWxvYWQuaW1wb3J0TWFwLFxuICAgICAgICBzZXJ2ZXJQcm9wczoge1xuICAgICAgICAgIGkxOG4sXG4gICAgICAgICAgbG9jYWxlLFxuICAgICAgICAgIHBhcmFtcyxcbiAgICAgICAgICBwYXlsb2FkLFxuICAgICAgICAgIHBlcm1pc3Npb25zLFxuICAgICAgICAgIHNlYXJjaFBhcmFtcyxcbiAgICAgICAgICB1c2VyOiB1c2VyID8/IHVuZGVmaW5lZFxuICAgICAgICB9IHNhdGlzZmllcyBTZXJ2ZXJQcm9wc1xuICAgICAgfSl9XG4gICAgPC9NaW5pbWFsVGVtcGxhdGU+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQWRtaW5Mb2dpblxuIl0sIm5hbWVzIjpbIlJlYWN0IiwiQWRtaW5Mb2dpbkNsaWVudCIsInJlZGlyZWN0IiwiTG9nbyIsImdldFNhZmVSZWRpcmVjdCIsIk1pbmltYWxUZW1wbGF0ZSIsImNoZWNrUGx1Z2luRXhpc3RzIiwiUmVuZGVyU2VydmVyQ29tcG9uZW50IiwiYWRtaW5Sb3V0ZXMiLCJkZWZhdWx0cyIsInN1cHBvcnRlZEJBUGx1Z2luSWRzIiwibG9naW5CYXNlQ2xhc3MiLCJBZG1pbkxvZ2luIiwiaW5pdFBhZ2VSZXN1bHQiLCJwYXJhbXMiLCJzZWFyY2hQYXJhbXMiLCJwbHVnaW5PcHRpb25zIiwiYWRtaW5JbnZpdGF0aW9uc1NsdWciLCJsb2NhbGUiLCJwZXJtaXNzaW9ucyIsInJlcSIsImkxOG4iLCJwYXlsb2FkIiwiY29uZmlnIiwiY29sbGVjdGlvbnMiLCJ1c2VyIiwiYWRtaW4iLCJjb21wb25lbnRzIiwiYWZ0ZXJMb2dpbiIsImJlZm9yZUxvZ2luIiwidXNlclNsdWciLCJyb3V0ZXMiLCJhZG1pblJvdXRlIiwiYWRtaW5Sb2xlIiwidXNlcnMiLCJkZWZhdWx0QWRtaW5Sb2xlIiwicmVkaXJlY3RVcmwiLCJhZG1pbkNvdW50IiwiY291bnQiLCJjb2xsZWN0aW9uIiwid2hlcmUiLCJyb2xlIiwiZXF1YWxzIiwidG90YWxEb2NzIiwiZXhpc3RpbmdJbnZpdGF0aW9ucyIsImZpbmQiLCJ0b2tlbiIsImRvY3MiLCJjcnlwdG8iLCJyYW5kb21VVUlEIiwiY3JlYXRlIiwiZGF0YSIsImFkbWluU2lnbnVwIiwiZmlsdGVyZWRBZnRlckxvZ2luIiwiQXJyYXkiLCJpc0FycmF5IiwibGVuZ3RoIiwic2xpY2UiLCJ1bmRlZmluZWQiLCJwcmVmaWxsQXV0b0xvZ2luIiwiYXV0b0xvZ2luIiwicHJlZmlsbE9ubHkiLCJwcmVmaWxsVXNlcm5hbWUiLCJ1c2VybmFtZSIsInByZWZpbGxFbWFpbCIsImVtYWlsIiwicHJlZmlsbFBhc3N3b3JkIiwicGFzc3dvcmQiLCJoYXNVc2VybmFtZVBsdWdpbiIsImJldHRlckF1dGhPcHRpb25zIiwiaGFzUGFzc2tleVBsdWdpbiIsInBhc3NrZXkiLCJsb2dpbk1ldGhvZHMiLCJsb2dpbldpdGhVc2VybmFtZSIsImF1dGgiLCJjYW5Mb2dpbldpdGhVc2VybmFtZSIsImNsYXNzTmFtZSIsImRpdiIsIkNvbXBvbmVudCIsImltcG9ydE1hcCIsInNlcnZlclByb3BzIiwiYmFzZVVSTCIsImJhc2VQYXRoIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBT0EsV0FBVyxRQUFPO0FBQ3pCLFNBQVNDLGdCQUFnQixRQUFRLFdBQVU7QUFDM0MsU0FBU0MsUUFBUSxRQUFRLGtCQUFpQjtBQUMxQyxTQUFTQyxJQUFJLFFBQVEsd0NBQTBCO0FBQy9DLFNBQVNDLGVBQWUsUUFBUSxnQ0FBc0Q7QUFDdEYsU0FBU0MsZUFBZSxRQUFRLDZCQUE0QjtBQUM1RCxTQUFTQyxpQkFBaUIsUUFBUSx1Q0FBa0Q7QUFDcEYsU0FBU0MscUJBQXFCLFFBQVEsZ0RBQStDO0FBQ3JGLFNBQVNDLFdBQVcsRUFBRUMsUUFBUSxFQUFFQyxvQkFBb0IsUUFBUSxxQkFBZ0M7QUFLNUYsT0FBTyxNQUFNQyxpQkFBaUIsUUFBTztBQU9yQyxNQUFNQyxhQUF3QyxPQUFPLEVBQ25EQyxjQUFjLEVBQ2RDLE1BQU0sRUFDTkMsWUFBWSxFQUNaQyxhQUFhLEVBQ2JDLG9CQUFvQixFQUNKO0lBQ2hCLE1BQU0sRUFBRUMsTUFBTSxFQUFFQyxXQUFXLEVBQUVDLEdBQUcsRUFBRSxHQUFHUDtJQUNyQyxNQUFNLEVBQ0pRLElBQUksRUFDSkMsU0FBUyxFQUFFQyxNQUFNLEVBQUVDLFdBQVcsRUFBRSxFQUNoQ0YsT0FBTyxFQUNQRyxJQUFJLEVBQ0wsR0FBR0w7SUFFSixNQUFNLEVBQ0pNLE9BQU8sRUFBRUMsWUFBWSxFQUFFQyxVQUFV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