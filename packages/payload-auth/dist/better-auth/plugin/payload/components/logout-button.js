'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { formatAdminURL } from "payload/shared";
import { LogOutIcon, useConfig, useTranslation } from "@payloadcms/ui";
const baseClass = 'nav';
export const LogoutButton = ({ tabIndex = 0 })=>{
    const { t } = useTranslation();
    const { config } = useConfig();
    const { admin: { routes: { logout: logoutRoute } }, routes: { admin: adminRoute } } = config;
    return /*#__PURE__*/ _jsx("a", {
        "aria-label": t('authentication:logOut'),
        className: `${baseClass}__log-out`,
        href: formatAdminURL({
            adminRoute,
            path: logoutRoute
        }),
        tabIndex: tabIndex,
        title: t('authentication:logOut'),
        children: /*#__PURE__*/ _jsx(LogOutIcon, {})
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC9jb21wb25lbnRzL2xvZ291dC1idXR0b24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50J1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBmb3JtYXRBZG1pblVSTCB9IGZyb20gJ3BheWxvYWQvc2hhcmVkJ1xuaW1wb3J0IHsgTG9nT3V0SWNvbiwgdXNlQ29uZmlnLCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ0BwYXlsb2FkY21zL3VpJ1xuXG5jb25zdCBiYXNlQ2xhc3MgPSAnbmF2J1xuXG5leHBvcnQgY29uc3QgTG9nb3V0QnV0dG9uOiBSZWFjdC5GQzx7XG4gIHRhYkluZGV4PzogbnVtYmVyXG59PiA9ICh7IHRhYkluZGV4ID0gMCB9KSA9PiB7XG4gIGNvbnN0IHsgdCB9ID0gdXNlVHJhbnNsYXRpb24oKVxuICBjb25zdCB7IGNvbmZpZyB9ID0gdXNlQ29uZmlnKClcblxuICBjb25zdCB7XG4gICAgYWRtaW46IHtcbiAgICAgIHJvdXRlczogeyBsb2dvdXQ6IGxvZ291dFJvdXRlIH1cbiAgICB9LFxuICAgIHJvdXRlczogeyBhZG1pbjogYWRtaW5Sb3V0ZSB9XG4gIH0gPSBjb25maWdcblxuICByZXR1cm4gKFxuICAgIDxhXG4gICAgICBhcmlhLWxhYmVsPXt0KCdhdXRoZW50aWNhdGlvbjpsb2dPdXQnKX1cbiAgICAgIGNsYXNzTmFtZT17YCR7YmFzZUNsYXNzfV9fbG9nLW91dGB9XG4gICAgICBocmVmPXtmb3JtYXRBZG1pblVSTCh7XG4gICAgICAgIGFkbWluUm91dGUsXG4gICAgICAgIHBhdGg6IGxvZ291dFJvdXRlXG4gICAgICB9KX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHRpdGxlPXt0KCdhdXRoZW50aWNhdGlvbjpsb2dPdXQnKX0+XG4gICAgICA8TG9nT3V0SWNvbiAvPlxuICAgIDwvYT5cbiAgKVxufVxuIl0sIm5hbWVzIjpbIlJlYWN0IiwiZm9ybWF0QWRtaW5VUkwiLCJMb2dPdXRJY29uIiwidXNlQ29uZmlnIiwidXNlVHJhbnNsYXRpb24iLCJiYXNlQ2xhc3MiLCJMb2dvdXRCdXR0b24iLCJ0YWJJbmRleCIsInQiLCJjb25maWciLCJhZG1pbiIsInJvdXRlcyIsImxvZ291dCIsImxvZ291dFJvdXRlIiwiYWRtaW5Sb3V0ZSIsImEiLCJhcmlhLWxhYmVsIiwiY2xhc3NOYW1lIiwiaHJlZiIsInBhdGgiLCJ0aXRsZSJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsT0FBT0EsV0FBVyxRQUFPO0FBQ3pCLFNBQVNDLGNBQWMsUUFBUSxpQkFBZ0I7QUFDL0MsU0FBU0MsVUFBVSxFQUFFQyxTQUFTLEVBQUVDLGNBQWMsUUFBUSxpQkFBZ0I7QUFFdEUsTUFBTUMsWUFBWTtBQUVsQixPQUFPLE1BQU1DLGVBRVIsQ0FBQyxFQUFFQyxXQUFXLENBQUMsRUFBRTtJQUNwQixNQUFNLEVBQUVDLENBQUMsRUFBRSxHQUFHSjtJQUNkLE1BQU0sRUFBRUssTUFBTSxFQUFFLEdBQUdOO0lBRW5CLE1BQU0sRUFDSk8sT0FBTyxFQUNMQyxRQUFRLEVBQUVDLFFBQVFDLFdBQVcsRUFBRSxFQUNoQyxFQUNERixRQUFRLEVBQUVELE9BQU9JLFVBQVUsRUFBRSxFQUM5QixHQUFHTDtJQUVKLHFCQUNFLEtBQUNNO1FBQ0NDLGNBQVlSLEVBQUU7UUFDZFMsV0FBVyxHQUFHWixVQUFVLFNBQVMsQ0FBQztRQUNsQ2EsTUFBTWpCLGVBQWU7WUFDbkJhO1lBQ0FLLE1BQU1OO1FBQ1I7UUFDQU4sVUFBVUE7UUFDVmEsT0FBT1osRUFBRTtrQkFDVCxjQUFBLEtBQUNOOztBQUdQLEVBQUMifQ==