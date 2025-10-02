import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Fragment } from "react";
import { MinimalTemplate } from "@payloadcms/next/templates";
import { Button, Translation } from "@payloadcms/ui";
import Link from "next/link";
import { formatAdminURL } from "payload/shared";
import { FormHeader } from "../../../../../shared/form/ui/header";
import { ForgotPasswordForm } from "./client";
import { adminRoutes } from "../../../constants";
const ForgotPassword = ({ pluginOptions, initPageResult })=>{
    const { req: { payload: { config: { admin: { routes: { account: accountRoute } }, routes: { admin: adminRoute } } }, user, i18n } } = initPageResult;
    if (user) {
        return /*#__PURE__*/ _jsxs(Fragment, {
            children: [
                /*#__PURE__*/ _jsx(FormHeader, {
                    description: /*#__PURE__*/ _jsx(Translation, {
                        elements: {
                            '0': ({ children })=>/*#__PURE__*/ _jsx(Link, {
                                    href: formatAdminURL({
                                        adminRoute,
                                        path: accountRoute
                                    }),
                                    prefetch: false,
                                    children: children
                                })
                        },
                        i18nKey: "authentication:loggedInChangePassword",
                        t: i18n.t
                    }),
                    heading: i18n.t('authentication:alreadyLoggedIn')
                }),
                /*#__PURE__*/ _jsx(Button, {
                    buttonStyle: "secondary",
                    el: "link",
                    size: "large",
                    to: adminRoute,
                    children: i18n.t('general:backToDashboard')
                })
            ]
        });
    }
    return /*#__PURE__*/ _jsxs(MinimalTemplate, {
        children: [
            /*#__PURE__*/ _jsx(ForgotPasswordForm, {
                baseURL: pluginOptions.betterAuthOptions?.baseURL,
                basePath: pluginOptions.betterAuthOptions?.basePath
            }),
            /*#__PURE__*/ _jsx(Link, {
                href: formatAdminURL({
                    adminRoute,
                    path: adminRoutes.adminLogin
                }),
                prefetch: false,
                children: i18n.t('authentication:backToLogin')
            })
        ]
    });
};
export default ForgotPassword;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC92aWV3cy9mb3Jnb3QtcGFzc3dvcmQvaW5kZXgudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBGcmFnbWVudCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgTWluaW1hbFRlbXBsYXRlIH0gZnJvbSAnQHBheWxvYWRjbXMvbmV4dC90ZW1wbGF0ZXMnXG5pbXBvcnQgeyBCdXR0b24sIFRyYW5zbGF0aW9uIH0gZnJvbSAnQHBheWxvYWRjbXMvdWknXG5pbXBvcnQgTGluayBmcm9tICduZXh0L2xpbmsnXG5pbXBvcnQgdHlwZSB7IEFkbWluVmlld1NlcnZlclByb3BzIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB7IGZvcm1hdEFkbWluVVJMIH0gZnJvbSAncGF5bG9hZC9zaGFyZWQnXG5pbXBvcnQgeyBGb3JtSGVhZGVyIH0gZnJvbSAnQC9zaGFyZWQvZm9ybS91aS9oZWFkZXInXG5pbXBvcnQgeyBGb3Jnb3RQYXNzd29yZEZvcm0gfSBmcm9tICcuL2NsaWVudCdcbmltcG9ydCB7IGFkbWluUm91dGVzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vY29uc3RhbnRzJ1xuaW1wb3J0IHR5cGUgeyBCZXR0ZXJBdXRoUGx1Z2luT3B0aW9ucyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xudHlwZSBGb3Jnb3RQYXNzd29yZFByb3BzID0gQWRtaW5WaWV3U2VydmVyUHJvcHMgJiB7XG4gIHBsdWdpbk9wdGlvbnM6IEJldHRlckF1dGhQbHVnaW5PcHRpb25zXG59XG5cbmNvbnN0IEZvcmdvdFBhc3N3b3JkOiBSZWFjdC5GQzxGb3Jnb3RQYXNzd29yZFByb3BzPiA9ICh7IHBsdWdpbk9wdGlvbnMsIGluaXRQYWdlUmVzdWx0IH0pID0+IHtcbiAgY29uc3Qge1xuICAgIHJlcToge1xuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBhZG1pbjoge1xuICAgICAgICAgICAgcm91dGVzOiB7IGFjY291bnQ6IGFjY291bnRSb3V0ZSB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICByb3V0ZXM6IHsgYWRtaW46IGFkbWluUm91dGUgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdXNlcixcbiAgICAgIGkxOG5cbiAgICB9XG4gIH0gPSBpbml0UGFnZVJlc3VsdFxuXG4gIGlmICh1c2VyKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxGcmFnbWVudD5cbiAgICAgICAgPEZvcm1IZWFkZXJcbiAgICAgICAgICBkZXNjcmlwdGlvbj17XG4gICAgICAgICAgICA8VHJhbnNsYXRpb25cbiAgICAgICAgICAgICAgZWxlbWVudHM9e3tcbiAgICAgICAgICAgICAgICAnMCc6ICh7IGNoaWxkcmVuIH0pID0+IChcbiAgICAgICAgICAgICAgICAgIDxMaW5rXG4gICAgICAgICAgICAgICAgICAgIGhyZWY9e2Zvcm1hdEFkbWluVVJMKHtcbiAgICAgICAgICAgICAgICAgICAgICBhZG1pblJvdXRlLFxuICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGFjY291bnRSb3V0ZVxuICAgICAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICAgICAgcHJlZmV0Y2g9e2ZhbHNlfT5cbiAgICAgICAgICAgICAgICAgICAge2NoaWxkcmVufVxuICAgICAgICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgaTE4bktleT1cImF1dGhlbnRpY2F0aW9uOmxvZ2dlZEluQ2hhbmdlUGFzc3dvcmRcIlxuICAgICAgICAgICAgICB0PXtpMThuLnQgYXMgYW55fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICB9XG4gICAgICAgICAgaGVhZGluZz17aTE4bi50KCdhdXRoZW50aWNhdGlvbjphbHJlYWR5TG9nZ2VkSW4nKX1cbiAgICAgICAgLz5cbiAgICAgICAgPEJ1dHRvbiBidXR0b25TdHlsZT1cInNlY29uZGFyeVwiIGVsPVwibGlua1wiIHNpemU9XCJsYXJnZVwiIHRvPXthZG1pblJvdXRlfT5cbiAgICAgICAgICB7aTE4bi50KCdnZW5lcmFsOmJhY2tUb0Rhc2hib2FyZCcpfVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvRnJhZ21lbnQ+XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8TWluaW1hbFRlbXBsYXRlPlxuICAgICAgPEZvcmdvdFBhc3N3b3JkRm9ybSBiYXNlVVJMPXtwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zPy5iYXNlVVJMfSBiYXNlUGF0aD17cGx1Z2luT3B0aW9ucy5iZXR0ZXJBdXRoT3B0aW9ucz8uYmFzZVBhdGh9IC8+XG4gICAgICA8TGlua1xuICAgICAgICBocmVmPXtmb3JtYXRBZG1pblVSTCh7XG4gICAgICAgICAgYWRtaW5Sb3V0ZSxcbiAgICAgICAgICBwYXRoOiBhZG1pblJvdXRlcy5hZG1pbkxvZ2luIGFzIGAvJHtzdHJpbmd9YFxuICAgICAgICB9KX1cbiAgICAgICAgcHJlZmV0Y2g9e2ZhbHNlfT5cbiAgICAgICAge2kxOG4udCgnYXV0aGVudGljYXRpb246YmFja1RvTG9naW4nKX1cbiAgICAgIDwvTGluaz5cbiAgICA8L01pbmltYWxUZW1wbGF0ZT5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBGb3Jnb3RQYXNzd29yZFxuIl0sIm5hbWVzIjpbIlJlYWN0IiwiRnJhZ21lbnQiLCJNaW5pbWFsVGVtcGxhdGUiLCJCdXR0b24iLCJUcmFuc2xhdGlvbiIsIkxpbmsiLCJmb3JtYXRBZG1pblVSTCIsIkZvcm1IZWFkZXIiLCJGb3Jnb3RQYXNzd29yZEZvcm0iLCJhZG1pblJvdXRlcyIsIkZvcmdvdFBhc3N3b3JkIiwicGx1Z2luT3B0aW9ucyIsImluaXRQYWdlUmVzdWx0IiwicmVxIiwicGF5bG9hZCIsImNvbmZpZyIsImFkbWluIiwicm91dGVzIiwiYWNjb3VudCIsImFjY291bnRSb3V0ZSIsImFkbWluUm91dGUiLCJ1c2VyIiwiaTE4biIsImRlc2NyaXB0aW9uIiwiZWxlbWVudHMiLCJjaGlsZHJlbiIsImhyZWYiLCJwYXRoIiwicHJlZmV0Y2giLCJpMThuS2V5IiwidCIsImhlYWRpbmciLCJidXR0b25TdHlsZSIsImVsIiwic2l6ZSIsInRvIiwiYmFzZVVSTCIsImJldHRlckF1dGhPcHRpb25zIiwiYmFzZVBhdGgiLCJhZG1pbkxvZ2luIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBT0EsU0FBU0MsUUFBUSxRQUFRLFFBQU87QUFDdkMsU0FBU0MsZUFBZSxRQUFRLDZCQUE0QjtBQUM1RCxTQUFTQyxNQUFNLEVBQUVDLFdBQVcsUUFBUSxpQkFBZ0I7QUFDcEQsT0FBT0MsVUFBVSxZQUFXO0FBRTVCLFNBQVNDLGNBQWMsUUFBUSxpQkFBZ0I7QUFDL0MsU0FBU0MsVUFBVSxRQUFRLHVDQUF5QjtBQUNwRCxTQUFTQyxrQkFBa0IsUUFBUSxXQUFVO0FBQzdDLFNBQVNDLFdBQVcsUUFBUSxxQkFBZ0M7QUFNNUQsTUFBTUMsaUJBQWdELENBQUMsRUFBRUMsYUFBYSxFQUFFQyxjQUFjLEVBQUU7SUFDdEYsTUFBTSxFQUNKQyxLQUFLLEVBQ0hDLFNBQVMsRUFDUEMsUUFBUSxFQUNOQyxPQUFPLEVBQ0xDLFFBQVEsRUFBRUMsU0FBU0MsWUFBWSxFQUFFLEVBQ2xDLEVBQ0RGLFFBQVEsRUFBRUQsT0FBT0ksVUFBVSxFQUFFLEVBQzlCLEVBQ0YsRUFDREMsSUFBSSxFQUNKQyxJQUFJLEVBQ0wsRUFDRixHQUFHVjtJQUVKLElBQUlTLE1BQU07UUFDUixxQkFDRSxNQUFDcEI7OzhCQUNDLEtBQUNNO29CQUNDZ0IsMkJBQ0UsS0FBQ25CO3dCQUNDb0IsVUFBVTs0QkFDUixLQUFLLENBQUMsRUFBRUMsUUFBUSxFQUFFLGlCQUNoQixLQUFDcEI7b0NBQ0NxQixNQUFNcEIsZUFBZTt3Q0FDbkJjO3dDQUNBTyxNQUFNUjtvQ0FDUjtvQ0FDQVMsVUFBVTs4Q0FDVEg7O3dCQUdQO3dCQUNBSSxTQUFRO3dCQUNSQyxHQUFHUixLQUFLUSxDQUFDOztvQkFHYkMsU0FBU1QsS0FBS1EsQ0FBQyxDQUFDOzs4QkFFbEIsS0FBQzNCO29CQUFPNkIsYUFBWTtvQkFBWUMsSUFBRztvQkFBT0MsTUFBSztvQkFBUUMsSUFBSWY7OEJBQ3hERSxLQUFLUSxDQUFDLENBQUM7Ozs7SUFJaEI7SUFFQSxxQkFDRSxNQUFDNUI7OzBCQUNDLEtBQUNNO2dCQUFtQjRCLFNBQVN6QixjQUFjMEIsaUJBQWlCLEVBQUVEO2dCQUFTRSxVQUFVM0IsY0FBYzBCLGlCQUFpQixFQUFFQzs7MEJBQ2xILEtBQUNqQztnQkFDQ3FCLE1BQU1wQixlQUFlO29CQUNuQmM7b0JBQ0FPLE1BQU1sQixZQUFZOEIsVUFBVTtnQkFDOUI7Z0JBQ0FYLFVBQVU7MEJBQ1ROLEtBQUtRLENBQUMsQ0FBQzs7OztBQUloQjtBQUVBLGVBQWVwQixlQUFjIn0=