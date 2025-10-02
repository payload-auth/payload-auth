import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { z } from "zod";
import { Logo } from "../../../../../shared/components/logo";
import { MinimalTemplate } from "@payloadcms/next/templates";
import { AdminSignupClient } from "./client";
import { FormHeader } from "../../../../../shared/form/ui/header";
import { supportedBAPluginIds } from "../../../constants";
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC92aWV3cy9hZG1pbi1zaWdudXAvaW5kZXgudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCdcbmltcG9ydCB7IExvZ28gfSBmcm9tICdAL3NoYXJlZC9jb21wb25lbnRzL2xvZ28nXG5pbXBvcnQgeyBNaW5pbWFsVGVtcGxhdGUgfSBmcm9tICdAcGF5bG9hZGNtcy9uZXh0L3RlbXBsYXRlcydcbmltcG9ydCB7IEFkbWluU2lnbnVwQ2xpZW50IH0gZnJvbSAnLi9jbGllbnQnXG5pbXBvcnQgeyBGb3JtSGVhZGVyIH0gZnJvbSAnQC9zaGFyZWQvZm9ybS91aS9oZWFkZXInXG5pbXBvcnQgeyBzdXBwb3J0ZWRCQVBsdWdpbklkcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2NvbnN0YW50cydcblxuaW1wb3J0IHR5cGUgeyBBZG1pblZpZXdTZXJ2ZXJQcm9wcyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgdHlwZSB7IEJldHRlckF1dGhQbHVnaW5PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vdHlwZXMnXG5pbXBvcnQgeyBjaGVja1BsdWdpbkV4aXN0cyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2hlbHBlcnMvY2hlY2stcGx1Z2luLWV4aXN0cydcblxuLy8gIEF2b2lkIHRoZSBuZWVkIGZvciBjdXN0b20gc3R5bGVzXG5jb25zdCBiYXNlQ2xhc3MgPSAnbG9naW4nXG5cbmNvbnN0IHNlYXJjaFBhcmFtc1NjaGVtYSA9IHoub2JqZWN0KHtcbiAgdG9rZW46IHouc3RyaW5nKClcbn0pXG5cbmludGVyZmFjZSBBZG1pblNpZ251cFByb3BzIGV4dGVuZHMgQWRtaW5WaWV3U2VydmVyUHJvcHMge1xuICBhZG1pbkludml0YXRpb25zU2x1Zzogc3RyaW5nXG4gIHBsdWdpbk9wdGlvbnM6IEJldHRlckF1dGhQbHVnaW5PcHRpb25zXG59XG5cbmNvbnN0IEFkbWluU2lnbnVwOiBSZWFjdC5GQzxBZG1pblNpZ251cFByb3BzPiA9IGFzeW5jICh7XG4gIGluaXRQYWdlUmVzdWx0LFxuICBwYXJhbXMsXG4gIHNlYXJjaFBhcmFtcyxcbiAgcGx1Z2luT3B0aW9ucyxcbiAgYWRtaW5JbnZpdGF0aW9uc1NsdWdcbn06IEFkbWluU2lnbnVwUHJvcHMpID0+IHtcbiAgY29uc3Qge1xuICAgIGxvY2FsZSxcbiAgICBwZXJtaXNzaW9ucyxcbiAgICByZXEsXG4gICAgcmVxOiB7XG4gICAgICBpMThuLFxuICAgICAgdXNlcixcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgY29sbGVjdGlvbnMsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIGFkbWluOiB7IHVzZXI6IHVzZXJTbHVnIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSA9IGluaXRQYWdlUmVzdWx0XG5cbiAgY29uc3QgeyBzdWNjZXNzLCBkYXRhIH0gPSBzZWFyY2hQYXJhbXNTY2hlbWEuc2FmZVBhcnNlKHNlYXJjaFBhcmFtcylcblxuICBsZXQgaGFzSW52YWxpZFRva2VuID0gZmFsc2VcbiAgaWYgKCFzdWNjZXNzKSB7XG4gICAgaGFzSW52YWxpZFRva2VuID0gdHJ1ZVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IHsgdG90YWxEb2NzOiBpc1ZhbGlkSW52aXRlIH0gPSBhd2FpdCByZXEucGF5bG9hZC5jb3VudCh7XG4gICAgICBjb2xsZWN0aW9uOiBhZG1pbkludml0YXRpb25zU2x1ZyxcbiAgICAgIHdoZXJlOiB7IHRva2VuOiB7IGVxdWFsczogZGF0YS50b2tlbiB9IH1cbiAgICB9KVxuICAgIGlmICghaXNWYWxpZEludml0ZSkge1xuICAgICAgaGFzSW52YWxpZFRva2VuID0gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGxvZ2luTWV0aG9kcyA9IHBsdWdpbk9wdGlvbnMuYWRtaW4/LmxvZ2luTWV0aG9kcyA/PyBbXVxuICBjb25zdCBoYXNVc2VybmFtZVBsdWdpbiA9IGNoZWNrUGx1Z2luRXhpc3RzKHBsdWdpbk9wdGlvbnMuYmV0dGVyQXV0aE9wdGlvbnMgPz8ge30sIHN1cHBvcnRlZEJBUGx1Z2luSWRzLnVzZXJuYW1lKVxuICBjb25zdCBsb2dpbldpdGhVc2VybmFtZSA9IGNvbGxlY3Rpb25zPy5bdXNlclNsdWddPy5jb25maWcuYXV0aC5sb2dpbldpdGhVc2VybmFtZVxuICBjb25zdCBjYW5Mb2dpbldpdGhVc2VybmFtZSA9IChoYXNVc2VybmFtZVBsdWdpbiAmJiBsb2dpbldpdGhVc2VybmFtZSkgPz8gZmFsc2VcblxuICByZXR1cm4gKFxuICAgIDxNaW5pbWFsVGVtcGxhdGUgY2xhc3NOYW1lPXtgJHtiYXNlQ2xhc3N9IGFkbWluLXNpZ251cGB9PlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake2Jhc2VDbGFzc31fX2JyYW5kIGFkbWluLXNpZ251cF9fYnJhbmRgfT5cbiAgICAgICAgPExvZ29cbiAgICAgICAgICBpMThuPXtpMThufVxuICAgICAgICAgIGxvY2FsZT17bG9jYWxlfVxuICAgICAgICAgIHBhcmFtcz17cGFyYW1zfVxuICAgICAgICAgIHBheWxvYWQ9e3JlcS5wYXlsb2FkfVxuICAgICAgICAgIHBlcm1pc3Npb25zPXtwZXJtaXNzaW9uc31cbiAgICAgICAgICBzZWFyY2hQYXJhbXM9e3NlYXJjaFBhcmFtc31cbiAgICAgICAgICB1c2VyPXt1c2VyID8/IHVuZGVmaW5lZH1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICAge2hhc0ludmFsaWRUb2tlbiA/IChcbiAgICAgICAgPEZvcm1IZWFkZXJcbiAgICAgICAgICBzdHlsZT17eyB0ZXh0QWxpZ246ICdjZW50ZXInIH19XG4gICAgICAgICAgaGVhZGluZz1cIkludmFsaWQgb3IgZXhwaXJlZCB0b2tlblwiXG4gICAgICAgICAgZGVzY3JpcHRpb249XCJZb3UgbmVlZCB0byBnZXQgYSBuZXcgaW52aXRlIHRvIHNpZ24gdXAuXCJcbiAgICAgICAgLz5cbiAgICAgICkgOiAoXG4gICAgICAgIGRhdGEgJiYgKFxuICAgICAgICAgIDxBZG1pblNpZ251cENsaWVudFxuICAgICAgICAgICAgYWRtaW5JbnZpdGVUb2tlbj17ZGF0YS50b2tlbn1cbiAgICAgICAgICAgIHVzZXJTbHVnPXt1c2VyU2x1Z31cbiAgICAgICAgICAgIGxvZ2luTWV0aG9kcz17bG9naW5NZXRob2RzfVxuICAgICAgICAgICAgc2VhcmNoUGFyYW1zPXtzZWFyY2hQYXJhbXMgPz8ge319XG4gICAgICAgICAgICBsb2dpbldpdGhVc2VybmFtZT17Y2FuTG9naW5XaXRoVXNlcm5hbWV9XG4gICAgICAgICAgICBiYXNlVVJMPXtwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zPy5iYXNlVVJMfVxuICAgICAgICAgICAgYmFzZVBhdGg9e3BsdWdpbk9wdGlvbnMuYmV0dGVyQXV0aE9wdGlvbnM/LmJhc2VQYXRofVxuICAgICAgICAgIC8+XG4gICAgICAgIClcbiAgICAgICl9XG4gICAgPC9NaW5pbWFsVGVtcGxhdGU+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQWRtaW5TaWdudXBcbiJdLCJuYW1lcyI6WyJSZWFjdCIsInoiLCJMb2dvIiwiTWluaW1hbFRlbXBsYXRlIiwiQWRtaW5TaWdudXBDbGllbnQiLCJGb3JtSGVhZGVyIiwic3VwcG9ydGVkQkFQbHVnaW5JZHMiLCJjaGVja1BsdWdpbkV4aXN0cyIsImJhc2VDbGFzcyIsInNlYXJjaFBhcmFtc1NjaGVtYSIsIm9iamVjdCIsInRva2VuIiwic3RyaW5nIiwiQWRtaW5TaWdudXAiLCJpbml0UGFnZVJlc3VsdCIsInBhcmFtcyIsInNlYXJjaFBhcmFtcyIsInBsdWdpbk9wdGlvbnMiLCJhZG1pbkludml0YXRpb25zU2x1ZyIsImxvY2FsZSIsInBlcm1pc3Npb25zIiwicmVxIiwiaTE4biIsInVzZXIiLCJwYXlsb2FkIiwiY29sbGVjdGlvbnMiLCJjb25maWciLCJhZG1pbiIsInVzZXJTbHVnIiwic3VjY2VzcyIsImRhdGEiLCJzYWZlUGFyc2UiLCJoYXNJbnZhbGlkVG9rZW4iLCJ0b3RhbERvY3MiLCJpc1ZhbGlkSW52aXRlIiwiY291bnQiLCJjb2xsZWN0aW9uIiwid2hlcmUiLCJlcXVhbHMiLCJsb2dpbk1ldGhvZHMiLCJoYXNVc2VybmFtZVBsdWdpbiIsImJldHRlckF1dGhPcHRpb25zIiwidXNlcm5hbWUiLCJsb2dpbldpdGhVc2VybmFtZSIsImF1dGgiLCJjYW5Mb2dpbldpdGhVc2VybmFtZSIsImNsYXNzTmFtZSIsImRpdiIsInVuZGVmaW5lZCIsInN0eWxlIiwidGV4dEFsaWduIiwiaGVhZGluZyIsImRlc2NyaXB0aW9uIiwiYWRtaW5JbnZpdGVUb2tlbiIsImJhc2VVUkwiLCJiYXNlUGF0aCJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU9BLFdBQVcsUUFBTztBQUV6QixTQUFTQyxDQUFDLFFBQVEsTUFBSztBQUN2QixTQUFTQyxJQUFJLFFBQVEsd0NBQTBCO0FBQy9DLFNBQVNDLGVBQWUsUUFBUSw2QkFBNEI7QUFDNUQsU0FBU0MsaUJBQWlCLFFBQVEsV0FBVTtBQUM1QyxTQUFTQyxVQUFVLFFBQVEsdUNBQXlCO0FBQ3BELFNBQVNDLG9CQUFvQixRQUFRLHFCQUFnQztBQUlyRSxTQUFTQyxpQkFBaUIsUUFBUSx1Q0FBa0Q7QUFFcEYsb0NBQW9DO0FBQ3BDLE1BQU1DLFlBQVk7QUFFbEIsTUFBTUMscUJBQXFCUixFQUFFUyxNQUFNLENBQUM7SUFDbENDLE9BQU9WLEVBQUVXLE1BQU07QUFDakI7QUFPQSxNQUFNQyxjQUEwQyxPQUFPLEVBQ3JEQyxjQUFjLEVBQ2RDLE1BQU0sRUFDTkMsWUFBWSxFQUNaQyxhQUFhLEVBQ2JDLG9CQUFvQixFQUNIO0lBQ2pCLE1BQU0sRUFDSkMsTUFBTSxFQUNOQyxXQUFXLEVBQ1hDLEdBQUcsRUFDSEEsS0FBSyxFQUNIQyxJQUFJLEVBQ0pDLElBQUksRUFDSkMsU0FBUyxFQUNQQyxXQUFXLEVBQ1hDLFFBQVEsRUFDTkMsT0FBTyxFQUFFSixNQUFNSyxRQUFRLEVBQUUsRUFDMUIsRUFDRixFQUNGLEVBQ0YsR0FBR2Q7SUFFSixNQUFNLEVBQUVlLE9BQU8sRUFBRUMsSUFBSSxFQUFFLEdBQUdyQixtQkFBbUJzQixTQUFTLENBQUNmO0lBRXZELElBQUlnQixrQkFBa0I7SUFDdEIsSUFBSSxDQUFDSCxTQUFTO1FBQ1pHLGtCQUFrQjtJQUNwQixPQUFPO1FBQ0wsTUFBTSxFQUFFQyxXQUFXQyxhQUFhLEVBQUUsR0FBRyxNQUFNYixJQUFJRyxPQUFPLENBQUNXLEtBQUssQ0FBQztZQUMzREMsWUFBWWxCO1lBQ1ptQixPQUFPO2dCQUFFMUIsT0FBTztvQkFBRTJCLFFBQVFSLEtBQUtuQixLQUFLO2dCQUFDO1lBQUU7UUFDekM7UUFDQSxJQUFJLENBQUN1QixlQUFlO1lBQ2xCRixrQkFBa0I7UUFDcEI7SUFDRjtJQUVBLE1BQU1PLGVBQWV0QixjQUFjVSxLQUFLLEVBQUVZLGdCQUFnQixFQUFFO0lBQzVELE1BQU1DLG9CQUFvQmpDLGtCQUFrQlUsY0FBY3dCLGlCQUFpQixJQUFJLENBQUMsR0FBR25DLHFCQUFxQm9DLFFBQVE7SUFDaEgsTUFBTUMsb0JBQW9CbEIsYUFBYSxDQUFDRyxTQUFTLEVBQUVGLE9BQU9rQixLQUFLRDtJQUMvRCxNQUFNRSx1QkFBdUIsQUFBQ0wsQ0FBQUEscUJBQXFCRyxpQkFBZ0IsS0FBTTtJQUV6RSxxQkFDRSxNQUFDeEM7UUFBZ0IyQyxXQUFXLEdBQUd0QyxVQUFVLGFBQWEsQ0FBQzs7MEJBQ3JELEtBQUN1QztnQkFBSUQsV0FBVyxHQUFHdEMsVUFBVSwyQkFBMkIsQ0FBQzswQkFDdkQsY0FBQSxLQUFDTjtvQkFDQ29CLE1BQU1BO29CQUNOSCxRQUFRQTtvQkFDUkosUUFBUUE7b0JBQ1JTLFNBQVNILElBQUlHLE9BQU87b0JBQ3BCSixhQUFhQTtvQkFDYkosY0FBY0E7b0JBQ2RPLE1BQU1BLFFBQVF5Qjs7O1lBR2pCaEIsZ0NBQ0MsS0FBQzNCO2dCQUNDNEMsT0FBTztvQkFBRUMsV0FBVztnQkFBUztnQkFDN0JDLFNBQVE7Z0JBQ1JDLGFBQVk7aUJBR2R0QixzQkFDRSxLQUFDMUI7Z0JBQ0NpRCxrQkFBa0J2QixLQUFLbkIsS0FBSztnQkFDNUJpQixVQUFVQTtnQkFDVlcsY0FBY0E7Z0JBQ2R2QixjQUFjQSxnQkFBZ0IsQ0FBQztnQkFDL0IyQixtQkFBbUJFO2dCQUNuQlMsU0FBU3JDLGNBQWN3QixpQkFBaUIsRUFBRWE7Z0JBQzFDQyxVQUFVdEMsY0FBY3dCLGlCQUFpQixFQUFFYzs7OztBQU12RDtBQUVBLGVBQWUxQyxZQUFXIn0=