'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useConfig, toast, useTranslation } from "@payloadcms/ui";
import React, { useState } from "react";
import { AdminSocialProviderButtons } from "../../components/social-provider-buttons";
import { getSafeRedirect } from "../../utils/get-safe-redirect";
import { adminEndpoints } from "../../../constants";
import { useAppForm } from "../../../../../shared/form";
import { Form, FormInputWrap } from "../../../../../shared/form/ui";
import { FormHeader } from "../../../../../shared/form/ui/header";
import { createSignupSchema } from "../../../../../shared/form/validation";
import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";
const baseClass = 'admin-signup';
const SignupForm = ({ searchParams, loginWithUsername, requireEmailVerification, setRequireEmailVerification, adminInviteToken, baseURL, basePath })=>{
    const { config: { admin: { user: userSlug }, routes: { admin: adminRoute, api: apiRoute }, serverURL } } = useConfig();
    const { t } = useTranslation();
    const redirectUrl = getSafeRedirect(searchParams?.redirect, adminRoute);
    const authClient = createAuthClient({
        baseURL,
        basePath,
        plugins: [
            usernameClient()
        ]
    });
    const requireUsername = Boolean(loginWithUsername && typeof loginWithUsername === 'object' && loginWithUsername.requireUsername);
    const requireConfirmPassword = true;
    const signupSchema = createSignupSchema({
        t,
        requireUsername,
        requireConfirmPassword
    });
    const form = useAppForm({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            ...requireConfirmPassword ? {
                confirmPassword: ''
            } : {},
            ...loginWithUsername ? {
                username: ''
            } : {}
        },
        onSubmit: async ({ value })=>{
            const { name, email, username, password } = value;
            const { data, error } = await authClient.signUp.email({
                name,
                email,
                password,
                callbackURL: redirectUrl,
                ...loginWithUsername && username ? {
                    username
                } : {},
                fetchOptions: {
                    query: {
                        adminInviteToken
                    }
                }
            });
            if (error && error.code === 'EMAIL_NOT_VERIFIED' || !error && !data.token && !data?.user.emailVerified) {
                setRequireEmailVerification(true);
                toast.success('Check your email for a verification link');
                return;
            }
            if (error) {
                toast.error(error.message);
                return;
            }
        },
        validators: {
            onSubmit: signupSchema
        }
    });
    if (requireEmailVerification) {
        return /*#__PURE__*/ _jsx(FormHeader, {
            heading: "Please verify your email",
            description: 'Check your email for a verification link.',
            style: {
                textAlign: 'center'
            }
        });
    }
    return /*#__PURE__*/ _jsxs(Form, {
        className: baseClass,
        onSubmit: (e)=>{
            e.preventDefault();
            void form.handleSubmit();
        },
        children: [
            /*#__PURE__*/ _jsxs(FormInputWrap, {
                className: "login__form",
                children: [
                    /*#__PURE__*/ _jsx(form.AppField, {
                        name: "name",
                        children: (field)=>/*#__PURE__*/ _jsx(field.TextField, {
                                type: "name",
                                className: "text",
                                autoComplete: "name",
                                label: "Name",
                                required: true
                            })
                    }),
                    /*#__PURE__*/ _jsx(form.AppField, {
                        name: "email",
                        children: (field)=>/*#__PURE__*/ _jsx(field.TextField, {
                                type: "email",
                                className: "email",
                                autoComplete: "email",
                                label: t('general:email'),
                                required: true
                            })
                    }),
                    loginWithUsername && /*#__PURE__*/ _jsx(form.AppField, {
                        name: "username",
                        children: (field)=>/*#__PURE__*/ _jsx(field.TextField, {
                                type: "name",
                                className: "text",
                                autoComplete: "username",
                                label: t('authentication:username'),
                                required: requireUsername
                            })
                    }),
                    /*#__PURE__*/ _jsx(form.AppField, {
                        name: "password",
                        children: (field)=>/*#__PURE__*/ _jsx(field.TextField, {
                                type: "password",
                                className: "password",
                                label: t('authentication:newPassword'),
                                required: true
                            })
                    }),
                    /*#__PURE__*/ _jsx(form.AppField, {
                        name: "confirmPassword",
                        children: (field)=>/*#__PURE__*/ _jsx(field.TextField, {
                                type: "password",
                                className: "password",
                                label: t('authentication:confirmPassword'),
                                required: true
                            })
                    })
                ]
            }),
            /*#__PURE__*/ _jsx(form.AppForm, {
                children: /*#__PURE__*/ _jsx(form.Submit, {
                    label: t('general:create'),
                    loadingLabel: t('general:loading')
                })
            })
        ]
    });
};
export const AdminSignupClient = ({ adminInviteToken, userSlug, searchParams, loginMethods, loginWithUsername, baseURL, basePath })=>{
    const { config: { routes: { admin: adminRoute, api: apiRoute }, serverURL } } = useConfig();
    const [requireEmailVerification, setRequireEmailVerification] = useState(false);
    const redirectUrl = getSafeRedirect(searchParams?.redirect, adminRoute);
    const setAdminRoleCallbackURL = `${serverURL}${apiRoute}/${userSlug}${adminEndpoints.setAdminRole}?token=${adminInviteToken}&redirect=${redirectUrl}`;
    return /*#__PURE__*/ _jsxs(_Fragment, {
        children: [
            loginMethods.includes('emailPassword') && /*#__PURE__*/ _jsx(SignupForm, {
                adminInviteToken: adminInviteToken,
                searchParams: searchParams,
                loginWithUsername: loginWithUsername,
                requireEmailVerification: requireEmailVerification,
                setRequireEmailVerification: setRequireEmailVerification,
                baseURL: baseURL,
                basePath: basePath
            }),
            !requireEmailVerification && /*#__PURE__*/ _jsx(AdminSocialProviderButtons, {
                isSignup: true,
                loginMethods: loginMethods,
                adminInviteToken: adminInviteToken,
                setLoading: ()=>{},
                redirectUrl: redirectUrl,
                newUserCallbackURL: setAdminRoleCallbackURL,
                baseURL: baseURL,
                basePath: basePath
            })
        ]
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC92aWV3cy9hZG1pbi1zaWdudXAvY2xpZW50LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGNsaWVudCdcblxuaW1wb3J0IHsgdXNlQ29uZmlnLCB0b2FzdCwgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdAcGF5bG9hZGNtcy91aSdcbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBMb2dpbk1ldGhvZCB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuaW1wb3J0IHsgQWRtaW5Tb2NpYWxQcm92aWRlckJ1dHRvbnMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9wYXlsb2FkL2NvbXBvbmVudHMvc29jaWFsLXByb3ZpZGVyLWJ1dHRvbnMnXG5pbXBvcnQgeyBnZXRTYWZlUmVkaXJlY3QgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9wYXlsb2FkL3V0aWxzL2dldC1zYWZlLXJlZGlyZWN0J1xuaW1wb3J0IHsgYWRtaW5FbmRwb2ludHMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9jb25zdGFudHMnXG5pbXBvcnQgdHlwZSB7IExvZ2luV2l0aFVzZXJuYW1lT3B0aW9ucyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyB1c2VBcHBGb3JtIH0gZnJvbSAnQC9zaGFyZWQvZm9ybSdcbmltcG9ydCB7IEZvcm0sIEZvcm1JbnB1dFdyYXAgfSBmcm9tICdAL3NoYXJlZC9mb3JtL3VpJ1xuaW1wb3J0IHsgRm9ybUhlYWRlciB9IGZyb20gJ0Avc2hhcmVkL2Zvcm0vdWkvaGVhZGVyJ1xuaW1wb3J0IHsgY3JlYXRlU2lnbnVwU2NoZW1hIH0gZnJvbSAnQC9zaGFyZWQvZm9ybS92YWxpZGF0aW9uJ1xuaW1wb3J0IHsgY3JlYXRlQXV0aENsaWVudCB9IGZyb20gJ2JldHRlci1hdXRoL3JlYWN0J1xuaW1wb3J0IHsgdXNlcm5hbWVDbGllbnQgfSBmcm9tICdiZXR0ZXItYXV0aC9jbGllbnQvcGx1Z2lucydcblxudHlwZSBBZG1pblNpZ251cENsaWVudFByb3BzID0ge1xuICBhZG1pbkludml0ZVRva2VuOiBzdHJpbmdcbiAgdXNlclNsdWc6IHN0cmluZ1xuICBsb2dpbk1ldGhvZHM6IExvZ2luTWV0aG9kW11cbiAgc2VhcmNoUGFyYW1zOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkIH1cbiAgbG9naW5XaXRoVXNlcm5hbWU6IGZhbHNlIHwgTG9naW5XaXRoVXNlcm5hbWVPcHRpb25zXG4gIGJhc2VVUkw/OiBzdHJpbmdcbiAgYmFzZVBhdGg/OiBzdHJpbmdcbn1cblxuY29uc3QgYmFzZUNsYXNzID0gJ2FkbWluLXNpZ251cCdcblxudHlwZSBTaWdudXBGb3JtUHJvcHMgPSB7XG4gIGFkbWluSW52aXRlVG9rZW46IHN0cmluZ1xuICBzZWFyY2hQYXJhbXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgfVxuICBsb2dpbldpdGhVc2VybmFtZTogZmFsc2UgfCBMb2dpbldpdGhVc2VybmFtZU9wdGlvbnNcbiAgcmVxdWlyZUVtYWlsVmVyaWZpY2F0aW9uOiBib29sZWFuXG4gIHNldFJlcXVpcmVFbWFpbFZlcmlmaWNhdGlvbjogUmVhY3QuRGlzcGF0Y2g8UmVhY3QuU2V0U3RhdGVBY3Rpb248Ym9vbGVhbj4+XG4gIGJhc2VVUkw/OiBzdHJpbmdcbiAgYmFzZVBhdGg/OiBzdHJpbmdcbn1cblxuY29uc3QgU2lnbnVwRm9ybTogUmVhY3QuRkM8U2lnbnVwRm9ybVByb3BzPiA9ICh7XG4gIHNlYXJjaFBhcmFtcyxcbiAgbG9naW5XaXRoVXNlcm5hbWUsXG4gIHJlcXVpcmVFbWFpbFZlcmlmaWNhdGlvbixcbiAgc2V0UmVxdWlyZUVtYWlsVmVyaWZpY2F0aW9uLFxuICBhZG1pbkludml0ZVRva2VuLFxuICBiYXNlVVJMLFxuICBiYXNlUGF0aFxufSkgPT4ge1xuICBjb25zdCB7XG4gICAgY29uZmlnOiB7XG4gICAgICBhZG1pbjogeyB1c2VyOiB1c2VyU2x1ZyB9LFxuICAgICAgcm91dGVzOiB7IGFkbWluOiBhZG1pblJvdXRlLCBhcGk6IGFwaVJvdXRlIH0sXG4gICAgICBzZXJ2ZXJVUkxcbiAgICB9XG4gIH0gPSB1c2VDb25maWcoKVxuICBjb25zdCB7IHQgfSA9IHVzZVRyYW5zbGF0aW9uKClcbiAgY29uc3QgcmVkaXJlY3RVcmwgPSBnZXRTYWZlUmVkaXJlY3Qoc2VhcmNoUGFyYW1zPy5yZWRpcmVjdCBhcyBzdHJpbmcsIGFkbWluUm91dGUpXG4gIGNvbnN0IGF1dGhDbGllbnQgPSBjcmVhdGVBdXRoQ2xpZW50KHsgYmFzZVVSTCwgYmFzZVBhdGgsIHBsdWdpbnM6IFt1c2VybmFtZUNsaWVudCgpXSB9KVxuXG4gIGNvbnN0IHJlcXVpcmVVc2VybmFtZSA9IEJvb2xlYW4obG9naW5XaXRoVXNlcm5hbWUgJiYgdHlwZW9mIGxvZ2luV2l0aFVzZXJuYW1lID09PSAnb2JqZWN0JyAmJiBsb2dpbldpdGhVc2VybmFtZS5yZXF1aXJlVXNlcm5hbWUpXG5cbiAgY29uc3QgcmVxdWlyZUNvbmZpcm1QYXNzd29yZCA9IHRydWVcbiAgY29uc3Qgc2lnbnVwU2NoZW1hID0gY3JlYXRlU2lnbnVwU2NoZW1hKHsgdCwgcmVxdWlyZVVzZXJuYW1lLCByZXF1aXJlQ29uZmlybVBhc3N3b3JkIH0pXG5cbiAgY29uc3QgZm9ybSA9IHVzZUFwcEZvcm0oe1xuICAgIGRlZmF1bHRWYWx1ZXM6IHtcbiAgICAgIG5hbWU6ICcnLFxuICAgICAgZW1haWw6ICcnLFxuICAgICAgcGFzc3dvcmQ6ICcnLFxuICAgICAgLi4uKHJlcXVpcmVDb25maXJtUGFzc3dvcmQgPyB7IGNvbmZpcm1QYXNzd29yZDogJycgfSA6IHt9KSxcbiAgICAgIC4uLihsb2dpbldpdGhVc2VybmFtZSA/IHsgdXNlcm5hbWU6ICcnIH0gOiB7fSlcbiAgICB9LFxuICAgIG9uU3VibWl0OiBhc3luYyAoeyB2YWx1ZSB9KSA9PiB7XG4gICAgICBjb25zdCB7IG5hbWUsIGVtYWlsLCB1c2VybmFtZSwgcGFzc3dvcmQgfSA9IHZhbHVlXG5cbiAgICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IGF1dGhDbGllbnQuc2lnblVwLmVtYWlsKHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgZW1haWwsXG4gICAgICAgIHBhc3N3b3JkLFxuICAgICAgICBjYWxsYmFja1VSTDogcmVkaXJlY3RVcmwsXG4gICAgICAgIC4uLihsb2dpbldpdGhVc2VybmFtZSAmJiB1c2VybmFtZSA/IHsgdXNlcm5hbWUgfSA6IHt9KSxcbiAgICAgICAgZmV0Y2hPcHRpb25zOiB7XG4gICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgIGFkbWluSW52aXRlVG9rZW5cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGlmICgoZXJyb3IgJiYgZXJyb3IuY29kZSA9PT0gJ0VNQUlMX05PVF9WRVJJRklFRCcpIHx8ICghZXJyb3IgJiYgIWRhdGEudG9rZW4gJiYgIWRhdGE/LnVzZXIuZW1haWxWZXJpZmllZCkpIHtcbiAgICAgICAgc2V0UmVxdWlyZUVtYWlsVmVyaWZpY2F0aW9uKHRydWUpXG4gICAgICAgIHRvYXN0LnN1Y2Nlc3MoJ0NoZWNrIHlvdXIgZW1haWwgZm9yIGEgdmVyaWZpY2F0aW9uIGxpbmsnKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIHRvYXN0LmVycm9yKGVycm9yLm1lc3NhZ2UpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH0sXG4gICAgdmFsaWRhdG9yczoge1xuICAgICAgb25TdWJtaXQ6IHNpZ251cFNjaGVtYVxuICAgIH1cbiAgfSlcblxuICBpZiAocmVxdWlyZUVtYWlsVmVyaWZpY2F0aW9uKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxGb3JtSGVhZGVyXG4gICAgICAgIGhlYWRpbmc9XCJQbGVhc2UgdmVyaWZ5IHlvdXIgZW1haWxcIlxuICAgICAgICBkZXNjcmlwdGlvbj17J0NoZWNrIHlvdXIgZW1haWwgZm9yIGEgdmVyaWZpY2F0aW9uIGxpbmsuJ31cbiAgICAgICAgc3R5bGU9e3sgdGV4dEFsaWduOiAnY2VudGVyJyB9fVxuICAgICAgLz5cbiAgICApXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxGb3JtXG4gICAgICBjbGFzc05hbWU9e2Jhc2VDbGFzc31cbiAgICAgIG9uU3VibWl0PXsoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgdm9pZCBmb3JtLmhhbmRsZVN1Ym1pdCgpXG4gICAgICB9fT5cbiAgICAgIDxGb3JtSW5wdXRXcmFwIGNsYXNzTmFtZT1cImxvZ2luX19mb3JtXCI+XG4gICAgICAgIDxmb3JtLkFwcEZpZWxkXG4gICAgICAgICAgbmFtZT1cIm5hbWVcIlxuICAgICAgICAgIGNoaWxkcmVuPXsoZmllbGQpID0+IDxmaWVsZC5UZXh0RmllbGQgdHlwZT1cIm5hbWVcIiBjbGFzc05hbWU9XCJ0ZXh0XCIgYXV0b0NvbXBsZXRlPVwibmFtZVwiIGxhYmVsPVwiTmFtZVwiIHJlcXVpcmVkIC8+fVxuICAgICAgICAvPlxuICAgICAgICA8Zm9ybS5BcHBGaWVsZFxuICAgICAgICAgIG5hbWU9XCJlbWFpbFwiXG4gICAgICAgICAgY2hpbGRyZW49eyhmaWVsZCkgPT4gPGZpZWxkLlRleHRGaWVsZCB0eXBlPVwiZW1haWxcIiBjbGFzc05hbWU9XCJlbWFpbFwiIGF1dG9Db21wbGV0ZT1cImVtYWlsXCIgbGFiZWw9e3QoJ2dlbmVyYWw6ZW1haWwnKX0gcmVxdWlyZWQgLz59XG4gICAgICAgIC8+XG4gICAgICAgIHtsb2dpbldpdGhVc2VybmFtZSAmJiAoXG4gICAgICAgICAgPGZvcm0uQXBwRmllbGRcbiAgICAgICAgICAgIG5hbWU9XCJ1c2VybmFtZVwiXG4gICAgICAgICAgICBjaGlsZHJlbj17KGZpZWxkKSA9PiAoXG4gICAgICAgICAgICAgIDxmaWVsZC5UZXh0RmllbGRcbiAgICAgICAgICAgICAgICB0eXBlPVwibmFtZVwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwidXNlcm5hbWVcIlxuICAgICAgICAgICAgICAgIGxhYmVsPXt0KCdhdXRoZW50aWNhdGlvbjp1c2VybmFtZScpfVxuICAgICAgICAgICAgICAgIHJlcXVpcmVkPXtyZXF1aXJlVXNlcm5hbWV9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIC8+XG4gICAgICAgICl9XG4gICAgICAgIDxmb3JtLkFwcEZpZWxkXG4gICAgICAgICAgbmFtZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICBjaGlsZHJlbj17KGZpZWxkKSA9PiA8ZmllbGQuVGV4dEZpZWxkIHR5cGU9XCJwYXNzd29yZFwiIGNsYXNzTmFtZT1cInBhc3N3b3JkXCIgbGFiZWw9e3QoJ2F1dGhlbnRpY2F0aW9uOm5ld1Bhc3N3b3JkJyl9IHJlcXVpcmVkIC8+fVxuICAgICAgICAvPlxuICAgICAgICA8Zm9ybS5BcHBGaWVsZFxuICAgICAgICAgIG5hbWU9XCJjb25maXJtUGFzc3dvcmRcIlxuICAgICAgICAgIGNoaWxkcmVuPXsoZmllbGQpID0+IChcbiAgICAgICAgICAgIDxmaWVsZC5UZXh0RmllbGQgdHlwZT1cInBhc3N3b3JkXCIgY2xhc3NOYW1lPVwicGFzc3dvcmRcIiBsYWJlbD17dCgnYXV0aGVudGljYXRpb246Y29uZmlybVBhc3N3b3JkJyl9IHJlcXVpcmVkIC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgLz5cbiAgICAgIDwvRm9ybUlucHV0V3JhcD5cbiAgICAgIDxmb3JtLkFwcEZvcm0gY2hpbGRyZW49ezxmb3JtLlN1Ym1pdCBsYWJlbD17dCgnZ2VuZXJhbDpjcmVhdGUnKX0gbG9hZGluZ0xhYmVsPXt0KCdnZW5lcmFsOmxvYWRpbmcnKX0gLz59IC8+XG4gICAgPC9Gb3JtPlxuICApXG59XG5cbmV4cG9ydCBjb25zdCBBZG1pblNpZ251cENsaWVudDogUmVhY3QuRkM8QWRtaW5TaWdudXBDbGllbnRQcm9wcz4gPSAoe1xuICBhZG1pbkludml0ZVRva2VuLFxuICB1c2VyU2x1ZyxcbiAgc2VhcmNoUGFyYW1zLFxuICBsb2dpbk1ldGhvZHMsXG4gIGxvZ2luV2l0aFVzZXJuYW1lLFxuICBiYXNlVVJMLFxuICBiYXNlUGF0aFxufSkgPT4ge1xuICBjb25zdCB7XG4gICAgY29uZmlnOiB7XG4gICAgICByb3V0ZXM6IHsgYWRtaW46IGFkbWluUm91dGUsIGFwaTogYXBpUm91dGUgfSxcbiAgICAgIHNlcnZlclVSTFxuICAgIH1cbiAgfSA9IHVzZUNvbmZpZygpXG4gIGNvbnN0IFtyZXF1aXJlRW1haWxWZXJpZmljYXRpb24sIHNldFJlcXVpcmVFbWFpbFZlcmlmaWNhdGlvbl0gPSB1c2VTdGF0ZTxib29sZWFuPihmYWxzZSlcbiAgY29uc3QgcmVkaXJlY3RVcmwgPSBnZXRTYWZlUmVkaXJlY3Qoc2VhcmNoUGFyYW1zPy5yZWRpcmVjdCBhcyBzdHJpbmcsIGFkbWluUm91dGUpXG4gIGNvbnN0IHNldEFkbWluUm9sZUNhbGxiYWNrVVJMID0gYCR7c2VydmVyVVJMfSR7YXBpUm91dGV9LyR7dXNlclNsdWd9JHthZG1pbkVuZHBvaW50cy5zZXRBZG1pblJvbGV9P3Rva2VuPSR7YWRtaW5JbnZpdGVUb2tlbn0mcmVkaXJlY3Q9JHtyZWRpcmVjdFVybH1gXG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAge2xvZ2luTWV0aG9kcy5pbmNsdWRlcygnZW1haWxQYXNzd29yZCcpICYmIChcbiAgICAgICAgPFNpZ251cEZvcm1cbiAgICAgICAgICBhZG1pbkludml0ZVRva2VuPXthZG1pbkludml0ZVRva2VufVxuICAgICAgICAgIHNlYXJjaFBhcmFtcz17c2VhcmNoUGFyYW1zfVxuICAgICAgICAgIGxvZ2luV2l0aFVzZXJuYW1lPXtsb2dpbldpdGhVc2VybmFtZX1cbiAgICAgICAgICByZXF1aXJlRW1haWxWZXJpZmljYXRpb249e3JlcXVpcmVFbWFpbFZlcmlmaWNhdGlvbn1cbiAgICAgICAgICBzZXRSZXF1aXJlRW1haWxWZXJpZmljYXRpb249e3NldFJlcXVpcmVFbWFpbFZlcmlmaWNhdGlvbn1cbiAgICAgICAgICBiYXNlVVJMPXtiYXNlVVJMfVxuICAgICAgICAgIGJhc2VQYXRoPXtiYXNlUGF0aH1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICB7IXJlcXVpcmVFbWFpbFZlcmlmaWNhdGlvbiAmJiAoXG4gICAgICAgIDxBZG1pblNvY2lhbFByb3ZpZGVyQnV0dG9uc1xuICAgICAgICAgIGlzU2lnbnVwPXt0cnVlfVxuICAgICAgICAgIGxvZ2luTWV0aG9kcz17bG9naW5NZXRob2RzfVxuICAgICAgICAgIGFkbWluSW52aXRlVG9rZW49e2FkbWluSW52aXRlVG9rZW59XG4gICAgICAgICAgc2V0TG9hZGluZz17KCkgPT4ge319XG4gICAgICAgICAgcmVkaXJlY3RVcmw9e3JlZGlyZWN0VXJsfVxuICAgICAgICAgIG5ld1VzZXJDYWxsYmFja1VSTD17c2V0QWRtaW5Sb2xlQ2FsbGJhY2tVUkx9XG4gICAgICAgICAgYmFzZVVSTD17YmFzZVVSTH1cbiAgICAgICAgICBiYXNlUGF0aD17YmFzZVBhdGh9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgIDwvPlxuICApXG59XG4iXSwibmFtZXMiOlsidXNlQ29uZmlnIiwidG9hc3QiLCJ1c2VUcmFuc2xhdGlvbiIsIlJlYWN0IiwidXNlU3RhdGUiLCJBZG1pblNvY2lhbFByb3ZpZGVyQnV0dG9ucyIsImdldFNhZmVSZWRpcmVjdCIsImFkbWluRW5kcG9pbnRzIiwidXNlQXBwRm9ybSIsIkZvcm0iLCJGb3JtSW5wdXRXcmFwIiwiRm9ybUhlYWRlciIsImNyZWF0ZVNpZ251cFNjaGVtYSIsImNyZWF0ZUF1dGhDbGllbnQiLCJ1c2VybmFtZUNsaWVudCIsImJhc2VDbGFzcyIsIlNpZ251cEZvcm0iLCJzZWFyY2hQYXJhbXMiLCJsb2dpbldpdGhVc2VybmFtZSIsInJlcXVpcmVFbWFpbFZlcmlmaWNhdGlvbiIsInNldFJlcXVpcmVFbWFpbFZlcmlmaWNhdGlvbiIsImFkbWluSW52aXRlVG9rZW4iLCJiYXNlVVJMIiwiYmFzZVBhdGgiLCJjb25maWciLCJhZG1pbiIsInVzZXIiLCJ1c2VyU2x1ZyIsInJvdXRlcyIsImFkbWluUm91dGUiLCJhcGkiLCJhcGlSb3V0ZSIsInNlcnZlclVSTCIsInQiLCJyZWRpcmVjdFVybCIsInJlZGlyZWN0IiwiYXV0aENsaWVudCIsInBsdWdpbnMiLCJyZXF1aXJlVXNlcm5hbWUiLCJCb29sZWFuIiwicmVxdWlyZUNvbmZpcm1QYXNzd29yZCIsInNpZ251cFNjaGVtYSIsImZvcm0iLCJkZWZhdWx0VmFsdWVzIiwibmFtZSIsImVtYWlsIiwicGFzc3dvcmQiLCJjb25maXJtUGFzc3dvcmQiLCJ1c2VybmFtZSIsIm9uU3VibWl0IiwidmFsdWUiLCJkYXRhIiwiZXJyb3IiLCJzaWduVXAiLCJjYWxsYmFja1VSTCIsImZldGNoT3B0aW9ucyIsInF1ZXJ5IiwiY29kZSIsInRva2VuIiwiZW1haWxWZXJpZmllZCIsInN1Y2Nlc3MiLCJtZXNzYWdlIiwidmFsaWRhdG9ycyIsImhlYWRpbmciLCJkZXNjcmlwdGlvbiIsInN0eWxlIiwidGV4dEFsaWduIiwiY2xhc3NOYW1lIiwiZSIsInByZXZlbnREZWZhdWx0IiwiaGFuZGxlU3VibWl0IiwiQXBwRmllbGQiLCJjaGlsZHJlbiIsImZpZWxkIiwiVGV4dEZpZWxkIiwidHlwZSIsImF1dG9Db21wbGV0ZSIsImxhYmVsIiwicmVxdWlyZWQiLCJBcHBGb3JtIiwiU3VibWl0IiwibG9hZGluZ0xhYmVsIiwiQWRtaW5TaWdudXBDbGllbnQiLCJsb2dpbk1ldGhvZHMiLCJzZXRBZG1pblJvbGVDYWxsYmFja1VSTCIsInNldEFkbWluUm9sZSIsImluY2x1ZGVzIiwiaXNTaWdudXAiLCJzZXRMb2FkaW5nIiwibmV3VXNlckNhbGxiYWNrVVJMIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFF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