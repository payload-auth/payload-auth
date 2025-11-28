import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Button, Link, Translation } from "@payloadcms/ui";
import { formatAdminURL } from "payload/shared";
import { MinimalTemplate } from "@payloadcms/next/templates";
import { z } from "zod";
import { FormHeader } from "../../../../../shared/form/ui/header";
import { PasswordResetForm } from "./client";
import { adminRoutes } from "../../../constants";
const resetPasswordParamsSchema = z.object({
    token: z.string()
});
const resetPasswordBaseClass = 'reset-password';
const ResetPassword = ({ pluginOptions, initPageResult, searchParams })=>{
    const { req: { user, t, payload: { config: { routes: { admin: adminRoute }, admin: { routes: { account: accountRoute } } } } } } = initPageResult;
    if (user) {
        return /*#__PURE__*/ _jsxs(MinimalTemplate, {
            className: `${resetPasswordBaseClass}`,
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
                        t: t
                    }),
                    heading: t('authentication:alreadyLoggedIn')
                }),
                /*#__PURE__*/ _jsx(Button, {
                    buttonStyle: "secondary",
                    el: "link",
                    size: "large",
                    to: adminRoute,
                    children: t('general:backToDashboard')
                })
            ]
        });
    }
    const resetPasswordParams = resetPasswordParamsSchema.safeParse(searchParams);
    if (!resetPasswordParams.success) {
        return /*#__PURE__*/ _jsx("div", {
            children: "Invalid reset password params"
        });
    }
    const { token } = resetPasswordParams.data;
    return /*#__PURE__*/ _jsxs("div", {
        className: `${resetPasswordBaseClass}`,
        children: [
            /*#__PURE__*/ _jsx(FormHeader, {
                heading: t('authentication:resetPassword')
            }),
            /*#__PURE__*/ _jsx(PasswordResetForm, {
                token: token,
                baseURL: pluginOptions.betterAuthOptions?.baseURL,
                basePath: pluginOptions.betterAuthOptions?.basePath
            }),
            /*#__PURE__*/ _jsx(Link, {
                href: formatAdminURL({
                    adminRoute,
                    path: adminRoutes.adminLogin
                }),
                prefetch: false,
                children: t('authentication:backToLogin')
            })
        ]
    });
};
export default ResetPassword;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC92aWV3cy9yZXNldC1wYXNzd29yZC9pbmRleC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQnV0dG9uLCBMaW5rLCBUcmFuc2xhdGlvbiB9IGZyb20gJ0BwYXlsb2FkY21zL3VpJ1xuaW1wb3J0IHR5cGUgeyBBZG1pblZpZXdTZXJ2ZXJQcm9wcyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBmb3JtYXRBZG1pblVSTCB9IGZyb20gJ3BheWxvYWQvc2hhcmVkJ1xuaW1wb3J0IHsgTWluaW1hbFRlbXBsYXRlIH0gZnJvbSAnQHBheWxvYWRjbXMvbmV4dC90ZW1wbGF0ZXMnXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJ1xuaW1wb3J0IHsgRm9ybUhlYWRlciB9IGZyb20gJ0Avc2hhcmVkL2Zvcm0vdWkvaGVhZGVyJ1xuaW1wb3J0IHsgUGFzc3dvcmRSZXNldEZvcm0gfSBmcm9tICcuL2NsaWVudCdcbmltcG9ydCB7IGFkbWluUm91dGVzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vY29uc3RhbnRzJ1xuaW1wb3J0IHR5cGUgeyBCZXR0ZXJBdXRoUGx1Z2luT3B0aW9ucyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuXG5jb25zdCByZXNldFBhc3N3b3JkUGFyYW1zU2NoZW1hID0gei5vYmplY3Qoe1xuICB0b2tlbjogei5zdHJpbmcoKVxufSlcblxuY29uc3QgcmVzZXRQYXNzd29yZEJhc2VDbGFzcyA9ICdyZXNldC1wYXNzd29yZCdcblxudHlwZSBSZXNldFBhc3N3b3JkUHJvcHMgPSBBZG1pblZpZXdTZXJ2ZXJQcm9wcyAmIHtcbiAgcGx1Z2luT3B0aW9uczogQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnNcbn1cblxuY29uc3QgUmVzZXRQYXNzd29yZDogUmVhY3QuRkM8UmVzZXRQYXNzd29yZFByb3BzPiA9ICh7IHBsdWdpbk9wdGlvbnMsIGluaXRQYWdlUmVzdWx0LCBzZWFyY2hQYXJhbXMgfSkgPT4ge1xuICBjb25zdCB7XG4gICAgcmVxOiB7XG4gICAgICB1c2VyLFxuICAgICAgdCxcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgcm91dGVzOiB7IGFkbWluOiBhZG1pblJvdXRlIH0sXG4gICAgICAgICAgYWRtaW46IHtcbiAgICAgICAgICAgIHJvdXRlczogeyBhY2NvdW50OiBhY2NvdW50Um91dGUgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSA9IGluaXRQYWdlUmVzdWx0XG5cbiAgaWYgKHVzZXIpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPE1pbmltYWxUZW1wbGF0ZSBjbGFzc05hbWU9e2Ake3Jlc2V0UGFzc3dvcmRCYXNlQ2xhc3N9YH0+XG4gICAgICAgIDxGb3JtSGVhZGVyXG4gICAgICAgICAgZGVzY3JpcHRpb249e1xuICAgICAgICAgICAgPFRyYW5zbGF0aW9uXG4gICAgICAgICAgICAgIGVsZW1lbnRzPXt7XG4gICAgICAgICAgICAgICAgJzAnOiAoeyBjaGlsZHJlbiB9KSA9PiAoXG4gICAgICAgICAgICAgICAgICA8TGlua1xuICAgICAgICAgICAgICAgICAgICBocmVmPXtmb3JtYXRBZG1pblVSTCh7XG4gICAgICAgICAgICAgICAgICAgICAgYWRtaW5Sb3V0ZSxcbiAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBhY2NvdW50Um91dGVcbiAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgIHByZWZldGNoPXtmYWxzZX0+XG4gICAgICAgICAgICAgICAgICAgIHtjaGlsZHJlbn1cbiAgICAgICAgICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIGkxOG5LZXk9XCJhdXRoZW50aWNhdGlvbjpsb2dnZWRJbkNoYW5nZVBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgdD17dH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgfVxuICAgICAgICAgIGhlYWRpbmc9e3QoJ2F1dGhlbnRpY2F0aW9uOmFscmVhZHlMb2dnZWRJbicpfVxuICAgICAgICAvPlxuICAgICAgICA8QnV0dG9uIGJ1dHRvblN0eWxlPVwic2Vjb25kYXJ5XCIgZWw9XCJsaW5rXCIgc2l6ZT1cImxhcmdlXCIgdG89e2FkbWluUm91dGV9PlxuICAgICAgICAgIHt0KCdnZW5lcmFsOmJhY2tUb0Rhc2hib2FyZCcpfVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvTWluaW1hbFRlbXBsYXRlPlxuICAgIClcbiAgfVxuXG4gIGNvbnN0IHJlc2V0UGFzc3dvcmRQYXJhbXMgPSByZXNldFBhc3N3b3JkUGFyYW1zU2NoZW1hLnNhZmVQYXJzZShzZWFyY2hQYXJhbXMpXG4gIGlmICghcmVzZXRQYXNzd29yZFBhcmFtcy5zdWNjZXNzKSB7XG4gICAgcmV0dXJuIDxkaXY+SW52YWxpZCByZXNldCBwYXNzd29yZCBwYXJhbXM8L2Rpdj5cbiAgfVxuICBjb25zdCB7IHRva2VuIH0gPSByZXNldFBhc3N3b3JkUGFyYW1zLmRhdGFcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtyZXNldFBhc3N3b3JkQmFzZUNsYXNzfWB9PlxuICAgICAgPEZvcm1IZWFkZXIgaGVhZGluZz17dCgnYXV0aGVudGljYXRpb246cmVzZXRQYXNzd29yZCcpfSAvPlxuICAgICAgPFBhc3N3b3JkUmVzZXRGb3JtXG4gICAgICAgIHRva2VuPXt0b2tlbn1cbiAgICAgICAgYmFzZVVSTD17cGx1Z2luT3B0aW9ucy5iZXR0ZXJBdXRoT3B0aW9ucz8uYmFzZVVSTH1cbiAgICAgICAgYmFzZVBhdGg9e3BsdWdpbk9wdGlvbnMuYmV0dGVyQXV0aE9wdGlvbnM/LmJhc2VQYXRofVxuICAgICAgLz5cbiAgICAgIDxMaW5rXG4gICAgICAgIGhyZWY9e2Zvcm1hdEFkbWluVVJMKHtcbiAgICAgICAgICBhZG1pblJvdXRlLFxuICAgICAgICAgIHBhdGg6IGFkbWluUm91dGVzLmFkbWluTG9naW4gYXMgYC8ke3N0cmluZ31gXG4gICAgICAgIH0pfVxuICAgICAgICBwcmVmZXRjaD17ZmFsc2V9PlxuICAgICAgICB7dCgnYXV0aGVudGljYXRpb246YmFja1RvTG9naW4nKX1cbiAgICAgIDwvTGluaz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBSZXNldFBhc3N3b3JkXG4iXSwibmFtZXMiOlsiUmVhY3QiLCJCdXR0b24iLCJMaW5rIiwiVHJhbnNsYXRpb24iLCJmb3JtYXRBZG1pblVSTCIsIk1pbmltYWxUZW1wbGF0ZSIsInoiLCJGb3JtSGVhZGVyIiwiUGFzc3dvcmRSZXNldEZvcm0iLCJhZG1pblJvdXRlcyIsInJlc2V0UGFzc3dvcmRQYXJhbXNTY2hlbWEiLCJvYmplY3QiLCJ0b2tlbiIsInN0cmluZyIsInJlc2V0UGFzc3dvcmRCYXNlQ2xhc3MiLCJSZXNldFBhc3N3b3JkIiwicGx1Z2luT3B0aW9ucyIsImluaXRQYWdlUmVzdWx0Iiwic2VhcmNoUGFyYW1zIiwicmVxIiwidXNlciIsInQiLCJwYXlsb2FkIiwiY29uZmlnIiwicm91dGVzIiwiYWRtaW4iLCJhZG1pblJvdXRlIiwiYWNjb3VudCIsImFjY291bnRSb3V0ZSIsImNsYXNzTmFtZSIsImRlc2NyaXB0aW9uIiwiZWxlbWVudHMiLCJjaGlsZHJlbiIsImhyZWYiLCJwYXRoIiwicHJlZmV0Y2giLCJpMThuS2V5IiwiaGVhZGluZyIsImJ1dHRvblN0eWxlIiwiZWwiLCJzaXplIiwidG8iLCJyZXNldFBhc3N3b3JkUGFyYW1zIiwic2FmZVBhcnNlIiwic3VjY2VzcyIsImRpdiIsImRhdGEiLCJiYXNlVVJMIiwiYmV0dGVyQXV0aE9wdGlvbnMiLCJiYXNlUGF0aCIsImFkbWluTG9naW4iXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPQSxXQUFXLFFBQU87QUFDekIsU0FBU0MsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLFdBQVcsUUFBUSxpQkFBZ0I7QUFFMUQsU0FBU0MsY0FBYyxRQUFRLGlCQUFnQjtBQUMvQyxTQUFTQyxlQUFlLFFBQVEsNkJBQTRCO0FBQzVELFNBQVNDLENBQUMsUUFBUSxNQUFLO0FBQ3ZCLFNBQVNDLFVBQVUsUUFBUSx1Q0FBeUI7QUFDcEQsU0FBU0MsaUJBQWlCLFFBQVEsV0FBVTtBQUM1QyxTQUFTQyxXQUFXLFFBQVEscUJBQWdDO0FBRzVELE1BQU1DLDRCQUE0QkosRUFBRUssTUFBTSxDQUFDO0lBQ3pDQyxPQUFPTixFQUFFTyxNQUFNO0FBQ2pCO0FBRUEsTUFBTUMseUJBQXlCO0FBTS9CLE1BQU1DLGdCQUE4QyxDQUFDLEVBQUVDLGFBQWEsRUFBRUMsY0FBYyxFQUFFQyxZQUFZLEVBQUU7SUFDbEcsTUFBTSxFQUNKQyxLQUFLLEVBQ0hDLElBQUksRUFDSkMsQ0FBQyxFQUNEQyxTQUFTLEVBQ1BDLFFBQVEsRUFDTkMsUUFBUSxFQUFFQyxPQUFPQyxVQUFVLEVBQUUsRUFDN0JELE9BQU8sRUFDTEQsUUFBUSxFQUFFRyxTQUFTQyxZQUFZLEVBQUUsRUFDbEMsRUFDRixFQUNGLEVBQ0YsRUFDRixHQUFHWDtJQUVKLElBQUlHLE1BQU07UUFDUixxQkFDRSxNQUFDZjtZQUFnQndCLFdBQVcsR0FBR2Ysd0JBQXdCOzs4QkFDckQsS0FBQ1A7b0JBQ0N1QiwyQkFDRSxLQUFDM0I7d0JBQ0M0QixVQUFVOzRCQUNSLEtBQUssQ0FBQyxFQUFFQyxRQUFRLEVBQUUsaUJBQ2hCLEtBQUM5QjtvQ0FDQytCLE1BQU03QixlQUFlO3dDQUNuQnNCO3dDQUNBUSxNQUFNTjtvQ0FDUjtvQ0FDQU8sVUFBVTs4Q0FDVEg7O3dCQUdQO3dCQUNBSSxTQUFRO3dCQUNSZixHQUFHQTs7b0JBR1BnQixTQUFTaEIsRUFBRTs7OEJBRWIsS0FBQ3BCO29CQUFPcUMsYUFBWTtvQkFBWUMsSUFBRztvQkFBT0MsTUFBSztvQkFBUUMsSUFBSWY7OEJBQ3hETCxFQUFFOzs7O0lBSVg7SUFFQSxNQUFNcUIsc0JBQXNCaEMsMEJBQTBCaUMsU0FBUyxDQUFDekI7SUFDaEUsSUFBSSxDQUFDd0Isb0JBQW9CRSxPQUFPLEVBQUU7UUFDaEMscUJBQU8sS0FBQ0M7c0JBQUk7O0lBQ2Q7SUFDQSxNQUFNLEVBQUVqQyxLQUFLLEVBQUUsR0FBRzhCLG9CQUFvQkksSUFBSTtJQUUxQyxxQkFDRSxNQUFDRDtRQUFJaEIsV0FBVyxHQUFHZix3QkFBd0I7OzBCQUN6QyxLQUFDUDtnQkFBVzhCLFNBQVNoQixFQUFFOzswQkFDdkIsS0FBQ2I7Z0JBQ0NJLE9BQU9BO2dCQUNQbUMsU0FBUy9CLGNBQWNnQyxpQkFBaUIsRUFBRUQ7Z0JBQzFDRSxVQUFVakMsY0FBY2dDLGlCQUFpQixFQUFFQzs7MEJBRTdDLEtBQUMvQztnQkFDQytCLE1BQU03QixlQUFlO29CQUNuQnNCO29CQUNBUSxNQUFNekIsWUFBWXlDLFVBQVU7Z0JBQzlCO2dCQUNBZixVQUFVOzBCQUNUZCxFQUFFOzs7O0FBSVg7QUFFQSxlQUFlTixjQUFhIn0=