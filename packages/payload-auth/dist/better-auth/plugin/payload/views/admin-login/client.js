'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { AdminSocialProviderButtons } from "../../components/social-provider-buttons";
import { getSafeRedirect } from "../../utils/get-safe-redirect";
import { useConfig, Link, toast, useTranslation } from "@payloadcms/ui";
import React, { useMemo, useState } from "react";
import { adminRoutes } from "../../../constants";
import { useAppForm } from "../../../../../shared/form";
import { Form, FormError, FormInputWrap } from "../../../../../shared/form/ui";
import { FormHeader } from "../../../../../shared/form/ui/header";
import { createLoginSchema, isValidEmail } from "../../../../../shared/form/validation";
import { createAuthClient } from "better-auth/client";
import { usernameClient, twoFactorClient, passkeyClient } from "better-auth/client/plugins";
import { formatAdminURL, getLoginOptions } from "payload/shared";
import { useRouter } from "next/navigation";
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
                    passkeyClient()
                ] : []
            ]
        }), []);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC92aWV3cy9hZG1pbi1sb2dpbi9jbGllbnQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50J1xuXG5pbXBvcnQgeyBBZG1pblNvY2lhbFByb3ZpZGVyQnV0dG9ucyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3BheWxvYWQvY29tcG9uZW50cy9zb2NpYWwtcHJvdmlkZXItYnV0dG9ucydcbmltcG9ydCB7IGdldFNhZmVSZWRpcmVjdCB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3BheWxvYWQvdXRpbHMvZ2V0LXNhZmUtcmVkaXJlY3QnXG5pbXBvcnQgeyB1c2VDb25maWcsIExpbmssIHRvYXN0LCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ0BwYXlsb2FkY21zL3VpJ1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IExvZ2luTWV0aG9kIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vdHlwZXMnXG5pbXBvcnQgdHlwZSB7IExvZ2luV2l0aFVzZXJuYW1lT3B0aW9ucyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBhZG1pblJvdXRlcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2NvbnN0YW50cydcbmltcG9ydCB7IHVzZUFwcEZvcm0gfSBmcm9tICdAL3NoYXJlZC9mb3JtJ1xuaW1wb3J0IHsgRm9ybSwgRm9ybUVycm9yLCBGb3JtSW5wdXRXcmFwIH0gZnJvbSAnQC9zaGFyZWQvZm9ybS91aSdcbmltcG9ydCB7IEZvcm1IZWFkZXIgfSBmcm9tICdAL3NoYXJlZC9mb3JtL3VpL2hlYWRlcidcbmltcG9ydCB7IGNyZWF0ZUxvZ2luU2NoZW1hLCBpc1ZhbGlkRW1haWwgfSBmcm9tICdAL3NoYXJlZC9mb3JtL3ZhbGlkYXRpb24nXG5pbXBvcnQgeyBjcmVhdGVBdXRoQ2xpZW50IH0gZnJvbSAnYmV0dGVyLWF1dGgvY2xpZW50J1xuaW1wb3J0IHsgdXNlcm5hbWVDbGllbnQsIHR3b0ZhY3RvckNsaWVudCwgcGFzc2tleUNsaWVudCB9IGZyb20gJ2JldHRlci1hdXRoL2NsaWVudC9wbHVnaW5zJ1xuaW1wb3J0IHsgZm9ybWF0QWRtaW5VUkwsIGdldExvZ2luT3B0aW9ucyB9IGZyb20gJ3BheWxvYWQvc2hhcmVkJ1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9uYXZpZ2F0aW9uJ1xuaW1wb3J0IHsgdmFsdWVPckRlZmF1bHRTdHJpbmcgfSBmcm9tICdAL3NoYXJlZC91dGlscy92YWx1ZS1vci1kZWZhdWx0J1xuXG50eXBlIEFkbWluTG9naW5DbGllbnRQcm9wcyA9IHtcbiAgbG9naW5NZXRob2RzOiBMb2dpbk1ldGhvZFtdXG4gIGhhc1VzZXJuYW1lUGx1Z2luOiBib29sZWFuXG4gIGhhc1Bhc3NrZXlQbHVnaW46IGJvb2xlYW5cbiAgcHJlZmlsbEVtYWlsPzogc3RyaW5nXG4gIHByZWZpbGxQYXNzd29yZD86IHN0cmluZ1xuICBwcmVmaWxsVXNlcm5hbWU/OiBzdHJpbmdcbiAgc2VhcmNoUGFyYW1zOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkIH1cbiAgbG9naW5XaXRoVXNlcm5hbWU6IGZhbHNlIHwgTG9naW5XaXRoVXNlcm5hbWVPcHRpb25zXG4gIGJhc2VVUkw/OiBzdHJpbmdcbiAgYmFzZVBhdGg/OiBzdHJpbmdcbn1cblxuY29uc3QgYmFzZUNsYXNzID0gJ2xvZ2luX19mb3JtJ1xuXG5jb25zdCBMb2dpbkZvcm06IFJlYWN0LkZDPHtcbiAgaGFzVXNlcm5hbWVQbHVnaW46IGJvb2xlYW5cbiAgaGFzUGFzc2tleVBsdWdpbjogYm9vbGVhblxuICBwcmVmaWxsRW1haWw/OiBzdHJpbmdcbiAgcHJlZmlsbFBhc3N3b3JkPzogc3RyaW5nXG4gIHByZWZpbGxVc2VybmFtZT86IHN0cmluZ1xuICBzZWFyY2hQYXJhbXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgfVxuICBsb2dpbldpdGhVc2VybmFtZTogZmFsc2UgfCBMb2dpbldpdGhVc2VybmFtZU9wdGlvbnNcbiAgYmFzZVVSTD86IHN0cmluZ1xuICBiYXNlUGF0aD86IHN0cmluZ1xufT4gPSAoe1xuICBoYXNVc2VybmFtZVBsdWdpbixcbiAgaGFzUGFzc2tleVBsdWdpbixcbiAgcHJlZmlsbEVtYWlsLFxuICBwcmVmaWxsUGFzc3dvcmQsXG4gIHByZWZpbGxVc2VybmFtZSxcbiAgc2VhcmNoUGFyYW1zLFxuICBsb2dpbldpdGhVc2VybmFtZSxcbiAgYmFzZVVSTCxcbiAgYmFzZVBhdGhcbn0pID0+IHtcbiAgY29uc3QgeyBjb25maWcgfSA9IHVzZUNvbmZpZygpXG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpXG4gIGNvbnN0IGFkbWluUm91dGUgPSB2YWx1ZU9yRGVmYXVsdFN0cmluZyhjb25maWc/LnJvdXRlcz8uYWRtaW4sICcvYWRtaW4nKVxuICBjb25zdCB7IHQgfSA9IHVzZVRyYW5zbGF0aW9uKClcbiAgY29uc3QgeyBjYW5Mb2dpbldpdGhFbWFpbCwgY2FuTG9naW5XaXRoVXNlcm5hbWUgfSA9IGdldExvZ2luT3B0aW9ucyhsb2dpbldpdGhVc2VybmFtZSlcbiAgY29uc3Qgc2VhcmNoUGFyYW1FcnJvciA9IHNlYXJjaFBhcmFtcz8uZXJyb3JcbiAgY29uc3QgcmVkaXJlY3RVcmwgPSBnZXRTYWZlUmVkaXJlY3Qoc2VhcmNoUGFyYW1zPy5yZWRpcmVjdCBhcyBzdHJpbmcsIGFkbWluUm91dGUpXG4gIGNvbnN0IGZvcmdvdFBhc3N3b3JkVXJsID0gZm9ybWF0QWRtaW5VUkwoe1xuICAgIGFkbWluUm91dGU6IGFkbWluUm91dGUsXG4gICAgcGF0aDogYWRtaW5Sb3V0ZXM/LmZvcmdvdFBhc3N3b3JkIGFzIGAvJHtzdHJpbmd9YFxuICB9KVxuICBjb25zdCBhdXRoQ2xpZW50ID0gdXNlTWVtbyhcbiAgICAoKSA9PlxuICAgICAgY3JlYXRlQXV0aENsaWVudCh7XG4gICAgICAgIGJhc2VVUkwsXG4gICAgICAgIGJhc2VQYXRoLFxuICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgdXNlcm5hbWVDbGllbnQoKSxcbiAgICAgICAgICB0d29GYWN0b3JDbGllbnQoe1xuICAgICAgICAgICAgb25Ud29GYWN0b3JSZWRpcmVjdCgpIHtcbiAgICAgICAgICAgICAgcm91dGVyLnB1c2goYCR7YWRtaW5Sb3V0ZX0ke2FkbWluUm91dGVzLnR3b0ZhY3RvclZlcmlmeX0/cmVkaXJlY3Q9JHtyZWRpcmVjdFVybH1gKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIC4uLihoYXNQYXNza2V5UGx1Z2luID8gW3Bhc3NrZXlDbGllbnQoKV0gOiBbXSlcbiAgICAgICAgXVxuICAgICAgfSksXG4gICAgW11cbiAgKVxuICBjb25zdCBsb2dpblR5cGUgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBpZiAoY2FuTG9naW5XaXRoRW1haWwgJiYgY2FuTG9naW5XaXRoVXNlcm5hbWUgJiYgaGFzVXNlcm5hbWVQbHVnaW4pIHJldHVybiAnZW1haWxPclVzZXJuYW1lJ1xuICAgIGlmIChjYW5Mb2dpbldpdGhVc2VybmFtZSAmJiBoYXNVc2VybmFtZVBsdWdpbikgcmV0dXJuICd1c2VybmFtZSdcbiAgICByZXR1cm4gJ2VtYWlsJ1xuICB9LCBbY2FuTG9naW5XaXRoRW1haWwsIGNhbkxvZ2luV2l0aFVzZXJuYW1lLCBoYXNVc2VybmFtZVBsdWdpbl0pXG5cbiAgY29uc3QgbG9naW5TY2hlbWEgPSBjcmVhdGVMb2dpblNjaGVtYSh7IHQsIGxvZ2luVHlwZSwgY2FuTG9naW5XaXRoVXNlcm5hbWUgfSlcblxuICBjb25zdCBmb3JtID0gdXNlQXBwRm9ybSh7XG4gICAgZGVmYXVsdFZhbHVlczoge1xuICAgICAgbG9naW46IHByZWZpbGxFbWFpbCA/PyBwcmVmaWxsVXNlcm5hbWUgPz8gJycsXG4gICAgICBwYXNzd29yZDogcHJlZmlsbFBhc3N3b3JkID8/ICcnXG4gICAgfSxcbiAgICBvblN1Ym1pdDogYXN5bmMgKHsgdmFsdWUgfSkgPT4ge1xuICAgICAgY29uc3QgeyBsb2dpbiwgcGFzc3dvcmQgfSA9IHZhbHVlXG4gICAgICBjb25zdCBpc0VtYWlsID0gaXNWYWxpZEVtYWlsKGxvZ2luKVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgKGxvZ2luVHlwZSA9PT0gJ2VtYWlsJyB8fCAobG9naW5UeXBlID09PSAnZW1haWxPclVzZXJuYW1lJyAmJiBpc0VtYWlsKVxuICAgICAgICAgID8gYXV0aENsaWVudC5zaWduSW4uZW1haWwoeyBlbWFpbDogbG9naW4sIHBhc3N3b3JkLCBjYWxsYmFja1VSTDogcmVkaXJlY3RVcmwgfSlcbiAgICAgICAgICA6IGF1dGhDbGllbnQuc2lnbkluLnVzZXJuYW1lKHsgdXNlcm5hbWU6IGxvZ2luLCBwYXNzd29yZCB9KSlcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yLmNvZGUgPT09ICdFTUFJTF9OT1RfVkVSSUZJRUQnKSB7XG4gICAgICAgICAgICBzZXRSZXF1aXJlRW1haWxWZXJpZmljYXRpb24odHJ1ZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVycm9yLm1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHRvYXN0LmVycm9yKGVycm9yLm1lc3NhZ2UuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBlcnJvci5tZXNzYWdlLnNsaWNlKDEpKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YT8udG9rZW4pIHtcbiAgICAgICAgICB0b2FzdC5zdWNjZXNzKHQoJ2dlbmVyYWw6c3VjY2VzcycpKVxuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcmVkaXJlY3RVcmxcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRvYXN0LmVycm9yKHQoJ2Vycm9yOnVua25vd24nKSB8fCAnQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZCcpXG4gICAgICB9XG4gICAgfSxcbiAgICB2YWxpZGF0b3JzOiB7XG4gICAgICBvblN1Ym1pdDogbG9naW5TY2hlbWFcbiAgICB9XG4gIH0pXG5cbiAgY29uc3QgW3JlcXVpcmVFbWFpbFZlcmlmaWNhdGlvbiwgc2V0UmVxdWlyZUVtYWlsVmVyaWZpY2F0aW9uXSA9IHVzZVN0YXRlPGJvb2xlYW4+KGZhbHNlKVxuXG4gIGlmIChyZXF1aXJlRW1haWxWZXJpZmljYXRpb24pIHtcbiAgICByZXR1cm4gPEZvcm1IZWFkZXIgaGVhZGluZz1cIlBsZWFzZSB2ZXJpZnkgeW91ciBlbWFpbFwiIGRlc2NyaXB0aW9uPXt0KCdhdXRoZW50aWNhdGlvbjplbWFpbFNlbnQnKX0gc3R5bGU9e3sgdGV4dEFsaWduOiAnY2VudGVyJyB9fSAvPlxuICB9XG5cbiAgY29uc3QgZ2V0TG9naW5UeXBlTGFiZWwgPSAoKSA9PiB7XG4gICAgY29uc3QgbGFiZWxzID0ge1xuICAgICAgZW1haWw6IHQoJ2dlbmVyYWw6ZW1haWwnKSB8fCAnRW1haWwnLFxuICAgICAgdXNlcm5hbWU6IHQoJ2F1dGhlbnRpY2F0aW9uOnVzZXJuYW1lJykgfHwgJ1VzZXJuYW1lJyxcbiAgICAgIGVtYWlsT3JVc2VybmFtZTogdCgnYXV0aGVudGljYXRpb246ZW1haWxPclVzZXJuYW1lJykgfHwgJ0VtYWlsIG9yIFVzZXJuYW1lJ1xuICAgIH1cbiAgICByZXR1cm4gbGFiZWxzW2xvZ2luVHlwZV1cbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2Ake2Jhc2VDbGFzc31fX3dyYXBwZXJgfT5cbiAgICAgIHtzZWFyY2hQYXJhbUVycm9yICYmIHNlYXJjaFBhcmFtRXJyb3IgPT09ICdzaWdudXBfZGlzYWJsZWQnICYmIDxGb3JtRXJyb3IgZXJyb3JzPXtbJ1NpZ24gdXAgaXMgZGlzYWJsZWQuJ119IC8+fVxuICAgICAgPEZvcm1cbiAgICAgICAgY2xhc3NOYW1lPXtiYXNlQ2xhc3N9XG4gICAgICAgIG9uU3VibWl0PXsoZSkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIHZvaWQgZm9ybS5oYW5kbGVTdWJtaXQoKVxuICAgICAgICB9fT5cbiAgICAgICAgPEZvcm1JbnB1dFdyYXAgY2xhc3NOYW1lPXtiYXNlQ2xhc3N9PlxuICAgICAgICAgIDxmb3JtLkFwcEZpZWxkXG4gICAgICAgICAgICBuYW1lPVwibG9naW5cIlxuICAgICAgICAgICAgY2hpbGRyZW49eyhmaWVsZCkgPT4gKFxuICAgICAgICAgICAgICA8ZmllbGQuVGV4dEZpZWxkXG4gICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImVtYWlsXCJcbiAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9e2BlbWFpbCR7aGFzUGFzc2tleVBsdWdpbiA/ICcgd2ViYXV0aG4nIDogJyd9YH1cbiAgICAgICAgICAgICAgICBsYWJlbD17Z2V0TG9naW5UeXBlTGFiZWwoKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8Zm9ybS5BcHBGaWVsZFxuICAgICAgICAgICAgbmFtZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgIGNoaWxkcmVuPXsoZmllbGQpID0+IChcbiAgICAgICAgICAgICAgPGZpZWxkLlRleHRGaWVsZFxuICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT17YHBhc3N3b3JkJHtoYXNQYXNza2V5UGx1Z2luID8gJyB3ZWJhdXRobicgOiAnJ31gfVxuICAgICAgICAgICAgICAgIGxhYmVsPXt0KCdnZW5lcmFsOnBhc3N3b3JkJyl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvRm9ybUlucHV0V3JhcD5cbiAgICAgICAgPExpbmsgaHJlZj17Zm9yZ290UGFzc3dvcmRVcmx9IHByZWZldGNoPXtmYWxzZX0+XG4gICAgICAgICAge3QoJ2F1dGhlbnRpY2F0aW9uOmZvcmdvdFBhc3N3b3JkUXVlc3Rpb24nKX1cbiAgICAgICAgPC9MaW5rPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBzdHlsZT17eyBkaXNwbGF5OiAnbm9uZScgfX0gdGFiSW5kZXg9ey0xfSAvPlxuICAgICAgICA8Zm9ybS5BcHBGb3JtIGNoaWxkcmVuPXs8Zm9ybS5TdWJtaXQgbGFiZWw9e3QoJ2F1dGhlbnRpY2F0aW9uOmxvZ2luJyl9IGxvYWRpbmdMYWJlbD17dCgnZ2VuZXJhbDpsb2FkaW5nJyl9IC8+fSAvPlxuICAgICAgPC9Gb3JtPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBjb25zdCBBZG1pbkxvZ2luQ2xpZW50OiBSZWFjdC5GQzxBZG1pbkxvZ2luQ2xpZW50UHJvcHM+ID0gKHtcbiAgbG9naW5NZXRob2RzLFxuICBoYXNVc2VybmFtZVBsdWdpbixcbiAgaGFzUGFzc2tleVBsdWdpbixcbiAgcHJlZmlsbEVtYWlsLFxuICBwcmVmaWxsUGFzc3dvcmQsXG4gIHByZWZpbGxVc2VybmFtZSxcbiAgc2VhcmNoUGFyYW1zLFxuICBsb2dpbldpdGhVc2VybmFtZSxcbiAgYmFzZVVSTCxcbiAgYmFzZVBhdGhcbn0pID0+IHtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAge2xvZ2luTWV0aG9kcy5pbmNsdWRlcygnZW1haWxQYXNzd29yZCcpICYmIChcbiAgICAgICAgPExvZ2luRm9ybVxuICAgICAgICAgIGhhc1VzZXJuYW1lUGx1Z2luPXtoYXNVc2VybmFtZVBsdWdpbn1cbiAgICAgICAgICBoYXNQYXNza2V5UGx1Z2luPXtoYXNQYXNza2V5UGx1Z2lufVxuICAgICAgICAgIHByZWZpbGxFbWFpbD17cHJlZmlsbEVtYWlsfVxuICAgICAgICAgIHByZWZpbGxQYXNzd29yZD17cHJlZmlsbFBhc3N3b3JkfVxuICAgICAgICAgIHByZWZpbGxVc2VybmFtZT17cHJlZmlsbFVzZXJuYW1lfVxuICAgICAgICAgIHNlYXJjaFBhcmFtcz17c2VhcmNoUGFyYW1zfVxuICAgICAgICAgIGxvZ2luV2l0aFVzZXJuYW1lPXtsb2dpbldpdGhVc2VybmFtZX1cbiAgICAgICAgICBiYXNlVVJMPXtiYXNlVVJMfVxuICAgICAgICAgIGJhc2VQYXRoPXtiYXNlUGF0aH1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICA8QWRtaW5Tb2NpYWxQcm92aWRlckJ1dHRvbnNcbiAgICAgICAgaXNTaWdudXA9e2ZhbHNlfVxuICAgICAgICBsb2dpbk1ldGhvZHM9e2xvZ2luTWV0aG9kc31cbiAgICAgICAgc2V0TG9hZGluZz17KCkgPT4ge319XG4gICAgICAgIHJlZGlyZWN0VXJsPXtnZXRTYWZlUmVkaXJlY3Qoc2VhcmNoUGFyYW1zPy5yZWRpcmVjdCBhcyBzdHJpbmcsIHVzZUNvbmZpZygpLmNvbmZpZy5yb3V0ZXMuYWRtaW4pfVxuICAgICAgICBiYXNlVVJMPXtiYXNlVVJMfVxuICAgICAgICBiYXNlUGF0aD17YmFzZVBhdGh9XG4gICAgICAvPlxuICAgIDwvPlxuICApXG59XG4iXSwibmFtZXMiOlsiQWRtaW5Tb2NpYWxQcm92aWRlckJ1dHRvbnMiLCJnZXRTYWZlUmVkaXJlY3QiLCJ1c2VDb25maWciLCJMaW5rIiwidG9hc3QiLCJ1c2VUcmFuc2xhdGlvbiIsIlJlYWN0IiwidXNlTWVtbyIsInVzZVN0YXRlIiwiYWRtaW5Sb3V0ZXMiLCJ1c2VBcHBGb3JtIiwiRm9ybSIsIkZvcm1FcnJvciIsIkZvcm1JbnB1dFdyYXAiLCJGb3JtSGVhZGVyIiwiY3JlYXRlTG9naW5TY2hlbWEiLCJpc1ZhbGlkRW1haWwiLCJjcmVhdGVBdXRoQ2xpZW50IiwidXNlcm5hbWVDbGllbnQiLCJ0d29GYWN0b3JDbGllbnQiLCJwYXNza2V5Q2xpZW50IiwiZm9ybWF0QWRtaW5VUkwiLCJnZXRMb2dpbk9wdGlvbnMiLCJ1c2VSb3V0ZXIiLCJ2YWx1ZU9yRGVmYXVsdFN0cmluZyIsImJhc2VDbGFzcyIsIkxvZ2luRm9ybSIsImhhc1VzZXJuYW1lUGx1Z2luIiwiaGFzUGFzc2tleVBsdWdpbiIsInByZWZpbGxFbWFpbCIsInByZWZpbGxQYXNzd29yZCIsInByZWZpbGxVc2VybmFtZSIsInNlYXJjaFBhcmFtcyIsImxvZ2luV2l0aFVzZXJuYW1lIiwiYmFzZVVSTCIsImJhc2VQYXRoIiwiY29uZmlnIiwicm91dGVyIiwiYWRtaW5Sb3V0ZSIsInJvdXRlcyIsImFkbWluIiwidCIsImNhbkxvZ2luV2l0aEVtYWlsIiwiY2FuTG9naW5XaXRoVXNlcm5hbWUiLCJzZWFyY2hQYXJhbUVycm9yIiwiZXJyb3IiLCJyZWRpcmVjdFVybCIsInJlZGlyZWN0IiwiZm9yZ290UGFzc3dvcmRVcmwiLCJwYXRoIiwiZm9yZ290UGFzc3dvcmQiLCJhdXRoQ2xpZW50IiwicGx1Z2lucyIsIm9uVHdvRmFjdG9yUmVkaXJlY3QiLCJwdXNoIiwidHdvRmFjdG9yVmVyaWZ5IiwibG9naW5UeXBlIiwibG9naW5TY2hlbWEiLCJmb3JtIiwiZGVmYXVsdFZhbHVlcyIsImxvZ2luIiwicGFzc3dvcmQiLCJvblN1Ym1pdCIsInZhbHVlIiwiaXNFbWFpbCIsImRhdGEiLCJzaWduSW4iLCJlbWFpbCIsImNhbGxiYWNrVVJMIiwidXNlcm5hbWUiLCJjb2RlIiwic2V0UmVxdWlyZUVtYWlsVmVyaWZpY2F0aW9uIiwibWVzc2FnZSIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJ0b2tlbiIsInN1Y2Nlc3MiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhyZWYiLCJlcnIiLCJ2YWxpZGF0b3JzIiwicmVxdWlyZUVtYWlsVmVyaWZpY2F0aW9uIiwiaGVhZGluZyIsImRlc2NyaXB0aW9uIiwic3R5bGUiLCJ0ZXh0QWxpZ24iLCJnZXRMb2dpblR5cGVMYWJlbCIsImxhYmVscyIsImVtYWlsT3JVc2VybmFtZSIsImRpdiIsImNsYXNzTmFtZSIsImVycm9ycyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImhhbmRsZVN1Ym1pdCIsIkFwcEZpZWxkIiwibmFtZSIsImNoaWxkcmVuIiwiZmllbGQiLCJUZXh0RmllbGQiLCJ0eXBlIiwiYXV0b0NvbXBsZXRlIiwibGFiZWwiLCJwcmVmZXRjaCIsImJ1dHRvbiIsImRpc3BsYXkiLCJ0YWJJbmRleCIsIkFwcEZvcm0iLCJTdWJtaXQiLCJsb2FkaW5nTGFiZWwiLCJBZG1pbkxvZ2luQ2xpZW50IiwibG9naW5NZXRob2RzIiwiaW5jbHVkZXMiLCJpc1NpZ251cCIsInNldExvYWRpbmciXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLFNBQVNBLDBCQUEwQixRQUFRLDJDQUFpRTtBQUM1RyxTQUFTQyxlQUFlLFFBQVEsZ0NBQXNEO0FBQ3RGLFNBQVNDLFNBQVMsRUFBRUMsSUFBSSxFQUFFQyxLQUFLLEVBQUVDLGNBQWMsUUFBUSxpQkFBZ0I7QUFDdkUsT0FBT0MsU0FBU0MsT0FBTyxFQUFFQyxRQUFRLFFBQVEsUUFBTztBQUdoRCxTQUFTQyxXQUFXLFFBQVEscUJBQWdDO0FBQzVELFNBQVNDLFVBQVUsUUFBUSw2QkFBZTtBQUMxQyxTQUFTQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsYUFBYSxRQUFRLGdDQUFrQjtBQUNqRSxTQUFTQyxVQUFVLFFBQVEsdUNBQXlCO0FBQ3BELFNBQVNDLGlCQUFpQixFQUFFQyxZQUFZLFFBQVEsd0NBQTBCO0FBQzFFLFNBQVNDLGdCQUFnQixRQUFRLHFCQUFvQjtBQUNyRCxTQUFTQyxjQUFjLEVBQUVDLGVBQWUsRUFBRUMsYUFBYSxRQUFRLDZCQUE0QjtBQUMzRixTQUFTQyxjQUFjLEVBQUVDLGVBQWUsUUFBUSxpQkFBZ0I7QUFDaEUsU0FBU0MsU0FBUyxRQUFRLGtCQUFpQjtBQUMzQyxTQUFTQyxvQkFBb0IsUUFBUSwrQ0FBaUM7QUFldEUsTUFBTUMsWUFBWTtBQUVsQixNQUFNQyxZQVVELENBQUMsRUFDSkMsaUJBQWlCLEVBQ2pCQyxnQkFBZ0IsRUFDaEJDLFlB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