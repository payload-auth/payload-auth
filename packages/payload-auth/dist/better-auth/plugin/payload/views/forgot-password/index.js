import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Fragment } from "react";
import { Button, Translation } from "@payloadcms/ui";
import Link from "next/link";
import { formatAdminURL } from "payload/shared";
import { FormHeader } from "../../../../../shared/form/ui/header";
import { ForgotPasswordForm } from "./client";
import { adminRoutes } from "../../../constants";
import { MinimalTemplate } from "@payloadcms/next/templates";
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC92aWV3cy9mb3Jnb3QtcGFzc3dvcmQvaW5kZXgudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBGcmFnbWVudCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQnV0dG9uLCBUcmFuc2xhdGlvbiB9IGZyb20gJ0BwYXlsb2FkY21zL3VpJ1xuaW1wb3J0IExpbmsgZnJvbSAnbmV4dC9saW5rJ1xuaW1wb3J0IHR5cGUgeyBBZG1pblZpZXdTZXJ2ZXJQcm9wcyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBmb3JtYXRBZG1pblVSTCB9IGZyb20gJ3BheWxvYWQvc2hhcmVkJ1xuaW1wb3J0IHsgRm9ybUhlYWRlciB9IGZyb20gJ0Avc2hhcmVkL2Zvcm0vdWkvaGVhZGVyJ1xuaW1wb3J0IHsgRm9yZ290UGFzc3dvcmRGb3JtIH0gZnJvbSAnLi9jbGllbnQnXG5pbXBvcnQgeyBhZG1pblJvdXRlcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2NvbnN0YW50cydcbmltcG9ydCB0eXBlIHsgQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi90eXBlcydcbmltcG9ydCB7IE1pbmltYWxUZW1wbGF0ZSB9IGZyb20gJ0BwYXlsb2FkY21zL25leHQvdGVtcGxhdGVzJ1xuXG50eXBlIEZvcmdvdFBhc3N3b3JkUHJvcHMgPSBBZG1pblZpZXdTZXJ2ZXJQcm9wcyAmIHtcbiAgcGx1Z2luT3B0aW9uczogQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnNcbn1cblxuY29uc3QgRm9yZ290UGFzc3dvcmQ6IFJlYWN0LkZDPEZvcmdvdFBhc3N3b3JkUHJvcHM+ID0gKHsgcGx1Z2luT3B0aW9ucywgaW5pdFBhZ2VSZXN1bHQgfSkgPT4ge1xuICBjb25zdCB7XG4gICAgcmVxOiB7XG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIGFkbWluOiB7XG4gICAgICAgICAgICByb3V0ZXM6IHsgYWNjb3VudDogYWNjb3VudFJvdXRlIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHJvdXRlczogeyBhZG1pbjogYWRtaW5Sb3V0ZSB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1c2VyLFxuICAgICAgaTE4blxuICAgIH1cbiAgfSA9IGluaXRQYWdlUmVzdWx0XG5cbiAgaWYgKHVzZXIpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEZyYWdtZW50PlxuICAgICAgICA8Rm9ybUhlYWRlclxuICAgICAgICAgIGRlc2NyaXB0aW9uPXtcbiAgICAgICAgICAgIDxUcmFuc2xhdGlvblxuICAgICAgICAgICAgICBlbGVtZW50cz17e1xuICAgICAgICAgICAgICAgICcwJzogKHsgY2hpbGRyZW4gfSkgPT4gKFxuICAgICAgICAgICAgICAgICAgPExpbmtcbiAgICAgICAgICAgICAgICAgICAgaHJlZj17Zm9ybWF0QWRtaW5VUkwoe1xuICAgICAgICAgICAgICAgICAgICAgIGFkbWluUm91dGUsXG4gICAgICAgICAgICAgICAgICAgICAgcGF0aDogYWNjb3VudFJvdXRlXG4gICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICBwcmVmZXRjaD17ZmFsc2V9PlxuICAgICAgICAgICAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgICAgICAgICAgICA8L0xpbms+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBpMThuS2V5PVwiYXV0aGVudGljYXRpb246bG9nZ2VkSW5DaGFuZ2VQYXNzd29yZFwiXG4gICAgICAgICAgICAgIHQ9e2kxOG4udH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgfVxuICAgICAgICAgIGhlYWRpbmc9e2kxOG4udCgnYXV0aGVudGljYXRpb246YWxyZWFkeUxvZ2dlZEluJyl9XG4gICAgICAgIC8+XG4gICAgICAgIDxCdXR0b24gYnV0dG9uU3R5bGU9XCJzZWNvbmRhcnlcIiBlbD1cImxpbmtcIiBzaXplPVwibGFyZ2VcIiB0bz17YWRtaW5Sb3V0ZX0+XG4gICAgICAgICAge2kxOG4udCgnZ2VuZXJhbDpiYWNrVG9EYXNoYm9hcmQnKX1cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0ZyYWdtZW50PlxuICAgIClcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPE1pbmltYWxUZW1wbGF0ZT5cbiAgICAgIDxGb3Jnb3RQYXNzd29yZEZvcm0gYmFzZVVSTD17cGx1Z2luT3B0aW9ucy5iZXR0ZXJBdXRoT3B0aW9ucz8uYmFzZVVSTH0gYmFzZVBhdGg9e3BsdWdpbk9wdGlvbnMuYmV0dGVyQXV0aE9wdGlvbnM/LmJhc2VQYXRofSAvPlxuICAgICAgPExpbmtcbiAgICAgICAgaHJlZj17Zm9ybWF0QWRtaW5VUkwoe1xuICAgICAgICAgIGFkbWluUm91dGUsXG4gICAgICAgICAgcGF0aDogYWRtaW5Sb3V0ZXMuYWRtaW5Mb2dpbiBhcyBgLyR7c3RyaW5nfWBcbiAgICAgICAgfSl9XG4gICAgICAgIHByZWZldGNoPXtmYWxzZX0+XG4gICAgICAgIHtpMThuLnQoJ2F1dGhlbnRpY2F0aW9uOmJhY2tUb0xvZ2luJyl9XG4gICAgICA8L0xpbms+XG4gICAgPC9NaW5pbWFsVGVtcGxhdGU+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgRm9yZ290UGFzc3dvcmRcbiJdLCJuYW1lcyI6WyJSZWFjdCIsIkZyYWdtZW50IiwiQnV0dG9uIiwiVHJhbnNsYXRpb24iLCJMaW5rIiwiZm9ybWF0QWRtaW5VUkwiLCJGb3JtSGVhZGVyIiwiRm9yZ290UGFzc3dvcmRGb3JtIiwiYWRtaW5Sb3V0ZXMiLCJNaW5pbWFsVGVtcGxhdGUiLCJGb3Jnb3RQYXNzd29yZCIsInBsdWdpbk9wdGlvbnMiLCJpbml0UGFnZVJlc3VsdCIsInJlcSIsInBheWxvYWQiLCJjb25maWciLCJhZG1pbiIsInJvdXRlcyIsImFjY291bnQiLCJhY2NvdW50Um91dGUiLCJhZG1pblJvdXRlIiwidXNlciIsImkxOG4iLCJkZXNjcmlwdGlvbiIsImVsZW1lbnRzIiwiY2hpbGRyZW4iLCJocmVmIiwicGF0aCIsInByZWZldGNoIiwiaTE4bktleSIsInQiLCJoZWFkaW5nIiwiYnV0dG9uU3R5bGUiLCJlbCIsInNpemUiLCJ0byIsImJhc2VVUkwiLCJiZXR0ZXJBdXRoT3B0aW9ucyIsImJhc2VQYXRoIiwiYWRtaW5Mb2dpbiJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU9BLFNBQVNDLFFBQVEsUUFBUSxRQUFPO0FBQ3ZDLFNBQVNDLE1BQU0sRUFBRUMsV0FBVyxRQUFRLGlCQUFnQjtBQUNwRCxPQUFPQyxVQUFVLFlBQVc7QUFFNUIsU0FBU0MsY0FBYyxRQUFRLGlCQUFnQjtBQUMvQyxTQUFTQyxVQUFVLFFBQVEsdUNBQXlCO0FBQ3BELFNBQVNDLGtCQUFrQixRQUFRLFdBQVU7QUFDN0MsU0FBU0MsV0FBVyxRQUFRLHFCQUFnQztBQUU1RCxTQUFTQyxlQUFlLFFBQVEsNkJBQTRCO0FBTTVELE1BQU1DLGlCQUFnRCxDQUFDLEVBQUVDLGFBQWEsRUFBRUMsY0FBYyxFQUFFO0lBQ3RGLE1BQU0sRUFDSkMsS0FBSyxFQUNIQyxTQUFTLEVBQ1BDLFFBQVEsRUFDTkMsT0FBTyxFQUNMQyxRQUFRLEVBQUVDLFNBQVNDLFlBQVksRUFBRSxFQUNsQyxFQUNERixRQUFRLEVBQUVELE9BQU9JLFVBQVUsRUFBRSxFQUM5QixFQUNGLEVBQ0RDLElBQUksRUFDSkMsSUFBSSxFQUNMLEVBQ0YsR0FBR1Y7SUFFSixJQUFJUyxNQUFNO1FBQ1IscUJBQ0UsTUFBQ3BCOzs4QkFDQyxLQUFDSztvQkFDQ2lCLDJCQUNFLEtBQUNwQjt3QkFDQ3FCLFVBQVU7NEJBQ1IsS0FBSyxDQUFDLEVBQUVDLFFBQVEsRUFBRSxpQkFDaEIsS0FBQ3JCO29DQUNDc0IsTUFBTXJCLGVBQWU7d0NBQ25CZTt3Q0FDQU8sTUFBTVI7b0NBQ1I7b0NBQ0FTLFVBQVU7OENBQ1RIOzt3QkFHUDt3QkFDQUksU0FBUTt3QkFDUkMsR0FBR1IsS0FBS1EsQ0FBQzs7b0JBR2JDLFNBQVNULEtBQUtRLENBQUMsQ0FBQzs7OEJBRWxCLEtBQUM1QjtvQkFBTzhCLGFBQVk7b0JBQVlDLElBQUc7b0JBQU9DLE1BQUs7b0JBQVFDLElBQUlmOzhCQUN4REUsS0FBS1EsQ0FBQyxDQUFDOzs7O0lBSWhCO0lBRUEscUJBQ0UsTUFBQ3JCOzswQkFDQyxLQUFDRjtnQkFBbUI2QixTQUFTekIsY0FBYzBCLGlCQUFpQixFQUFFRDtnQkFBU0UsVUFBVTNCLGNBQWMwQixpQkFBaUIsRUFBRUM7OzBCQUNsSCxLQUFDbEM7Z0JBQ0NzQixNQUFNckIsZUFBZTtvQkFDbkJlO29CQUNBTyxNQUFNbkIsWUFBWStCLFVBQVU7Z0JBQzlCO2dCQUNBWCxVQUFVOzBCQUNUTixLQUFLUSxDQUFDLENBQUM7Ozs7QUFJaEI7QUFFQSxlQUFlcEIsZUFBYyJ9