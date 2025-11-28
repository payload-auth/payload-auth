'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { passkey } from "@better-auth/passkey";
import { Link, toast, useConfig, useTranslation } from "@payloadcms/ui";
import { createAuthClient } from "better-auth/client";
import { twoFactorClient, usernameClient } from "better-auth/client/plugins";
import { useRouter } from "next/navigation";
import { formatAdminURL, getLoginOptions } from "payload/shared";
import React, { useMemo, useState } from "react";
import { adminRoutes } from "../../../constants";
import { AdminSocialProviderButtons } from "../../components/social-provider-buttons";
import { getSafeRedirect } from "../../utils/get-safe-redirect";
import { useAppForm } from "../../../../../shared/form";
import { Form, FormError, FormInputWrap } from "../../../../../shared/form/ui";
import { FormHeader } from "../../../../../shared/form/ui/header";
import { createLoginSchema, isValidEmail } from "../../../../../shared/form/validation";
import { valueOrDefaultString } from "../../../../../shared/utils/value-or-default";
const baseClass = 'login__form';
const LoginForm = ({ hasUsernamePlugin, hasPasskeyPlugin, prefillEmail, prefillPassword, prefillUsername, searchParams, loginWithUsername, baseURL, basePath })=>{
    const { config } = useConfig();
    const router = useRouter();
    const adminRoute = valueOrDefaultString(config?.routes?.admin, '/admin');
    const { t } = useTranslation();
    const { canLoginWithEmail, canLoginWithUsername } = getLoginOptions(loginWithUsername);
    const searchParamError = searchParams?.error;
    const redirectUrl = getSafeRedirect(searchParams?.redirect, adminRoute);
    const forgotPasswordUrl = formatAdminURL({
        adminRoute: adminRoute,
        path: adminRoutes?.forgotPassword
    });
    const authClient = useMemo(()=>createAuthClient({
            baseURL,
            basePath,
            plugins: [
                usernameClient(),
                twoFactorClient({
                    onTwoFactorRedirect () {
                        router.push(`${adminRoute}${adminRoutes.twoFactorVerify}?redirect=${redirectUrl}`);
                    }
                }),
                ...hasPasskeyPlugin ? [
                    passkey()
                ] : []
            ]
        }), [
        adminRoute,
        basePath,
        baseURL,
        hasPasskeyPlugin,
        router,
        redirectUrl
    ]);
    const loginType = useMemo(()=>{
        if (canLoginWithEmail && canLoginWithUsername && hasUsernamePlugin) return 'emailOrUsername';
        if (canLoginWithUsername && hasUsernamePlugin) return 'username';
        return 'email';
    }, [
        canLoginWithEmail,
        canLoginWithUsername,
        hasUsernamePlugin
    ]);
    const loginSchema = createLoginSchema({
        t,
        loginType,
        canLoginWithUsername
    });
    const form = useAppForm({
        defaultValues: {
            login: prefillEmail ?? prefillUsername ?? '',
            password: prefillPassword ?? ''
        },
        onSubmit: async ({ value })=>{
            const { login, password } = value;
            const isEmail = isValidEmail(login);
            try {
                const { data, error } = await (loginType === 'email' || loginType === 'emailOrUsername' && isEmail ? authClient.signIn.email({
                    email: login,
                    password,
                    callbackURL: redirectUrl
                }) : authClient.signIn.username({
                    username: login,
                    password
                }));
                if (error) {
                    if (error.code === 'EMAIL_NOT_VERIFIED') {
                        setRequireEmailVerification(true);
                    }
                    if (error.message) {
                        toast.error(error.message.charAt(0).toUpperCase() + error.message.slice(1));
                    }
                }
                if (data?.token) {
                    toast.success(t('general:success'));
                    window.location.href = redirectUrl;
                }
            } catch (err) {
                toast.error(t('error:unknown') || 'An unexpected error occurred');
            }
        },
        validators: {
            onSubmit: loginSchema
        }
    });
    const [requireEmailVerification, setRequireEmailVerification] = useState(false);
    if (requireEmailVerification) {
        return /*#__PURE__*/ _jsx(FormHeader, {
            heading: "Please verify your email",
            description: t('authentication:emailSent'),
            style: {
                textAlign: 'center'
            }
        });
    }
    const getLoginTypeLabel = ()=>{
        const labels = {
            email: t('general:email') || 'Email',
            username: t('authentication:username') || 'Username',
            emailOrUsername: t('authentication:emailOrUsername') || 'Email or Username'
        };
        return labels[loginType];
    };
    return /*#__PURE__*/ _jsxs("div", {
        className: `${baseClass}__wrapper`,
        children: [
            searchParamError && searchParamError === 'signup_disabled' && /*#__PURE__*/ _jsx(FormError, {
                errors: [
                    'Sign up is disabled.'
                ]
            }),
            /*#__PURE__*/ _jsxs(Form, {
                className: baseClass,
                onSubmit: (e)=>{
                    e.preventDefault();
                    void form.handleSubmit();
                },
                children: [
                    /*#__PURE__*/ _jsxs(FormInputWrap, {
                        className: baseClass,
                        children: [
                            /*#__PURE__*/ _jsx(form.AppField, {
                                name: "login",
                                children: (field)=>/*#__PURE__*/ _jsx(field.TextField, {
                                        type: "text",
                                        className: "email",
                                        autoComplete: `email${hasPasskeyPlugin ? ' webauthn' : ''}`,
                                        label: getLoginTypeLabel()
                                    })
                            }),
                            /*#__PURE__*/ _jsx(form.AppField, {
                                name: "password",
                                children: (field)=>/*#__PURE__*/ _jsx(field.TextField, {
                                        type: "password",
                                        className: "password",
                                        autoComplete: `password${hasPasskeyPlugin ? ' webauthn' : ''}`,
                                        label: t('general:password')
                                    })
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsx(Link, {
                        href: forgotPasswordUrl,
                        prefetch: false,
                        children: t('authentication:forgotPasswordQuestion')
                    }),
                    /*#__PURE__*/ _jsx("button", {
                        type: "submit",
                        style: {
                            display: 'none'
                        },
                        tabIndex: -1
                    }),
                    /*#__PURE__*/ _jsx(form.AppForm, {
                        children: /*#__PURE__*/ _jsx(form.Submit, {
                            label: t('authentication:login'),
                            loadingLabel: t('general:loading')
                        })
                    })
                ]
            })
        ]
    });
};
export const AdminLoginClient = ({ loginMethods, hasUsernamePlugin, hasPasskeyPlugin, prefillEmail, prefillPassword, prefillUsername, searchParams, loginWithUsername, baseURL, basePath })=>{
    return /*#__PURE__*/ _jsxs(_Fragment, {
        children: [
            loginMethods.includes('emailPassword') && /*#__PURE__*/ _jsx(LoginForm, {
                hasUsernamePlugin: hasUsernamePlugin,
                hasPasskeyPlugin: hasPasskeyPlugin,
                prefillEmail: prefillEmail,
                prefillPassword: prefillPassword,
                prefillUsername: prefillUsername,
                searchParams: searchParams,
                loginWithUsername: loginWithUsername,
                baseURL: baseURL,
                basePath: basePath
            }),
            /*#__PURE__*/ _jsx(AdminSocialProviderButtons, {
                isSignup: false,
                loginMethods: loginMethods,
                setLoading: ()=>{},
                redirectUrl: getSafeRedirect(searchParams?.redirect, useConfig().config.routes.admin),
                baseURL: baseURL,
                basePath: basePath
            })
        ]
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC92aWV3cy9hZG1pbi1sb2dpbi9jbGllbnQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50J1xuXG5pbXBvcnQgeyBwYXNza2V5IH0gZnJvbSBcIkBiZXR0ZXItYXV0aC9wYXNza2V5XCJcbmltcG9ydCB7IExpbmssIHRvYXN0LCB1c2VDb25maWcsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnQHBheWxvYWRjbXMvdWknXG5pbXBvcnQgeyBjcmVhdGVBdXRoQ2xpZW50IH0gZnJvbSAnYmV0dGVyLWF1dGgvY2xpZW50J1xuaW1wb3J0IHsgdHdvRmFjdG9yQ2xpZW50LCB1c2VybmFtZUNsaWVudCB9IGZyb20gJ2JldHRlci1hdXRoL2NsaWVudC9wbHVnaW5zJ1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9uYXZpZ2F0aW9uJ1xuaW1wb3J0IHR5cGUgeyBMb2dpbldpdGhVc2VybmFtZU9wdGlvbnMgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHsgZm9ybWF0QWRtaW5VUkwsIGdldExvZ2luT3B0aW9ucyB9IGZyb20gJ3BheWxvYWQvc2hhcmVkJ1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBhZG1pblJvdXRlcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2NvbnN0YW50cydcbmltcG9ydCB7IEFkbWluU29jaWFsUHJvdmlkZXJCdXR0b25zIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC9jb21wb25lbnRzL3NvY2lhbC1wcm92aWRlci1idXR0b25zJ1xuaW1wb3J0IHsgZ2V0U2FmZVJlZGlyZWN0IH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC91dGlscy9nZXQtc2FmZS1yZWRpcmVjdCdcbmltcG9ydCB0eXBlIHsgTG9naW5NZXRob2QgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi90eXBlcydcbmltcG9ydCB7IHVzZUFwcEZvcm0gfSBmcm9tICdAL3NoYXJlZC9mb3JtJ1xuaW1wb3J0IHsgRm9ybSwgRm9ybUVycm9yLCBGb3JtSW5wdXRXcmFwIH0gZnJvbSAnQC9zaGFyZWQvZm9ybS91aSdcbmltcG9ydCB7IEZvcm1IZWFkZXIgfSBmcm9tICdAL3NoYXJlZC9mb3JtL3VpL2hlYWRlcidcbmltcG9ydCB7IGNyZWF0ZUxvZ2luU2NoZW1hLCBpc1ZhbGlkRW1haWwgfSBmcm9tICdAL3NoYXJlZC9mb3JtL3ZhbGlkYXRpb24nXG5pbXBvcnQgeyB2YWx1ZU9yRGVmYXVsdFN0cmluZyB9IGZyb20gJ0Avc2hhcmVkL3V0aWxzL3ZhbHVlLW9yLWRlZmF1bHQnXG5cbnR5cGUgQWRtaW5Mb2dpbkNsaWVudFByb3BzID0ge1xuICBsb2dpbk1ldGhvZHM6IExvZ2luTWV0aG9kW11cbiAgaGFzVXNlcm5hbWVQbHVnaW46IGJvb2xlYW5cbiAgaGFzUGFzc2tleVBsdWdpbjogYm9vbGVhblxuICBwcmVmaWxsRW1haWw/OiBzdHJpbmdcbiAgcHJlZmlsbFBhc3N3b3JkPzogc3RyaW5nXG4gIHByZWZpbGxVc2VybmFtZT86IHN0cmluZ1xuICBzZWFyY2hQYXJhbXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgfVxuICBsb2dpbldpdGhVc2VybmFtZTogZmFsc2UgfCBMb2dpbldpdGhVc2VybmFtZU9wdGlvbnNcbiAgYmFzZVVSTD86IHN0cmluZ1xuICBiYXNlUGF0aD86IHN0cmluZ1xufVxuXG5jb25zdCBiYXNlQ2xhc3MgPSAnbG9naW5fX2Zvcm0nXG5cbmNvbnN0IExvZ2luRm9ybTogUmVhY3QuRkM8e1xuICBoYXNVc2VybmFtZVBsdWdpbjogYm9vbGVhblxuICBoYXNQYXNza2V5UGx1Z2luOiBib29sZWFuXG4gIHByZWZpbGxFbWFpbD86IHN0cmluZ1xuICBwcmVmaWxsUGFzc3dvcmQ/OiBzdHJpbmdcbiAgcHJlZmlsbFVzZXJuYW1lPzogc3RyaW5nXG4gIHNlYXJjaFBhcmFtczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCB9XG4gIGxvZ2luV2l0aFVzZXJuYW1lOiBmYWxzZSB8IExvZ2luV2l0aFVzZXJuYW1lT3B0aW9uc1xuICBiYXNlVVJMPzogc3RyaW5nXG4gIGJhc2VQYXRoPzogc3RyaW5nXG59PiA9ICh7XG4gIGhhc1VzZXJuYW1lUGx1Z2luLFxuICBoYXNQYXNza2V5UGx1Z2luLFxuICBwcmVmaWxsRW1haWwsXG4gIHByZWZpbGxQYXNzd29yZCxcbiAgcHJlZmlsbFVzZXJuYW1lLFxuICBzZWFyY2hQYXJhbXMsXG4gIGxvZ2luV2l0aFVzZXJuYW1lLFxuICBiYXNlVVJMLFxuICBiYXNlUGF0aFxufSkgPT4ge1xuICAgIGNvbnN0IHsgY29uZmlnIH0gPSB1c2VDb25maWcoKVxuICAgIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpXG4gICAgY29uc3QgYWRtaW5Sb3V0ZSA9IHZhbHVlT3JEZWZhdWx0U3RyaW5nKGNvbmZpZz8ucm91dGVzPy5hZG1pbiwgJy9hZG1pbicpXG4gICAgY29uc3QgeyB0IH0gPSB1c2VUcmFuc2xhdGlvbigpXG4gICAgY29uc3QgeyBjYW5Mb2dpbldpdGhFbWFpbCwgY2FuTG9naW5XaXRoVXNlcm5hbWUgfSA9IGdldExvZ2luT3B0aW9ucyhsb2dpbldpdGhVc2VybmFtZSlcbiAgICBjb25zdCBzZWFyY2hQYXJhbUVycm9yID0gc2VhcmNoUGFyYW1zPy5lcnJvclxuICAgIGNvbnN0IHJlZGlyZWN0VXJsID0gZ2V0U2FmZVJlZGlyZWN0KHNlYXJjaFBhcmFtcz8ucmVkaXJlY3QgYXMgc3RyaW5nLCBhZG1pblJvdXRlKVxuICAgIGNvbnN0IGZvcmdvdFBhc3N3b3JkVXJsID0gZm9ybWF0QWRtaW5VUkwoe1xuICAgICAgYWRtaW5Sb3V0ZTogYWRtaW5Sb3V0ZSxcbiAgICAgIHBhdGg6IGFkbWluUm91dGVzPy5mb3Jnb3RQYXNzd29yZCBhcyBgLyR7c3RyaW5nfWBcbiAgICB9KVxuICAgIGNvbnN0IGF1dGhDbGllbnQgPSB1c2VNZW1vKFxuICAgICAgKCkgPT5cbiAgICAgICAgY3JlYXRlQXV0aENsaWVudCh7XG4gICAgICAgICAgYmFzZVVSTCxcbiAgICAgICAgICBiYXNlUGF0aCxcbiAgICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgICB1c2VybmFtZUNsaWVudCgpLFxuICAgICAgICAgICAgdHdvRmFjdG9yQ2xpZW50KHtcbiAgICAgICAgICAgICAgb25Ud29GYWN0b3JSZWRpcmVjdCgpIHtcbiAgICAgICAgICAgICAgICByb3V0ZXIucHVzaChgJHthZG1pblJvdXRlfSR7YWRtaW5Sb3V0ZXMudHdvRmFjdG9yVmVyaWZ5fT9yZWRpcmVjdD0ke3JlZGlyZWN0VXJsfWApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgLi4uKGhhc1Bhc3NrZXlQbHVnaW4gPyBbcGFzc2tleSgpXSA6IFtdKVxuICAgICAgICAgIF1cbiAgICAgICAgfSksXG4gICAgICBbYWRtaW5Sb3V0ZSwgYmFzZVBhdGgsIGJhc2VVUkwsIGhhc1Bhc3NrZXlQbHVnaW4sIHJvdXRlciwgcmVkaXJlY3RVcmxdXG4gICAgKVxuICAgIGNvbnN0IGxvZ2luVHlwZSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgaWYgKGNhbkxvZ2luV2l0aEVtYWlsICYmIGNhbkxvZ2luV2l0aFVzZXJuYW1lICYmIGhhc1VzZXJuYW1lUGx1Z2luKSByZXR1cm4gJ2VtYWlsT3JVc2VybmFtZSdcbiAgICAgIGlmIChjYW5Mb2dpbldpdGhVc2VybmFtZSAmJiBoYXNVc2VybmFtZVBsdWdpbikgcmV0dXJuICd1c2VybmFtZSdcbiAgICAgIHJldHVybiAnZW1haWwnXG4gICAgfSwgW2NhbkxvZ2luV2l0aEVtYWlsLCBjYW5Mb2dpbldpdGhVc2VybmFtZSwgaGFzVXNlcm5hbWVQbHVnaW5dKVxuXG4gICAgY29uc3QgbG9naW5TY2hlbWEgPSBjcmVhdGVMb2dpblNjaGVtYSh7IHQsIGxvZ2luVHlwZSwgY2FuTG9naW5XaXRoVXNlcm5hbWUgfSlcblxuICAgIGNvbnN0IGZvcm0gPSB1c2VBcHBGb3JtKHtcbiAgICAgIGRlZmF1bHRWYWx1ZXM6IHtcbiAgICAgICAgbG9naW46IHByZWZpbGxFbWFpbCA/PyBwcmVmaWxsVXNlcm5hbWUgPz8gJycsXG4gICAgICAgIHBhc3N3b3JkOiBwcmVmaWxsUGFzc3dvcmQgPz8gJydcbiAgICAgIH0sXG4gICAgICBvblN1Ym1pdDogYXN5bmMgKHsgdmFsdWUgfSkgPT4ge1xuICAgICAgICBjb25zdCB7IGxvZ2luLCBwYXNzd29yZCB9ID0gdmFsdWVcbiAgICAgICAgY29uc3QgaXNFbWFpbCA9IGlzVmFsaWRFbWFpbChsb2dpbilcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCAobG9naW5UeXBlID09PSAnZW1haWwnIHx8IChsb2dpblR5cGUgPT09ICdlbWFpbE9yVXNlcm5hbWUnICYmIGlzRW1haWwpXG4gICAgICAgICAgICA/IGF1dGhDbGllbnQuc2lnbkluLmVtYWlsKHsgZW1haWw6IGxvZ2luLCBwYXNzd29yZCwgY2FsbGJhY2tVUkw6IHJlZGlyZWN0VXJsIH0pXG4gICAgICAgICAgICA6IGF1dGhDbGllbnQuc2lnbkluLnVzZXJuYW1lKHsgdXNlcm5hbWU6IGxvZ2luLCBwYXNzd29yZCB9KSlcbiAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGlmIChlcnJvci5jb2RlID09PSAnRU1BSUxfTk9UX1ZFUklGSUVEJykge1xuICAgICAgICAgICAgICBzZXRSZXF1aXJlRW1haWxWZXJpZmljYXRpb24odHJ1ZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlKSB7XG4gICAgICAgICAgICAgIHRvYXN0LmVycm9yKGVycm9yLm1lc3NhZ2UuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBlcnJvci5tZXNzYWdlLnNsaWNlKDEpKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZGF0YT8udG9rZW4pIHtcbiAgICAgICAgICAgIHRvYXN0LnN1Y2Nlc3ModCgnZ2VuZXJhbDpzdWNjZXNzJykpXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHJlZGlyZWN0VXJsXG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICB0b2FzdC5lcnJvcih0KCdlcnJvcjp1bmtub3duJykgfHwgJ0FuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWQnKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdmFsaWRhdG9yczoge1xuICAgICAgICBvblN1Ym1pdDogbG9naW5TY2hlbWFcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgY29uc3QgW3JlcXVpcmVFbWFpbFZlcmlmaWNhdGlvbiwgc2V0UmVxdWlyZUVtYWlsVmVyaWZpY2F0aW9uXSA9IHVzZVN0YXRlPGJvb2xlYW4+KGZhbHNlKVxuXG4gICAgaWYgKHJlcXVpcmVFbWFpbFZlcmlmaWNhdGlvbikge1xuICAgICAgcmV0dXJuIDxGb3JtSGVhZGVyIGhlYWRpbmc9XCJQbGVhc2UgdmVyaWZ5IHlvdXIgZW1haWxcIiBkZXNjcmlwdGlvbj17dCgnYXV0aGVudGljYXRpb246ZW1haWxTZW50Jyl9IHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicgfX0gLz5cbiAgICB9XG5cbiAgICBjb25zdCBnZXRMb2dpblR5cGVMYWJlbCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGxhYmVscyA9IHtcbiAgICAgICAgZW1haWw6IHQoJ2dlbmVyYWw6ZW1haWwnKSB8fCAnRW1haWwnLFxuICAgICAgICB1c2VybmFtZTogdCgnYXV0aGVudGljYXRpb246dXNlcm5hbWUnKSB8fCAnVXNlcm5hbWUnLFxuICAgICAgICBlbWFpbE9yVXNlcm5hbWU6IHQoJ2F1dGhlbnRpY2F0aW9uOmVtYWlsT3JVc2VybmFtZScpIHx8ICdFbWFpbCBvciBVc2VybmFtZSdcbiAgICAgIH1cbiAgICAgIHJldHVybiBsYWJlbHNbbG9naW5UeXBlXVxuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7YmFzZUNsYXNzfV9fd3JhcHBlcmB9PlxuICAgICAgICB7c2VhcmNoUGFyYW1FcnJvciAmJiBzZWFyY2hQYXJhbUVycm9yID09PSAnc2lnbnVwX2Rpc2FibGVkJyAmJiA8Rm9ybUVycm9yIGVycm9ycz17WydTaWduIHVwIGlzIGRpc2FibGVkLiddfSAvPn1cbiAgICAgICAgPEZvcm1cbiAgICAgICAgICBjbGFzc05hbWU9e2Jhc2VDbGFzc31cbiAgICAgICAgICBvblN1Ym1pdD17KGUpID0+IHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgdm9pZCBmb3JtLmhhbmRsZVN1Ym1pdCgpXG4gICAgICAgICAgfX0+XG4gICAgICAgICAgPEZvcm1JbnB1dFdyYXAgY2xhc3NOYW1lPXtiYXNlQ2xhc3N9PlxuICAgICAgICAgICAgPGZvcm0uQXBwRmllbGRcbiAgICAgICAgICAgICAgbmFtZT1cImxvZ2luXCJcbiAgICAgICAgICAgICAgY2hpbGRyZW49eyhmaWVsZCkgPT4gKFxuICAgICAgICAgICAgICAgIDxmaWVsZC5UZXh0RmllbGRcbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImVtYWlsXCJcbiAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT17YGVtYWlsJHtoYXNQYXNza2V5UGx1Z2luID8gJyB3ZWJhdXRobicgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgbGFiZWw9e2dldExvZ2luVHlwZUxhYmVsKCl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Zm9ybS5BcHBGaWVsZFxuICAgICAgICAgICAgICBuYW1lPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICBjaGlsZHJlbj17KGZpZWxkKSA9PiAoXG4gICAgICAgICAgICAgICAgPGZpZWxkLlRleHRGaWVsZFxuICAgICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT17YHBhc3N3b3JkJHtoYXNQYXNza2V5UGx1Z2luID8gJyB3ZWJhdXRobicgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgbGFiZWw9e3QoJ2dlbmVyYWw6cGFzc3dvcmQnKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L0Zvcm1JbnB1dFdyYXA+XG4gICAgICAgICAgPExpbmsgaHJlZj17Zm9yZ290UGFzc3dvcmRVcmx9IHByZWZldGNoPXtmYWxzZX0+XG4gICAgICAgICAgICB7dCgnYXV0aGVudGljYXRpb246Zm9yZ290UGFzc3dvcmRRdWVzdGlvbicpfVxuICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBzdHlsZT17eyBkaXNwbGF5OiAnbm9uZScgfX0gdGFiSW5kZXg9ey0xfSAvPlxuICAgICAgICAgIDxmb3JtLkFwcEZvcm0gY2hpbGRyZW49ezxmb3JtLlN1Ym1pdCBsYWJlbD17dCgnYXV0aGVudGljYXRpb246bG9naW4nKX0gbG9hZGluZ0xhYmVsPXt0KCdnZW5lcmFsOmxvYWRpbmcnKX0gLz59IC8+XG4gICAgICAgIDwvRm9ybT5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG5leHBvcnQgY29uc3QgQWRtaW5Mb2dpbkNsaWVudDogUmVhY3QuRkM8QWRtaW5Mb2dpbkNsaWVudFByb3BzPiA9ICh7XG4gIGxvZ2luTWV0aG9kcyxcbiAgaGFzVXNlcm5hbWVQbHVnaW4sXG4gIGhhc1Bhc3NrZXlQbHVnaW4sXG4gIHByZWZpbGxFbWFpbCxcbiAgcHJlZmlsbFBhc3N3b3JkLFxuICBwcmVmaWxsVXNlcm5hbWUsXG4gIHNlYXJjaFBhcmFtcyxcbiAgbG9naW5XaXRoVXNlcm5hbWUsXG4gIGJhc2VVUkwsXG4gIGJhc2VQYXRoXG59KSA9PiB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtsb2dpbk1ldGhvZHMuaW5jbHVkZXMoJ2VtYWlsUGFzc3dvcmQnKSAmJiAoXG4gICAgICAgIDxMb2dpbkZvcm1cbiAgICAgICAgICBoYXNVc2VybmFtZVBsdWdpbj17aGFzVXNlcm5hbWVQbHVnaW59XG4gICAgICAgICAgaGFzUGFzc2tleVBsdWdpbj17aGFzUGFzc2tleVBsdWdpbn1cbiAgICAgICAgICBwcmVmaWxsRW1haWw9e3ByZWZpbGxFbWFpbH1cbiAgICAgICAgICBwcmVmaWxsUGFzc3dvcmQ9e3ByZWZpbGxQYXNzd29yZH1cbiAgICAgICAgICBwcmVmaWxsVXNlcm5hbWU9e3ByZWZpbGxVc2VybmFtZX1cbiAgICAgICAgICBzZWFyY2hQYXJhbXM9e3NlYXJjaFBhcmFtc31cbiAgICAgICAgICBsb2dpbldpdGhVc2VybmFtZT17bG9naW5XaXRoVXNlcm5hbWV9XG4gICAgICAgICAgYmFzZVVSTD17YmFzZVVSTH1cbiAgICAgICAgICBiYXNlUGF0aD17YmFzZVBhdGh9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAgPEFkbWluU29jaWFsUHJvdmlkZXJCdXR0b25zXG4gICAgICAgIGlzU2lnbnVwPXtmYWxzZX1cbiAgICAgICAgbG9naW5NZXRob2RzPXtsb2dpbk1ldGhvZHN9XG4gICAgICAgIHNldExvYWRpbmc9eygpID0+IHsgfX1cbiAgICAgICAgcmVkaXJlY3RVcmw9e2dldFNhZmVSZWRpcmVjdChzZWFyY2hQYXJhbXM/LnJlZGlyZWN0IGFzIHN0cmluZywgdXNlQ29uZmlnKCkuY29uZmlnLnJvdXRlcy5hZG1pbil9XG4gICAgICAgIGJhc2VVUkw9e2Jhc2VVUkx9XG4gICAgICAgIGJhc2VQYXRoPXtiYXNlUGF0aH1cbiAgICAgIC8+XG4gICAgPC8+XG4gIClcbn1cbiJdLCJuYW1lcyI6WyJwYXNza2V5IiwiTGluayIsInRvYXN0IiwidXNlQ29uZmlnIiwidXNlVHJhbnNsYXRpb24iLCJjcmVhdGVBdXRoQ2xpZW50IiwidHdvRmFjdG9yQ2xpZW50IiwidXNlcm5hbWVDbGllbnQiLCJ1c2VSb3V0ZXIiLCJmb3JtYXRBZG1pblVSTCIsImdldExvZ2luT3B0aW9ucyIsIlJlYWN0IiwidXNlTWVtbyIsInVzZVN0YXRlIiwiYWRtaW5Sb3V0ZXMiLCJBZG1pblNvY2lhbFByb3ZpZGVyQnV0dG9ucyIsImdldFNhZmVSZWRpcmVjdCIsInVzZUFwcEZvcm0iLCJGb3JtIiwiRm9ybUVycm9yIiwiRm9ybUlucHV0V3JhcCIsIkZvcm1IZWFkZXIiLCJjcmVhdGVMb2dpblNjaGVtYSIsImlzVmFsaWRFbWFpbCIsInZhbHVlT3JEZWZhdWx0U3RyaW5nIiwiYmFzZUNsYXNzIiwiTG9naW5Gb3JtIiwiaGFzVXNlcm5hbWVQbHVnaW4iLCJoYXNQYXNza2V5UGx1Z2luIiwicHJlZmlsbEVtYWlsIiwicHJlZmlsbFBhc3N3b3JkIiwicHJlZmlsbFVzZXJuYW1lIiwic2VhcmNoUGFyYW1zIiwibG9naW5XaXRoVXNlcm5hbWUiLCJiYXNlVVJMIiwiYmFzZVBhdGgiLCJjb25maWciLCJyb3V0ZXIiLCJhZG1pblJvdXRlIiwicm91dGVzIiwiYWRtaW4iLCJ0IiwiY2FuTG9naW5XaXRoRW1haWwiLCJjYW5Mb2dpbldpdGhVc2VybmFtZSIsInNlYXJjaFBhcmFtRXJyb3IiLCJlcnJvciIsInJlZGlyZWN0VXJsIiwicmVkaXJlY3QiLCJmb3Jnb3RQYXNzd29yZFVybCIsInBhdGgiLCJmb3Jnb3RQYXNzd29yZCIsImF1dGhDbGllbnQiLCJwbHVnaW5zIiwib25Ud29GYWN0b3JSZWRpcmVjdCIsInB1c2giLCJ0d29GYWN0b3JWZXJpZnkiLCJsb2dpblR5cGUiLCJsb2dpblNjaGVtYSIsImZvcm0iLCJkZWZhdWx0VmFsdWVzIiwibG9naW4iLCJwYXNzd29yZCIsIm9uU3VibWl0IiwidmFsdWUiLCJpc0VtYWlsIiwiZGF0YSIsInNpZ25JbiIsImVtYWlsIiwiY2FsbGJhY2tVUkwiLCJ1c2VybmFtZSIsImNvZGUiLCJzZXRSZXF1aXJlRW1haWxWZXJpZmljYXRpb24iLCJtZXNzYWdlIiwiY2hhckF0IiwidG9VcHBlckNhc2UiLCJzbGljZSIsInRva2VuIiwic3VjY2VzcyIsIndpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiIsImVyciIsInZhbGlkYXRvcnMiLCJyZXF1aXJlRW1haWxWZXJpZmljYXRpb24iLCJoZWFkaW5nIiwiZGVzY3JpcHRpb24iLCJzdHlsZSIsInRleHRBbGlnbiIsImdldExvZ2luVHlwZUxhYmVsIiwibGFiZWxzIiwiZW1haWxPclVzZXJuYW1lIiwiZGl2IiwiY2xhc3NOYW1lIiwiZXJyb3JzIiwiZSIsInByZXZlbnREZWZhdWx0IiwiaGFuZGxlU3VibWl0IiwiQXBwRmllbGQiLCJuYW1lIiwiY2hpbGRyZW4iLCJmaWVsZCIsIlRleHRGaWVsZCIsInR5cGUiLCJhdXRvQ29tcGxldGUiLCJsYWJlbCIsInByZWZldGNoIiwiYnV0dG9uIiwiZGlzcGxheSIsInRhYkluZGV4IiwiQXBwRm9ybSIsIlN1Ym1pdCIsImxvYWRpbmdMYWJlbCIsIkFkbWluTG9naW5DbGllbnQiLCJsb2dpbk1ldGhvZHMiLCJpbmNsdWRlcyIsImlzU2lnbnVwIiwic2V0TG9hZGluZyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsU0FBU0EsT0FBTyxRQUFRLHVCQUFzQjtBQUM5QyxTQUFTQyxJQUFJLEVBQUVDLEtBQUssRUFBRUMsU0FBUyxFQUFFQyxjQUFjLFFBQVEsaUJBQWdCO0FBQ3ZFLFNBQVNDLGdCQUFnQixRQUFRLHFCQUFvQjtBQUNyRCxTQUFTQyxlQUFlLEVBQUVDLGNBQWMsUUFBUSw2QkFBNEI7QUFDNUUsU0FBU0MsU0FBUyxRQUFRLGtCQUFpQjtBQUUzQyxTQUFTQyxjQUFjLEVBQUVDLGVBQWUsUUFBUSxpQkFBZ0I7QUFDaEUsT0FBT0MsU0FBU0MsT0FBTyxFQUFFQyxRQUFRLFFBQVEs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