'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { socialProviders } from "../../../constants";
import { Icons } from "../../../../../shared/components/icons";
import { Button, toast } from "@payloadcms/ui";
import { passkeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { Key } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import "./index.scss";
const baseClass = 'admin-social-provider-buttons';
export const AdminSocialProviderButtons = ({ isSignup, loginMethods, setLoading, redirectUrl, newUserCallbackURL, adminInviteToken, baseURL, basePath })=>{
    const router = useRouter();
    const authClient = useMemo(()=>createAuthClient({
            baseURL,
            basePath,
            plugins: [
                passkeyClient()
            ]
        }), []);
    const loginMethodCount = loginMethods.filter((method)=>method !== 'emailPassword', 'passkey').length;
    if (loginMethodCount === 0) return null;
    const showIconOnly = loginMethodCount >= 3;
    return /*#__PURE__*/ _jsxs(_Fragment, {
        children: [
            loginMethods.includes('emailPassword') && /*#__PURE__*/ _jsx("div", {
                style: {
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    marginTop: '-.5rem',
                    color: 'var(--theme-elevation-450)',
                    marginBottom: '1.5rem'
                },
                children: /*#__PURE__*/ _jsxs("span", {
                    children: [
                        "Or ",
                        isSignup ? 'sign up' : 'login',
                        " with"
                    ]
                })
            }),
            /*#__PURE__*/ _jsx("div", {
                className: `${baseClass} ${baseClass}--count-${showIconOnly ? 'many' : loginMethodCount}`,
                children: loginMethods.map((loginMethod)=>{
                    const providerName = loginMethod.charAt(0).toUpperCase() + loginMethod.slice(1);
                    const isSocialProvider = socialProviders.includes(loginMethod);
                    // ---- Passkey ----
                    if (loginMethod === 'passkey') {
                        if (isSignup) return null;
                        const handlePasskeyClick = async ()=>{
                            setLoading(true);
                            try {
                                await authClient.signIn.passkey({
                                    fetchOptions: {
                                        onSuccess () {
                                            if (router && redirectUrl) router.push(redirectUrl);
                                        },
                                        onError (context) {
                                            toast.error(context.error.message || 'Failed to sign in with passkey');
                                        }
                                    }
                                });
                            } catch (error) {
                                toast.error(error?.message || 'Failed to sign in with passkey');
                            } finally{
                                setLoading(false);
                            }
                        };
                        return /*#__PURE__*/ _jsxs(Button, {
                            type: "button",
                            size: "large",
                            className: `${baseClass}__button provider--passkey`,
                            onClick: handlePasskeyClick,
                            icon: showIconOnly ? /*#__PURE__*/ _jsx(Key, {
                                className: `${baseClass}__icon`
                            }) : undefined,
                            tooltip: showIconOnly ? `Sign in with ${providerName}` : undefined,
                            children: [
                                !showIconOnly && /*#__PURE__*/ _jsx(Key, {
                                    className: `${baseClass}__icon`
                                }),
                                !showIconOnly && /*#__PURE__*/ _jsx("span", {
                                    children: providerName
                                })
                            ]
                        }, loginMethod);
                    }
                    // ---- Social providers ----
                    if (isSocialProvider) {
                        const Icon = Icons[loginMethod] ?? null;
                        const handleSocialClick = async ()=>{
                            setLoading(true);
                            try {
                                const { error } = await authClient.signIn.social({
                                    provider: loginMethod,
                                    fetchOptions: {
                                        query: {
                                            ...isSignup && {
                                                adminInviteToken
                                            }
                                        }
                                    },
                                    errorCallbackURL: window.location.href,
                                    callbackURL: redirectUrl,
                                    newUserCallbackURL,
                                    ...isSignup && {
                                        requestSignUp: true
                                    }
                                });
                                if (error) {
                                    toast.error(error.message);
                                }
                            } catch (error) {
                                toast.error(`Failed to sign in with ${providerName}`);
                            } finally{
                                setLoading(false);
                            }
                        };
                        return /*#__PURE__*/ _jsx(Button, {
                            type: "button",
                            size: "large",
                            className: `${baseClass}__button provider--${loginMethod}`,
                            onClick: handleSocialClick,
                            iconPosition: "left",
                            icon: /*#__PURE__*/ _jsx(Icon, {
                                className: `${baseClass}__icon`
                            }),
                            tooltip: showIconOnly ? `Sign in with ${providerName}` : undefined,
                            children: !showIconOnly && /*#__PURE__*/ _jsx("span", {
                                children: providerName
                            })
                        }, loginMethod);
                    }
                    // Unknown provider — render nothing
                    return null;
                })
            })
        ]
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC9jb21wb25lbnRzL3NvY2lhbC1wcm92aWRlci1idXR0b25zL2luZGV4LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGNsaWVudCdcblxuaW1wb3J0IHsgc29jaWFsUHJvdmlkZXJzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vY29uc3RhbnRzJ1xuaW1wb3J0IHR5cGUgeyBCZXR0ZXJBdXRoUGx1Z2luT3B0aW9ucywgTG9naW5NZXRob2QsIFNvY2lhbFByb3ZpZGVyIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vdHlwZXMnXG5pbXBvcnQgeyBJY29ucyB9IGZyb20gJ0Avc2hhcmVkL2NvbXBvbmVudHMvaWNvbnMnXG5pbXBvcnQgeyBCdXR0b24sIHRvYXN0IH0gZnJvbSAnQHBheWxvYWRjbXMvdWknXG5pbXBvcnQgeyBwYXNza2V5Q2xpZW50IH0gZnJvbSAnYmV0dGVyLWF1dGgvY2xpZW50L3BsdWdpbnMnXG5pbXBvcnQgeyBjcmVhdGVBdXRoQ2xpZW50IH0gZnJvbSAnYmV0dGVyLWF1dGgvcmVhY3QnXG5pbXBvcnQgeyBLZXkgfSBmcm9tICdsdWNpZGUtcmVhY3QnXG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tICduZXh0L25hdmlnYXRpb24nXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbyB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0ICcuL2luZGV4LnNjc3MnXG5cbnR5cGUgQWRtaW5Tb2NpYWxQcm92aWRlckJ1dHRvbnNQcm9wcyA9IHtcbiAgaXNTaWdudXA6IGJvb2xlYW5cbiAgbG9naW5NZXRob2RzOiBMb2dpbk1ldGhvZFtdXG4gIHNldExvYWRpbmc6IChsb2FkaW5nOiBib29sZWFuKSA9PiB2b2lkXG4gIHJlZGlyZWN0VXJsPzogc3RyaW5nXG4gIG5ld1VzZXJDYWxsYmFja1VSTD86IHN0cmluZ1xuICBhZG1pbkludml0ZVRva2VuPzogc3RyaW5nXG4gIGJhc2VVUkw/OiBzdHJpbmdcbiAgYmFzZVBhdGg/OiBzdHJpbmdcbn1cblxuY29uc3QgYmFzZUNsYXNzID0gJ2FkbWluLXNvY2lhbC1wcm92aWRlci1idXR0b25zJ1xuXG5leHBvcnQgY29uc3QgQWRtaW5Tb2NpYWxQcm92aWRlckJ1dHRvbnM6IFJlYWN0LkZDPEFkbWluU29jaWFsUHJvdmlkZXJCdXR0b25zUHJvcHM+ID0gKHtcbiAgaXNTaWdudXAsXG4gIGxvZ2luTWV0aG9kcyxcbiAgc2V0TG9hZGluZyxcbiAgcmVkaXJlY3RVcmwsXG4gIG5ld1VzZXJDYWxsYmFja1VSTCxcbiAgYWRtaW5JbnZpdGVUb2tlbixcbiAgYmFzZVVSTCxcbiAgYmFzZVBhdGhcbn0pID0+IHtcbiAgY29uc3Qgcm91dGVyID0gdXNlUm91dGVyKClcbiAgY29uc3QgYXV0aENsaWVudCA9IHVzZU1lbW8oXG4gICAgKCkgPT5cbiAgICAgIGNyZWF0ZUF1dGhDbGllbnQoe1xuICAgICAgICBiYXNlVVJMLFxuICAgICAgICBiYXNlUGF0aCxcbiAgICAgICAgcGx1Z2luczogW3Bhc3NrZXlDbGllbnQoKV1cbiAgICAgIH0pLFxuICAgIFtdXG4gIClcblxuICBjb25zdCBsb2dpbk1ldGhvZENvdW50ID0gbG9naW5NZXRob2RzLmZpbHRlcigobWV0aG9kKSA9PiBtZXRob2QgIT09ICdlbWFpbFBhc3N3b3JkJywgJ3Bhc3NrZXknKS5sZW5ndGhcbiAgaWYgKGxvZ2luTWV0aG9kQ291bnQgPT09IDApIHJldHVybiBudWxsXG5cbiAgY29uc3Qgc2hvd0ljb25Pbmx5ID0gbG9naW5NZXRob2RDb3VudCA+PSAzXG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAge2xvZ2luTWV0aG9kcy5pbmNsdWRlcygnZW1haWxQYXNzd29yZCcpICYmIChcbiAgICAgICAgPGRpdlxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgICAgICAgZm9udFNpemU6ICcwLjg3NXJlbScsXG4gICAgICAgICAgICB0ZXh0VHJhbnNmb3JtOiAndXBwZXJjYXNlJyxcbiAgICAgICAgICAgIG1hcmdpblRvcDogJy0uNXJlbScsXG4gICAgICAgICAgICBjb2xvcjogJ3ZhcigtLXRoZW1lLWVsZXZhdGlvbi00NTApJyxcbiAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzEuNXJlbSdcbiAgICAgICAgICB9fT5cbiAgICAgICAgICA8c3Bhbj5PciB7aXNTaWdudXAgPyAnc2lnbiB1cCcgOiAnbG9naW4nfSB3aXRoPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICl9XG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7YmFzZUNsYXNzfSAke2Jhc2VDbGFzc30tLWNvdW50LSR7c2hvd0ljb25Pbmx5ID8gJ21hbnknIDogbG9naW5NZXRob2RDb3VudH1gfT5cbiAgICAgICAge2xvZ2luTWV0aG9kcy5tYXAoKGxvZ2luTWV0aG9kKSA9PiB7XG4gICAgICAgICAgY29uc3QgcHJvdmlkZXJOYW1lID0gbG9naW5NZXRob2QuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBsb2dpbk1ldGhvZC5zbGljZSgxKVxuICAgICAgICAgIGNvbnN0IGlzU29jaWFsUHJvdmlkZXIgPSBzb2NpYWxQcm92aWRlcnMuaW5jbHVkZXMobG9naW5NZXRob2QgYXMgU29jaWFsUHJvdmlkZXIpXG5cbiAgICAgICAgICAvLyAtLS0tIFBhc3NrZXkgLS0tLVxuICAgICAgICAgIGlmIChsb2dpbk1ldGhvZCA9PT0gJ3Bhc3NrZXknKSB7XG4gICAgICAgICAgICBpZiAoaXNTaWdudXApIHJldHVybiBudWxsXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVQYXNza2V5Q2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgIHNldExvYWRpbmcodHJ1ZSlcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBhdXRoQ2xpZW50LnNpZ25Jbi5wYXNza2V5KHtcbiAgICAgICAgICAgICAgICAgIGZldGNoT3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3MoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlciAmJiByZWRpcmVjdFVybCkgcm91dGVyLnB1c2gocmVkaXJlY3RVcmwpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoY29udGV4dDogYW55KSB7XG4gICAgICAgICAgICAgICAgICAgICAgdG9hc3QuZXJyb3IoY29udGV4dC5lcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gc2lnbiBpbiB3aXRoIHBhc3NrZXknKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgICAgIHRvYXN0LmVycm9yKGVycm9yPy5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gc2lnbiBpbiB3aXRoIHBhc3NrZXknKVxuICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHNldExvYWRpbmcoZmFsc2UpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgIGtleT17bG9naW5NZXRob2R9XG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgc2l6ZT1cImxhcmdlXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Ake2Jhc2VDbGFzc31fX2J1dHRvbiBwcm92aWRlci0tcGFzc2tleWB9XG4gICAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlUGFzc2tleUNsaWNrfVxuICAgICAgICAgICAgICAgIGljb249e3Nob3dJY29uT25seSA/IDxLZXkgY2xhc3NOYW1lPXtgJHtiYXNlQ2xhc3N9X19pY29uYH0gLz4gOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgdG9vbHRpcD17c2hvd0ljb25Pbmx5ID8gYFNpZ24gaW4gd2l0aCAke3Byb3ZpZGVyTmFtZX1gIDogdW5kZWZpbmVkfT5cbiAgICAgICAgICAgICAgICB7IXNob3dJY29uT25seSAmJiA8S2V5IGNsYXNzTmFtZT17YCR7YmFzZUNsYXNzfV9faWNvbmB9IC8+fVxuICAgICAgICAgICAgICAgIHshc2hvd0ljb25Pbmx5ICYmIDxzcGFuPntwcm92aWRlck5hbWV9PC9zcGFuPn1cbiAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gLS0tLSBTb2NpYWwgcHJvdmlkZXJzIC0tLS1cbiAgICAgICAgICBpZiAoaXNTb2NpYWxQcm92aWRlcikge1xuICAgICAgICAgICAgY29uc3QgSWNvbiA9IEljb25zW2xvZ2luTWV0aG9kIGFzIGtleW9mIHR5cGVvZiBJY29uc10gPz8gbnVsbFxuXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVTb2NpYWxDbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgc2V0TG9hZGluZyh0cnVlKVxuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IGF1dGhDbGllbnQuc2lnbkluLnNvY2lhbCh7XG4gICAgICAgICAgICAgICAgICBwcm92aWRlcjogbG9naW5NZXRob2QgYXMgU29jaWFsUHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgICBmZXRjaE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAuLi4oaXNTaWdudXAgJiYgeyBhZG1pbkludml0ZVRva2VuIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBlcnJvckNhbGxiYWNrVVJMOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgICAgICAgIGNhbGxiYWNrVVJMOiByZWRpcmVjdFVybCxcbiAgICAgICAgICAgICAgICAgIG5ld1VzZXJDYWxsYmFja1VSTCxcbiAgICAgICAgICAgICAgICAgIC4uLihpc1NpZ251cCAmJiB7IHJlcXVlc3RTaWduVXA6IHRydWUgfSlcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICB0b2FzdC5lcnJvcihlcnJvci5tZXNzYWdlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgICAgIHRvYXN0LmVycm9yKGBGYWlsZWQgdG8gc2lnbiBpbiB3aXRoICR7cHJvdmlkZXJOYW1lfWApXG4gICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgc2V0TG9hZGluZyhmYWxzZSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAga2V5PXtsb2dpbk1ldGhvZH1cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBzaXplPVwibGFyZ2VcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YCR7YmFzZUNsYXNzfV9fYnV0dG9uIHByb3ZpZGVyLS0ke2xvZ2luTWV0aG9kfWB9XG4gICAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlU29jaWFsQ2xpY2t9XG4gICAgICAgICAgICAgICAgaWNvblBvc2l0aW9uPVwibGVmdFwiXG4gICAgICAgICAgICAgICAgaWNvbj17PEljb24gY2xhc3NOYW1lPXtgJHtiYXNlQ2xhc3N9X19pY29uYH0gLz59XG4gICAgICAgICAgICAgICAgdG9vbHRpcD17c2hvd0ljb25Pbmx5ID8gYFNpZ24gaW4gd2l0aCAke3Byb3ZpZGVyTmFtZX1gIDogdW5kZWZpbmVkfT5cbiAgICAgICAgICAgICAgICB7IXNob3dJY29uT25seSAmJiA8c3Bhbj57cHJvdmlkZXJOYW1lfTwvc3Bhbj59XG4gICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFVua25vd24gcHJvdmlkZXIg4oCUIHJlbmRlciBub3RoaW5nXG4gICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfSl9XG4gICAgICA8L2Rpdj5cbiAgICA8Lz5cbiAgKVxufVxuIl0sIm5hbWVzIjpbInNvY2lhbFByb3ZpZGVycyIsIkljb25zIiwiQnV0dG9uIiwidG9hc3QiLCJwYXNza2V5Q2xpZW50IiwiY3JlYXRlQXV0aENsaWVudCIsIktleSIsInVzZVJvdXRlciIsIlJlYWN0IiwidXNlTWVtbyIsImJhc2VDbGFzcyIsIkFkbWluU29jaWFsUHJvdmlkZXJCdXR0b25zIiwiaXNTaWdudXAiLCJsb2dpbk1ldGhvZHMiLCJzZXRMb2FkaW5nIiwicmVkaXJlY3RVcmwiLCJuZXdVc2VyQ2FsbGJhY2tVUkwiLCJhZG1pbkludml0ZVRva2VuIiwiYmFzZVVSTCIsImJhc2VQYXRoIiwicm91dGVyIiwiYXV0aENsaWVudCIsInBsdWdpbnMiLCJsb2dpbk1ldGhvZENvdW50IiwiZmlsdGVyIiwibWV0aG9kIiwibGVuZ3RoIiwic2hvd0ljb25Pbmx5IiwiaW5jbHVkZXMiLCJkaXYiLCJzdHlsZSIsInRleHRBbGlnbiIsImZvbnRTaXplIiwidGV4dFRyYW5zZm9ybSIsIm1hcmdpblRvcCIsImNvbG9yIiwibWFyZ2luQm90dG9tIiwic3BhbiIsImNsYXNzTmFtZSIsIm1hcCIsImxvZ2luTWV0aG9kIiwicHJvdmlkZXJOYW1lIiwiY2hhckF0IiwidG9VcHBlckNhc2UiLCJzbGljZSIsImlzU29jaWFsUHJvdmlkZXIiLCJoYW5kbGVQYXNza2V5Q2xpY2siLCJzaWduSW4iLCJwYXNza2V5IiwiZmV0Y2hPcHRpb25zIiwib25TdWNjZXNzIiwicHVzaCIsIm9uRXJyb3IiLCJjb250ZXh0IiwiZXJyb3IiLCJtZXNzYWdlIiwidHlwZSIsInNpemUiLCJvbkNsaWNrIiwiaWNvbiIsInVuZGVmaW5lZCIsInRvb2x0aXAiLCJJY29uIiwiaGFuZGxlU29jaWFsQ2xpY2siLCJzb2NpYWwiLCJwcm92aWRlciIsInF1ZXJ5IiwiZXJyb3JDYWxsYmFja1VSTCIsIndpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiIsImNhbGxiYWNrVVJMIiwicmVxdWVzdFNpZ25VcCIsImljb25Qb3NpdGlvbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsU0FBU0EsZUFBZSxRQUFRLHFCQUFnQztBQUVoRSxTQUFTQyxLQUFLLFFBQVEseUNBQTJCO0FBQ2pELFNBQVNDLE1BQU0sRUFBRUMsS0FBSyxRQUFRLGlCQUFnQjtBQUM5QyxTQUFTQyxhQUFhLFFBQVEsNkJBQTRCO0FBQzFELFNBQVNDLGdCQUFnQixRQUFRLG9CQUFtQjtBQUNwRCxTQUFTQyxHQUFHLFFBQVEsZUFBYztBQUNsQyxTQUFTQyxTQUFTLFFBQVEsa0JBQWlCO0FBQzNDLE9BQU9DLFNBQVNDLE9BQU8sUUFBUSxRQUFPO0FBQ3RDLE9BQU8sZUFBYztBQWFyQixNQUFNQyxZQUFZO0FBRWxCLE9BQU8sTUFBTUMsNkJBQXdFLENBQUMsRUFDcEZDLFFBQVEsRUFDUkMsWUFBWSxFQUNaQyxVQUFVLEVBQ1ZDLFdBQVcsRUFDWEMsa0JBQWtCLEVBQ2xCQyxnQkFBZ0IsRUFDaEJDLE9BQU8sRUFDUEMsUUFBUSxFQUNUO0lBQ0MsTUFBTUMsU0FBU2I7SUFDZixNQUFNYyxhQUFhWixRQUNqQixJQUNFSixpQkFBaUI7WUFDZmE7WUFDQUM7WUFDQUcsU0FBUztnQkFBQ2xCO2FBQWdCO1FBQzVCLElBQ0YsRUFBRTtJQUdKLE1BQU1tQixtQkFBbUJWLGFBQWFXLE1BQU0sQ0FBQyxDQUFDQyxTQUFXQSxXQUFXLGlCQUFpQixXQUFXQyxNQUFNO0lBQ3RHLElBQUlILHFCQUFxQixHQUFHLE9BQU87SUFF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