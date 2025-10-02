import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { MinimalTemplate } from "@payloadcms/next/templates";
import { Button, Link, Translation } from "@payloadcms/ui";
import { formatAdminURL } from "payload/shared";
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
    return /*#__PURE__*/ _jsxs(MinimalTemplate, {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC92aWV3cy9yZXNldC1wYXNzd29yZC9pbmRleC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgTWluaW1hbFRlbXBsYXRlIH0gZnJvbSAnQHBheWxvYWRjbXMvbmV4dC90ZW1wbGF0ZXMnXG5pbXBvcnQgeyBCdXR0b24sIExpbmssIFRyYW5zbGF0aW9uIH0gZnJvbSAnQHBheWxvYWRjbXMvdWknXG5pbXBvcnQgdHlwZSB7IEFkbWluVmlld1NlcnZlclByb3BzIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB7IGZvcm1hdEFkbWluVVJMIH0gZnJvbSAncGF5bG9hZC9zaGFyZWQnXG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnXG5cbmltcG9ydCB7IEZvcm1IZWFkZXIgfSBmcm9tICdAL3NoYXJlZC9mb3JtL3VpL2hlYWRlcidcbmltcG9ydCB7IFBhc3N3b3JkUmVzZXRGb3JtIH0gZnJvbSAnLi9jbGllbnQnXG5pbXBvcnQgeyBhZG1pblJvdXRlcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2NvbnN0YW50cydcbmltcG9ydCB0eXBlIHsgQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi90eXBlcydcblxuY29uc3QgcmVzZXRQYXNzd29yZFBhcmFtc1NjaGVtYSA9IHoub2JqZWN0KHtcbiAgdG9rZW46IHouc3RyaW5nKClcbn0pXG5cbmNvbnN0IHJlc2V0UGFzc3dvcmRCYXNlQ2xhc3MgPSAncmVzZXQtcGFzc3dvcmQnXG5cbnR5cGUgUmVzZXRQYXNzd29yZFByb3BzID0gQWRtaW5WaWV3U2VydmVyUHJvcHMgJiB7XG4gIHBsdWdpbk9wdGlvbnM6IEJldHRlckF1dGhQbHVnaW5PcHRpb25zXG59XG5cbmNvbnN0IFJlc2V0UGFzc3dvcmQ6IFJlYWN0LkZDPFJlc2V0UGFzc3dvcmRQcm9wcz4gPSAoeyBwbHVnaW5PcHRpb25zLCBpbml0UGFnZVJlc3VsdCwgc2VhcmNoUGFyYW1zIH0pID0+IHtcbiAgY29uc3Qge1xuICAgIHJlcToge1xuICAgICAgdXNlcixcbiAgICAgIHQsXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIHJvdXRlczogeyBhZG1pbjogYWRtaW5Sb3V0ZSB9LFxuICAgICAgICAgIGFkbWluOiB7XG4gICAgICAgICAgICByb3V0ZXM6IHsgYWNjb3VudDogYWNjb3VudFJvdXRlIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gPSBpbml0UGFnZVJlc3VsdFxuXG4gIGlmICh1c2VyKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxNaW5pbWFsVGVtcGxhdGUgY2xhc3NOYW1lPXtgJHtyZXNldFBhc3N3b3JkQmFzZUNsYXNzfWB9PlxuICAgICAgICA8Rm9ybUhlYWRlclxuICAgICAgICAgIGRlc2NyaXB0aW9uPXtcbiAgICAgICAgICAgIDxUcmFuc2xhdGlvblxuICAgICAgICAgICAgICBlbGVtZW50cz17e1xuICAgICAgICAgICAgICAgICcwJzogKHsgY2hpbGRyZW4gfSkgPT4gKFxuICAgICAgICAgICAgICAgICAgPExpbmtcbiAgICAgICAgICAgICAgICAgICAgaHJlZj17Zm9ybWF0QWRtaW5VUkwoe1xuICAgICAgICAgICAgICAgICAgICAgIGFkbWluUm91dGUsXG4gICAgICAgICAgICAgICAgICAgICAgcGF0aDogYWNjb3VudFJvdXRlXG4gICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICBwcmVmZXRjaD17ZmFsc2V9PlxuICAgICAgICAgICAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgICAgICAgICAgICA8L0xpbms+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBpMThuS2V5PVwiYXV0aGVudGljYXRpb246bG9nZ2VkSW5DaGFuZ2VQYXNzd29yZFwiXG4gICAgICAgICAgICAgIHQ9e3QgYXMgYW55fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICB9XG4gICAgICAgICAgaGVhZGluZz17dCgnYXV0aGVudGljYXRpb246YWxyZWFkeUxvZ2dlZEluJyl9XG4gICAgICAgIC8+XG4gICAgICAgIDxCdXR0b24gYnV0dG9uU3R5bGU9XCJzZWNvbmRhcnlcIiBlbD1cImxpbmtcIiBzaXplPVwibGFyZ2VcIiB0bz17YWRtaW5Sb3V0ZX0+XG4gICAgICAgICAge3QoJ2dlbmVyYWw6YmFja1RvRGFzaGJvYXJkJyl9XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9NaW5pbWFsVGVtcGxhdGU+XG4gICAgKVxuICB9XG5cbiAgY29uc3QgcmVzZXRQYXNzd29yZFBhcmFtcyA9IHJlc2V0UGFzc3dvcmRQYXJhbXNTY2hlbWEuc2FmZVBhcnNlKHNlYXJjaFBhcmFtcylcbiAgaWYgKCFyZXNldFBhc3N3b3JkUGFyYW1zLnN1Y2Nlc3MpIHtcbiAgICByZXR1cm4gPGRpdj5JbnZhbGlkIHJlc2V0IHBhc3N3b3JkIHBhcmFtczwvZGl2PlxuICB9XG4gIGNvbnN0IHsgdG9rZW4gfSA9IHJlc2V0UGFzc3dvcmRQYXJhbXMuZGF0YVxuXG4gIHJldHVybiAoXG4gICAgPE1pbmltYWxUZW1wbGF0ZSBjbGFzc05hbWU9e2Ake3Jlc2V0UGFzc3dvcmRCYXNlQ2xhc3N9YH0+XG4gICAgICA8Rm9ybUhlYWRlciBoZWFkaW5nPXt0KCdhdXRoZW50aWNhdGlvbjpyZXNldFBhc3N3b3JkJyl9IC8+XG4gICAgICA8UGFzc3dvcmRSZXNldEZvcm1cbiAgICAgICAgdG9rZW49e3Rva2VufVxuICAgICAgICBiYXNlVVJMPXtwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zPy5iYXNlVVJMfVxuICAgICAgICBiYXNlUGF0aD17cGx1Z2luT3B0aW9ucy5iZXR0ZXJBdXRoT3B0aW9ucz8uYmFzZVBhdGh9XG4gICAgICAvPlxuICAgICAgPExpbmtcbiAgICAgICAgaHJlZj17Zm9ybWF0QWRtaW5VUkwoe1xuICAgICAgICAgIGFkbWluUm91dGUsXG4gICAgICAgICAgcGF0aDogYWRtaW5Sb3V0ZXMuYWRtaW5Mb2dpbiBhcyBgLyR7c3RyaW5nfWBcbiAgICAgICAgfSl9XG4gICAgICAgIHByZWZldGNoPXtmYWxzZX0+XG4gICAgICAgIHt0KCdhdXRoZW50aWNhdGlvbjpiYWNrVG9Mb2dpbicpfVxuICAgICAgPC9MaW5rPlxuICAgIDwvTWluaW1hbFRlbXBsYXRlPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlc2V0UGFzc3dvcmRcbiJdLCJuYW1lcyI6WyJSZWFjdCIsIk1pbmltYWxUZW1wbGF0ZSIsIkJ1dHRvbiIsIkxpbmsiLCJUcmFuc2xhdGlvbiIsImZvcm1hdEFkbWluVVJMIiwieiIsIkZvcm1IZWFkZXIiLCJQYXNzd29yZFJlc2V0Rm9ybSIsImFkbWluUm91dGVzIiwicmVzZXRQYXNzd29yZFBhcmFtc1NjaGVtYSIsIm9iamVjdCIsInRva2VuIiwic3RyaW5nIiwicmVzZXRQYXNzd29yZEJhc2VDbGFzcyIsIlJlc2V0UGFzc3dvcmQiLCJwbHVnaW5PcHRpb25zIiwiaW5pdFBhZ2VSZXN1bHQiLCJzZWFyY2hQYXJhbXMiLCJyZXEiLCJ1c2VyIiwidCIsInBheWxvYWQiLCJjb25maWciLCJyb3V0ZXMiLCJhZG1pbiIsImFkbWluUm91dGUiLCJhY2NvdW50IiwiYWNjb3VudFJvdXRlIiwiY2xhc3NOYW1lIiwiZGVzY3JpcHRpb24iLCJlbGVtZW50cyIsImNoaWxkcmVuIiwiaHJlZiIsInBhdGgiLCJwcmVmZXRjaCIsImkxOG5LZXkiLCJoZWFkaW5nIiwiYnV0dG9uU3R5bGUiLCJlbCIsInNpemUiLCJ0byIsInJlc2V0UGFzc3dvcmRQYXJhbXMiLCJzYWZlUGFyc2UiLCJzdWNjZXNzIiwiZGl2IiwiZGF0YSIsImJhc2VVUkwiLCJiZXR0ZXJBdXRoT3B0aW9ucyIsImJhc2VQYXRoIiwiYWRtaW5Mb2dpbiJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU9BLFdBQVcsUUFBTztBQUN6QixTQUFTQyxlQUFlLFFBQVEsNkJBQTRCO0FBQzVELFNBQVNDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxXQUFXLFFBQVEsaUJBQWdCO0FBRTFELFNBQVNDLGNBQWMsUUFBUSxpQkFBZ0I7QUFFL0MsU0FBU0MsQ0FBQyxRQUFRLE1BQUs7QUFFdkIsU0FBU0MsVUFBVSxRQUFRLHVDQUF5QjtBQUNwRCxTQUFTQyxpQkFBaUIsUUFBUSxXQUFVO0FBQzVDLFNBQVNDLFdBQVcsUUFBUSxxQkFBZ0M7QUFHNUQsTUFBTUMsNEJBQTRCSixFQUFFSyxNQUFNLENBQUM7SUFDekNDLE9BQU9OLEVBQUVPLE1BQU07QUFDakI7QUFFQSxNQUFNQyx5QkFBeUI7QUFNL0IsTUFBTUMsZ0JBQThDLENBQUMsRUFBRUMsYUFBYSxFQUFFQyxjQUFjLEVBQUVDLFlBQVksRUFBRTtJQUNsRyxNQUFNLEVBQ0pDLEtBQUssRUFDSEMsSUFBSSxFQUNKQyxDQUFDLEVBQ0RDLFNBQVMsRUFDUEMsUUFBUSxFQUNOQyxRQUFRLEVBQUVDLE9BQU9DLFVBQVUsRUFBRSxFQUM3QkQsT0FBTyxFQUNMRCxRQUFRLEVBQUVHLFNBQVNDLFlBQVksRUFBRSxFQUNsQyxFQUNGLEVBQ0YsRUFDRixFQUNGLEdBQUdYO0lBRUosSUFBSUcsTUFBTTtRQUNSLHFCQUNFLE1BQUNuQjtZQUFnQjRCLFdBQVcsR0FBR2Ysd0JBQXdCOzs4QkFDckQsS0FBQ1A7b0JBQ0N1QiwyQkFDRSxLQUFDMUI7d0JBQ0MyQixVQUFVOzRCQUNSLEtBQUssQ0FBQyxFQUFFQyxRQUFRLEVBQUUsaUJBQ2hCLEtBQUM3QjtvQ0FDQzhCLE1BQU01QixlQUFlO3dDQUNuQnFCO3dDQUNBUSxNQUFNTjtvQ0FDUjtvQ0FDQU8sVUFBVTs4Q0FDVEg7O3dCQUdQO3dCQUNBSSxTQUFRO3dCQUNSZixHQUFHQTs7b0JBR1BnQixTQUFTaEIsRUFBRTs7OEJBRWIsS0FBQ25CO29CQUFPb0MsYUFBWTtvQkFBWUMsSUFBRztvQkFBT0MsTUFBSztvQkFBUUMsSUFBSWY7OEJBQ3hETCxFQUFFOzs7O0lBSVg7SUFFQSxNQUFNcUIsc0JBQXNCaEMsMEJBQTBCaUMsU0FBUyxDQUFDekI7SUFDaEUsSUFBSSxDQUFDd0Isb0JBQW9CRSxPQUFPLEVBQUU7UUFDaEMscUJBQU8sS0FBQ0M7c0JBQUk7O0lBQ2Q7SUFDQSxNQUFNLEVBQUVqQyxLQUFLLEVBQUUsR0FBRzhCLG9CQUFvQkksSUFBSTtJQUUxQyxxQkFDRSxNQUFDN0M7UUFBZ0I0QixXQUFXLEdBQUdmLHdCQUF3Qjs7MEJBQ3JELEtBQUNQO2dCQUFXOEIsU0FBU2hCLEVBQUU7OzBCQUN2QixLQUFDYjtnQkFDQ0ksT0FBT0E7Z0JBQ1BtQyxTQUFTL0IsY0FBY2dDLGlCQUFpQixFQUFFRDtnQkFDMUNFLFVBQVVqQyxjQUFjZ0MsaUJBQWlCLEVBQUVDOzswQkFFN0MsS0FBQzlDO2dCQUNDOEIsTUFBTTVCLGVBQWU7b0JBQ25CcUI7b0JBQ0FRLE1BQU16QixZQUFZeUMsVUFBVTtnQkFDOUI7Z0JBQ0FmLFVBQVU7MEJBQ1RkLEVBQUU7Ozs7QUFJWDtBQUVBLGVBQWVOLGNBQWEifQ==