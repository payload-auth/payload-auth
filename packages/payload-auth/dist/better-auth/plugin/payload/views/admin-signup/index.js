import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { z } from "zod";
import { Logo } from "../../../../../shared/components/logo";
import { AdminSignupClient } from "./client";
import { FormHeader } from "../../../../../shared/form/ui/header";
import { supportedBAPluginIds } from "../../../constants";
import { MinimalTemplate } from "@payloadcms/next/templates";
import { checkPluginExists } from "../../../helpers/check-plugin-exists";
//  Avoid the need for custom styles
const baseClass = 'login';
const searchParamsSchema = z.object({
    token: z.string()
});
const AdminSignup = async ({ initPageResult, params, searchParams, pluginOptions, adminInvitationsSlug })=>{
    const { locale, permissions, req, req: { i18n, user, payload: { collections, config: { admin: { user: userSlug } } } } } = initPageResult;
    const { success, data } = searchParamsSchema.safeParse(searchParams);
    let hasInvalidToken = false;
    if (!success) {
        hasInvalidToken = true;
    } else {
        const { totalDocs: isValidInvite } = await req.payload.count({
            collection: adminInvitationsSlug,
            where: {
                token: {
                    equals: data.token
                }
            }
        });
        if (!isValidInvite) {
            hasInvalidToken = true;
        }
    }
    const loginMethods = pluginOptions.admin?.loginMethods ?? [];
    const hasUsernamePlugin = checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.username);
    const loginWithUsername = collections?.[userSlug]?.config.auth.loginWithUsername;
    const canLoginWithUsername = (hasUsernamePlugin && loginWithUsername) ?? false;
    return /*#__PURE__*/ _jsxs(MinimalTemplate, {
        className: `${baseClass} admin-signup`,
        children: [
            /*#__PURE__*/ _jsx("div", {
                className: `${baseClass}__brand admin-signup__brand`,
                children: /*#__PURE__*/ _jsx(Logo, {
                    i18n: i18n,
                    locale: locale,
                    params: params,
                    payload: req.payload,
                    permissions: permissions,
                    searchParams: searchParams,
                    user: user ?? undefined
                })
            }),
            hasInvalidToken ? /*#__PURE__*/ _jsx(FormHeader, {
                style: {
                    textAlign: 'center'
                },
                heading: "Invalid or expired token",
                description: "You need to get a new invite to sign up."
            }) : data && /*#__PURE__*/ _jsx(AdminSignupClient, {
                adminInviteToken: data.token,
                userSlug: userSlug,
                loginMethods: loginMethods,
                searchParams: searchParams ?? {},
                loginWithUsername: canLoginWithUsername,
                baseURL: pluginOptions.betterAuthOptions?.baseURL,
                basePath: pluginOptions.betterAuthOptions?.basePath
            })
        ]
    });
};
export default AdminSignup;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC92aWV3cy9hZG1pbi1zaWdudXAvaW5kZXgudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnXG5pbXBvcnQgeyBMb2dvIH0gZnJvbSAnQC9zaGFyZWQvY29tcG9uZW50cy9sb2dvJ1xuaW1wb3J0IHsgQWRtaW5TaWdudXBDbGllbnQgfSBmcm9tICcuL2NsaWVudCdcbmltcG9ydCB7IEZvcm1IZWFkZXIgfSBmcm9tICdAL3NoYXJlZC9mb3JtL3VpL2hlYWRlcidcbmltcG9ydCB7IHN1cHBvcnRlZEJBUGx1Z2luSWRzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgTWluaW1hbFRlbXBsYXRlIH0gZnJvbSAnQHBheWxvYWRjbXMvbmV4dC90ZW1wbGF0ZXMnXG5pbXBvcnQgdHlwZSB7IEFkbWluVmlld1NlcnZlclByb3BzIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB0eXBlIHsgQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi90eXBlcydcbmltcG9ydCB7IGNoZWNrUGx1Z2luRXhpc3RzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vaGVscGVycy9jaGVjay1wbHVnaW4tZXhpc3RzJ1xuXG4vLyAgQXZvaWQgdGhlIG5lZWQgZm9yIGN1c3RvbSBzdHlsZXNcbmNvbnN0IGJhc2VDbGFzcyA9ICdsb2dpbidcblxuY29uc3Qgc2VhcmNoUGFyYW1zU2NoZW1hID0gei5vYmplY3Qoe1xuICB0b2tlbjogei5zdHJpbmcoKVxufSlcblxuaW50ZXJmYWNlIEFkbWluU2lnbnVwUHJvcHMgZXh0ZW5kcyBBZG1pblZpZXdTZXJ2ZXJQcm9wcyB7XG4gIGFkbWluSW52aXRhdGlvbnNTbHVnOiBzdHJpbmdcbiAgcGx1Z2luT3B0aW9uczogQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnNcbn1cblxuY29uc3QgQWRtaW5TaWdudXA6IFJlYWN0LkZDPEFkbWluU2lnbnVwUHJvcHM+ID0gYXN5bmMgKHtcbiAgaW5pdFBhZ2VSZXN1bHQsXG4gIHBhcmFtcyxcbiAgc2VhcmNoUGFyYW1zLFxuICBwbHVnaW5PcHRpb25zLFxuICBhZG1pbkludml0YXRpb25zU2x1Z1xufTogQWRtaW5TaWdudXBQcm9wcykgPT4ge1xuICBjb25zdCB7XG4gICAgbG9jYWxlLFxuICAgIHBlcm1pc3Npb25zLFxuICAgIHJlcSxcbiAgICByZXE6IHtcbiAgICAgIGkxOG4sXG4gICAgICB1c2VyLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBjb2xsZWN0aW9ucyxcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgYWRtaW46IHsgdXNlcjogdXNlclNsdWcgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9ID0gaW5pdFBhZ2VSZXN1bHRcblxuICBjb25zdCB7IHN1Y2Nlc3MsIGRhdGEgfSA9IHNlYXJjaFBhcmFtc1NjaGVtYS5zYWZlUGFyc2Uoc2VhcmNoUGFyYW1zKVxuXG4gIGxldCBoYXNJbnZhbGlkVG9rZW4gPSBmYWxzZVxuICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICBoYXNJbnZhbGlkVG9rZW4gPSB0cnVlXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgeyB0b3RhbERvY3M6IGlzVmFsaWRJbnZpdGUgfSA9IGF3YWl0IHJlcS5wYXlsb2FkLmNvdW50KHtcbiAgICAgIGNvbGxlY3Rpb246IGFkbWluSW52aXRhdGlvbnNTbHVnLFxuICAgICAgd2hlcmU6IHsgdG9rZW46IHsgZXF1YWxzOiBkYXRhLnRva2VuIH0gfVxuICAgIH0pXG4gICAgaWYgKCFpc1ZhbGlkSW52aXRlKSB7XG4gICAgICBoYXNJbnZhbGlkVG9rZW4gPSB0cnVlXG4gICAgfVxuICB9XG5cbiAgY29uc3QgbG9naW5NZXRob2RzID0gcGx1Z2luT3B0aW9ucy5hZG1pbj8ubG9naW5NZXRob2RzID8/IFtdXG4gIGNvbnN0IGhhc1VzZXJuYW1lUGx1Z2luID0gY2hlY2tQbHVnaW5FeGlzdHMocGx1Z2luT3B0aW9ucy5iZXR0ZXJBdXRoT3B0aW9ucyA/PyB7fSwgc3VwcG9ydGVkQkFQbHVnaW5JZHMudXNlcm5hbWUpXG4gIGNvbnN0IGxvZ2luV2l0aFVzZXJuYW1lID0gY29sbGVjdGlvbnM/Llt1c2VyU2x1Z10/LmNvbmZpZy5hdXRoLmxvZ2luV2l0aFVzZXJuYW1lXG4gIGNvbnN0IGNhbkxvZ2luV2l0aFVzZXJuYW1lID0gKGhhc1VzZXJuYW1lUGx1Z2luICYmIGxvZ2luV2l0aFVzZXJuYW1lKSA/PyBmYWxzZVxuXG4gIHJldHVybiAoXG4gICAgPE1pbmltYWxUZW1wbGF0ZSBjbGFzc05hbWU9e2Ake2Jhc2VDbGFzc30gYWRtaW4tc2lnbnVwYH0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7YmFzZUNsYXNzfV9fYnJhbmQgYWRtaW4tc2lnbnVwX19icmFuZGB9PlxuICAgICAgICA8TG9nb1xuICAgICAgICAgIGkxOG49e2kxOG59XG4gICAgICAgICAgbG9jYWxlPXtsb2NhbGV9XG4gICAgICAgICAgcGFyYW1zPXtwYXJhbXN9XG4gICAgICAgICAgcGF5bG9hZD17cmVxLnBheWxvYWR9XG4gICAgICAgICAgcGVybWlzc2lvbnM9e3Blcm1pc3Npb25zfVxuICAgICAgICAgIHNlYXJjaFBhcmFtcz17c2VhcmNoUGFyYW1zfVxuICAgICAgICAgIHVzZXI9e3VzZXIgPz8gdW5kZWZpbmVkfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgICB7aGFzSW52YWxpZFRva2VuID8gKFxuICAgICAgICA8Rm9ybUhlYWRlclxuICAgICAgICAgIHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicgfX1cbiAgICAgICAgICBoZWFkaW5nPVwiSW52YWxpZCBvciBleHBpcmVkIHRva2VuXCJcbiAgICAgICAgICBkZXNjcmlwdGlvbj1cIllvdSBuZWVkIHRvIGdldCBhIG5ldyBpbnZpdGUgdG8gc2lnbiB1cC5cIlxuICAgICAgICAvPlxuICAgICAgKSA6IChcbiAgICAgICAgZGF0YSAmJiAoXG4gICAgICAgICAgPEFkbWluU2lnbnVwQ2xpZW50XG4gICAgICAgICAgICBhZG1pbkludml0ZVRva2VuPXtkYXRhLnRva2VufVxuICAgICAgICAgICAgdXNlclNsdWc9e3VzZXJTbHVnfVxuICAgICAgICAgICAgbG9naW5NZXRob2RzPXtsb2dpbk1ldGhvZHN9XG4gICAgICAgICAgICBzZWFyY2hQYXJhbXM9e3NlYXJjaFBhcmFtcyA/PyB7fX1cbiAgICAgICAgICAgIGxvZ2luV2l0aFVzZXJuYW1lPXtjYW5Mb2dpbldpdGhVc2VybmFtZX1cbiAgICAgICAgICAgIGJhc2VVUkw9e3BsdWdpbk9wdGlvbnMuYmV0dGVyQXV0aE9wdGlvbnM/LmJhc2VVUkx9XG4gICAgICAgICAgICBiYXNlUGF0aD17cGx1Z2luT3B0aW9ucy5iZXR0ZXJBdXRoT3B0aW9ucz8uYmFzZVBhdGh9XG4gICAgICAgICAgLz5cbiAgICAgICAgKVxuICAgICAgKX1cbiAgICA8L01pbmltYWxUZW1wbGF0ZT5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBBZG1pblNpZ251cFxuIl0sIm5hbWVzIjpbIlJlYWN0IiwieiIsIkxvZ28iLCJBZG1pblNpZ251cENsaWVudCIsIkZvcm1IZWFkZXIiLCJzdXBwb3J0ZWRCQVBsdWdpbklkcyIsIk1pbmltYWxUZW1wbGF0ZSIsImNoZWNrUGx1Z2luRXhpc3RzIiwiYmFzZUNsYXNzIiwic2VhcmNoUGFyYW1zU2NoZW1hIiwib2JqZWN0IiwidG9rZW4iLCJzdHJpbmciLCJBZG1pblNpZ251cCIsImluaXRQYWdlUmVzdWx0IiwicGFyYW1zIiwic2VhcmNoUGFyYW1zIiwicGx1Z2luT3B0aW9ucyIsImFkbWluSW52aXRhdGlvbnNTbHVnIiwibG9jYWxlIiwicGVybWlzc2lvbnMiLCJyZXEiLCJpMThuIiwidXNlciIsInBheWxvYWQiLCJjb2xsZWN0aW9ucyIsImNvbmZpZyIsImFkbWluIiwidXNlclNsdWciLCJzdWNjZXNzIiwiZGF0YSIsInNhZmVQYXJzZSIsImhhc0ludmFsaWRUb2tlbiIsInRvdGFsRG9jcyIsImlzVmFsaWRJbnZpdGUiLCJjb3VudCIsImNvbGxlY3Rpb24iLCJ3aGVyZSIsImVxdWFscyIsImxvZ2luTWV0aG9kcyIsImhhc1VzZXJuYW1lUGx1Z2luIiwiYmV0dGVyQXV0aE9wdGlvbnMiLCJ1c2VybmFtZSIsImxvZ2luV2l0aFVzZXJuYW1lIiwiYXV0aCIsImNhbkxvZ2luV2l0aFVzZXJuYW1lIiwiY2xhc3NOYW1lIiwiZGl2IiwidW5kZWZpbmVkIiwic3R5bGUiLCJ0ZXh0QWxpZ24iLCJoZWFkaW5nIiwiZGVzY3JpcHRpb24iLCJhZG1pbkludml0ZVRva2VuIiwiYmFzZVVSTCIsImJhc2VQYXRoIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBT0EsV0FBVyxRQUFPO0FBQ3pCLFNBQVNDLENBQUMsUUFBUSxNQUFLO0FBQ3ZCLFNBQVNDLElBQUksUUFBUSx3Q0FBMEI7QUFDL0MsU0FBU0MsaUJBQWlCLFFBQVEsV0FBVTtBQUM1QyxTQUFTQyxVQUFVLFFBQVEsdUNBQXlCO0FBQ3BELFNBQVNDLG9CQUFvQixRQUFRLHFCQUFnQztBQUNyRSxTQUFTQyxlQUFlLFFBQVEsNkJBQTRCO0FBRzVELFNBQVNDLGlCQUFpQixRQUFRLHVDQUFrRDtBQUVwRixvQ0FBb0M7QUFDcEMsTUFBTUMsWUFBWTtBQUVsQixNQUFNQyxxQkFBcUJSLEVBQUVTLE1BQU0sQ0FBQztJQUNsQ0MsT0FBT1YsRUFBRVcsTUFBTTtBQUNqQjtBQU9BLE1BQU1DLGNBQTBDLE9BQU8sRUFDckRDLGNBQWMsRUFDZEMsTUFBTSxFQUNOQyxZQUFZLEVBQ1pDLGFBQWEsRUFDYkMsb0JBQW9CLEVBQ0g7SUFDakIsTUFBTSxFQUNKQyxNQUFNLEVBQ05DLFdBQVcsRUFDWEMsR0FBRyxFQUNIQSxLQUFLLEVBQ0hDLElBQUksRUFDSkMsSUFBSSxFQUNKQyxTQUFTLEVBQ1BDLFdBQVcsRUFDWEMsUUFBUSxFQUNOQyxPQUFPLEVBQUVKLE1BQU1LLFFBQVEsRUFBRSxFQUMxQixFQUNGLEVBQ0YsRUFDRixHQUFHZDtJQUVKLE1BQU0sRUFBRWUsT0FBTyxFQUFFQyxJQUFJLEVBQUUsR0FBR3JCLG1CQUFtQnNCLFNBQVMsQ0FBQ2Y7SUFFdkQsSUFBSWdCLGtCQUFrQjtJQUN0QixJQUFJLENBQUNILFNBQVM7UUFDWkcsa0JBQWtCO0lBQ3BCLE9BQU87UUFDTCxNQUFNLEVBQUVDLFdBQVdDLGFBQWEsRUFBRSxHQUFHLE1BQU1iLElBQUlHLE9BQU8sQ0FBQ1csS0FBSyxDQUFDO1lBQzNEQyxZQUFZbEI7WUFDWm1CLE9BQU87Z0JBQUUxQixPQUFPO29CQUFFMkIsUUFBUVIsS0FBS25CLEtBQUs7Z0JBQUM7WUFBRTtRQUN6QztRQUNBLElBQUksQ0FBQ3VCLGVBQWU7WUFDbEJGLGtCQUFrQjtRQUNwQjtJQUNGO0lBRUEsTUFBTU8sZUFBZXRCLGNBQWNVLEtBQUssRUFBRVksZ0JBQWdCLEVBQUU7SUFDNUQsTUFBTUMsb0JBQW9CakMsa0JBQWtCVSxjQUFjd0IsaUJBQWlCLElBQUksQ0FBQyxHQUFHcEMscUJBQXFCcUMsUUFBUTtJQUNoSCxNQUFNQyxvQkFBb0JsQixhQUFhLENBQUNHLFNBQVMsRUFBRUYsT0FBT2tCLEtBQUtEO0lBQy9ELE1BQU1FLHVCQUF1QixBQUFDTCxDQUFBQSxxQkFBcUJHLGlCQUFnQixLQUFNO0lBRXpFLHFCQUNFLE1BQUNyQztRQUFnQndDLFdBQVcsR0FBR3RDLFVBQVUsYUFBYSxDQUFDOzswQkFDckQsS0FBQ3VDO2dCQUFJRCxXQUFXLEdBQUd0QyxVQUFVLDJCQUEyQixDQUFDOzBCQUN2RCxjQUFBLEtBQUNOO29CQUNDb0IsTUFBTUE7b0JBQ05ILFFBQVFBO29CQUNSSixRQUFRQTtvQkFDUlMsU0FBU0gsSUFBSUcsT0FBTztvQkFDcEJKLGFBQWFBO29CQUNiSixjQUFjQTtvQkFDZE8sTUFBTUEsUUFBUXlCOzs7WUFHakJoQixnQ0FDQyxLQUFDNUI7Z0JBQ0M2QyxPQUFPO29CQUFFQyxXQUFXO2dCQUFTO2dCQUM3QkMsU0FBUTtnQkFDUkMsYUFBWTtpQkFHZHRCLHNCQUNFLEtBQUMzQjtnQkFDQ2tELGtCQUFrQnZCLEtBQUtuQixLQUFLO2dCQUM1QmlCLFVBQVVBO2dCQUNWVyxjQUFjQTtnQkFDZHZCLGNBQWNBLGdCQUFnQixDQUFDO2dCQUMvQjJCLG1CQUFtQkU7Z0JBQ25CUyxTQUFTckMsY0FBY3dCLGlCQUFpQixFQUFFYTtnQkFDMUNDLFVBQVV0QyxjQUFjd0IsaUJBQWlCLEVBQUVjOzs7O0FBTXZEO0FBRUEsZUFBZTFDLFlBQVcifQ==