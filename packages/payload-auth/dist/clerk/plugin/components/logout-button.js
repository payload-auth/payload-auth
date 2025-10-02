'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { LogOutIcon, useAuth, useTranslation } from "@payloadcms/ui";
import { useEffect, useState } from "react";
import { loadClerkInstance } from "../../utils/load-clerk-instance";
export const LogoutButton = ()=>{
    const [clerkInstance, setClerkInstance] = useState(undefined);
    const { logOut } = useAuth();
    const { t } = useTranslation();
    useEffect(()=>{
        loadClerkInstance().then((instance)=>{
            setClerkInstance(instance);
        }).catch((err)=>console.error('Error loading clerk:', err));
    }, []);
    return /*#__PURE__*/ _jsx("button", {
        "aria-label": t('authentication:logOut'),
        className: 'nav__log-out',
        style: {
            background: 'transparent',
            border: '1px solid var(--theme-elevation-100)',
            width: '34px',
            height: '34px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitAppearance: 'none',
            cursor: 'pointer',
            padding: '7px'
        },
        onClick: async ()=>{
            if (!clerkInstance) return;
            try {
                if (clerkInstance.user) {
                    await clerkInstance.signOut();
                }
                if (logOut) {
                    await logOut();
                }
                window.location.reload();
            } catch (err) {
                console.error('Error logging out:', err);
            }
        },
        children: /*#__PURE__*/ _jsx(LogOutIcon, {})
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGVyay9wbHVnaW4vY29tcG9uZW50cy9sb2dvdXQtYnV0dG9uLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGNsaWVudCdcblxuaW1wb3J0IHR5cGUgeyBDbGVyayB9IGZyb20gJ0BjbGVyay9jbGVyay1qcydcbmltcG9ydCB7IExvZ091dEljb24sIHVzZUF1dGgsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnQHBheWxvYWRjbXMvdWknXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBsb2FkQ2xlcmtJbnN0YW5jZSB9IGZyb20gJy4uLy4uL3V0aWxzL2xvYWQtY2xlcmstaW5zdGFuY2UnXG5cbmV4cG9ydCBjb25zdCBMb2dvdXRCdXR0b24gPSAoKSA9PiB7XG4gIGNvbnN0IFtjbGVya0luc3RhbmNlLCBzZXRDbGVya0luc3RhbmNlXSA9IHVzZVN0YXRlPENsZXJrIHwgdW5kZWZpbmVkPih1bmRlZmluZWQpXG4gIGNvbnN0IHsgbG9nT3V0IH0gPSB1c2VBdXRoKClcbiAgY29uc3QgeyB0IH0gPSB1c2VUcmFuc2xhdGlvbigpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsb2FkQ2xlcmtJbnN0YW5jZSgpXG4gICAgICAudGhlbigoaW5zdGFuY2UpID0+IHtcbiAgICAgICAgc2V0Q2xlcmtJbnN0YW5jZShpbnN0YW5jZSlcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycjogYW55KSA9PiBjb25zb2xlLmVycm9yKCdFcnJvciBsb2FkaW5nIGNsZXJrOicsIGVycikpXG4gIH0sIFtdKVxuXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgYXJpYS1sYWJlbD17dCgnYXV0aGVudGljYXRpb246bG9nT3V0Jyl9XG4gICAgICBjbGFzc05hbWU9eyduYXZfX2xvZy1vdXQnfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgYmFja2dyb3VuZDogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkIHZhcigtLXRoZW1lLWVsZXZhdGlvbi0xMDApJyxcbiAgICAgICAgd2lkdGg6ICczNHB4JyxcbiAgICAgICAgaGVpZ2h0OiAnMzRweCcsXG4gICAgICAgIGJvcmRlclJhZGl1czogJzk5OTlweCcsXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICAgICAgV2Via2l0QXBwZWFyYW5jZTogJ25vbmUnLFxuICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgcGFkZGluZzogJzdweCdcbiAgICAgIH19XG4gICAgICBvbkNsaWNrPXthc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghY2xlcmtJbnN0YW5jZSkgcmV0dXJuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKGNsZXJrSW5zdGFuY2UudXNlcikge1xuICAgICAgICAgICAgYXdhaXQgY2xlcmtJbnN0YW5jZS5zaWduT3V0KClcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGxvZ091dCkge1xuICAgICAgICAgICAgYXdhaXQgbG9nT3V0KClcbiAgICAgICAgICB9XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGxvZ2dpbmcgb3V0OicsIGVycilcbiAgICAgICAgfVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8TG9nT3V0SWNvbiAvPlxuICAgIDwvYnV0dG9uPlxuICApXG59XG4iXSwibmFtZXMiOlsiTG9nT3V0SWNvbiIsInVzZUF1dGgiLCJ1c2VUcmFuc2xhdGlvbiIsInVzZUVmZmVjdCIsInVzZVN0YXRlIiwibG9hZENsZXJrSW5zdGFuY2UiLCJMb2dvdXRCdXR0b24iLCJjbGVya0luc3RhbmNlIiwic2V0Q2xlcmtJbnN0YW5jZSIsInVuZGVmaW5lZCIsImxvZ091dCIsInQiLCJ0aGVuIiwiaW5zdGFuY2UiLCJjYXRjaCIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsImJ1dHRvbiIsImFyaWEtbGFiZWwiLCJjbGFzc05hbWUiLCJzdHlsZSIsImJhY2tncm91bmQiLCJib3JkZXIiLCJ3aWR0aCIsImhlaWdodCIsImJvcmRlclJhZGl1cyIsImRpc3BsYXkiLCJhbGlnbkl0ZW1zIiwianVzdGlmeUNvbnRlbnQiLCJXZWJraXRBcHBlYXJhbmNlIiwiY3Vyc29yIiwicGFkZGluZyIsIm9uQ2xpY2siLCJ1c2VyIiwic2lnbk91dCIsIndpbmRvdyIsImxvY2F0aW9uIiwicmVsb2FkIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFHQSxTQUFTQSxVQUFVLEVBQUVDLE9BQU8sRUFBRUMsY0FBYyxRQUFRLGlCQUFnQjtBQUNwRSxTQUFTQyxTQUFTLEVBQUVDLFFBQVEsUUFBUSxRQUFPO0FBQzNDLFNBQVNDLGlCQUFpQixRQUFRLGtDQUFpQztBQUVuRSxPQUFPLE1BQU1DLGVBQWU7SUFDMUIsTUFBTSxDQUFDQyxlQUFlQyxpQkFBaUIsR0FBR0osU0FBNEJLO0lBQ3RFLE1BQU0sRUFBRUMsTUFBTSxFQUFFLEdBQUdUO0lBQ25CLE1BQU0sRUFBRVUsQ0FBQyxFQUFFLEdBQUdUO0lBRWRDLFVBQVU7UUFDUkUsb0JBQ0dPLElBQUksQ0FBQyxDQUFDQztZQUNMTCxpQkFBaUJLO1FBQ25CLEdBQ0NDLEtBQUssQ0FBQyxDQUFDQyxNQUFhQyxRQUFRQyxLQUFLLENBQUMsd0JBQXdCRjtJQUMvRCxHQUFHLEVBQUU7SUFFTCxxQkFDRSxLQUFDRztRQUNDQyxjQUFZUixFQUFFO1FBQ2RTLFdBQVc7UUFDWEMsT0FBTztZQUNMQyxZQUFZO1lBQ1pDLFFBQVE7WUFDUkMsT0FBTztZQUNQQyxRQUFRO1lBQ1JDLGNBQWM7WUFDZEMsU0FBUztZQUNUQyxZQUFZO1lBQ1pDLGdCQUFnQjtZQUNoQkMsa0JBQWtCO1lBQ2xCQyxRQUFRO1lBQ1JDLFNBQVM7UUFDWDtRQUNBQyxTQUFTO1lBQ1AsSUFBSSxDQUFDMUIsZUFBZTtZQUNwQixJQUFJO2dCQUNGLElBQUlBLGNBQWMyQixJQUFJLEVBQUU7b0JBQ3RCLE1BQU0zQixjQUFjNEIsT0FBTztnQkFDN0I7Z0JBQ0EsSUFBSXpCLFFBQVE7b0JBQ1YsTUFBTUE7Z0JBQ1I7Z0JBQ0EwQixPQUFPQyxRQUFRLENBQUNDLE1BQU07WUFDeEIsRUFBRSxPQUFPdkIsS0FBSztnQkFDWkMsUUFBUUMsS0FBSyxDQUFDLHNCQUFzQkY7WUFDdEM7UUFDRjtrQkFFQSxjQUFBLEtBQUNmOztBQUdQLEVBQUMifQ==