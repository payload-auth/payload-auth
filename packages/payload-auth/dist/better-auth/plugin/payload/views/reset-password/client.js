'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { z } from "zod";
import { Form, FormInputWrap } from "../../../../../shared/form/ui";
import { useRouter } from "next/navigation.js";
import { formatAdminURL } from "payload/shared";
import { createAuthClient } from "better-auth/react";
import { useAuth, useConfig, useTranslation, toast } from "@payloadcms/ui";
import { useAppForm } from "../../../../../shared/form";
export const PasswordResetForm = ({ token, baseURL, basePath })=>{
    const { t } = useTranslation();
    const history = useRouter();
    const { fetchFullUser } = useAuth();
    const authClient = useMemo(()=>createAuthClient({
            baseURL,
            basePath
        }), []);
    const { config: { admin: { routes: { login: loginRoute } }, routes: { admin: adminRoute } } } = useConfig();
    const resetPasswordSchema = z.object({
        password: z.string().min(1, t('validation:required') || 'Password is required'),
        confirmPassword: z.string().min(1, t('validation:required') || 'Confirm password is required')
    }).refine((data)=>{
        // Only validate matching passwords if both fields have values
        if (data.password && data.confirmPassword) {
            return data.password === data.confirmPassword;
        }
        // If one or both fields are empty, validation will be handled by the min(1) validators
        return true;
    }, {
        message: t('fields:passwordsDoNotMatch') || 'Passwords do not match',
        path: [
            'confirmPassword'
        ]
    });
    const form = useAppForm({
        defaultValues: {
            password: '',
            confirmPassword: ''
        },
        onSubmit: async ({ value })=>{
            const { password } = value;
            try {
                const { data, error } = await authClient.resetPassword({
                    newPassword: password,
                    token
                });
                if (error) {
                    toast.error(error.message || 'Error resetting password');
                    return;
                }
                if (data?.status) {
                    const user = await fetchFullUser();
                    if (user) {
                        history.push(adminRoute);
                    } else {
                        history.push(formatAdminURL({
                            adminRoute,
                            path: loginRoute
                        }));
                    }
                    toast.success(t('authentication:passwordResetSuccessfully'));
                }
            } catch (e) {
                toast.error('An unexpected error occurred');
            }
        },
        validators: {
            onSubmit: resetPasswordSchema
        }
    });
    return /*#__PURE__*/ _jsxs(Form, {
        onSubmit: (e)=>{
            e.preventDefault();
            void form.handleSubmit();
        },
        children: [
            /*#__PURE__*/ _jsxs(FormInputWrap, {
                className: "login__form",
                children: [
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
                    label: t('authentication:resetPassword'),
                    loadingLabel: t('general:loading')
                })
            })
        ]
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC92aWV3cy9yZXNldC1wYXNzd29yZC9jbGllbnQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50J1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbyB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCdcbmltcG9ydCB7IEZvcm0sIEZvcm1JbnB1dFdyYXAgfSBmcm9tICdAL3NoYXJlZC9mb3JtL3VpJ1xuaW1wb3J0IHsgRm9ybUhlYWRlciB9IGZyb20gJ0Avc2hhcmVkL2Zvcm0vdWkvaGVhZGVyJ1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9uYXZpZ2F0aW9uLmpzJ1xuaW1wb3J0IHsgZm9ybWF0QWRtaW5VUkwgfSBmcm9tICdwYXlsb2FkL3NoYXJlZCdcbmltcG9ydCB7IGNyZWF0ZUF1dGhDbGllbnQgfSBmcm9tICdiZXR0ZXItYXV0aC9yZWFjdCdcbmltcG9ydCB7IHVzZUF1dGgsIHVzZUNvbmZpZywgdXNlVHJhbnNsYXRpb24sIHRvYXN0IH0gZnJvbSAnQHBheWxvYWRjbXMvdWknXG5pbXBvcnQgeyB1c2VBcHBGb3JtIH0gZnJvbSAnQC9zaGFyZWQvZm9ybSdcblxudHlwZSBQYXNzd29yZFJlc2V0Rm9ybUFyZ3MgPSB7XG4gIHJlYWRvbmx5IHRva2VuOiBzdHJpbmdcbiAgcmVhZG9ubHkgbWluUGFzc3dvcmRMZW5ndGg/OiBudW1iZXJcbiAgcmVhZG9ubHkgbWF4UGFzc3dvcmRMZW5ndGg/OiBudW1iZXJcbiAgcmVhZG9ubHkgYmFzZVVSTD86IHN0cmluZ1xuICByZWFkb25seSBiYXNlUGF0aD86IHN0cmluZ1xufVxuXG5leHBvcnQgY29uc3QgUGFzc3dvcmRSZXNldEZvcm06IFJlYWN0LkZDPFBhc3N3b3JkUmVzZXRGb3JtQXJncz4gPSAoeyB0b2tlbiwgYmFzZVVSTCwgYmFzZVBhdGggfSkgPT4ge1xuICBjb25zdCB7IHQgfSA9IHVzZVRyYW5zbGF0aW9uKClcbiAgY29uc3QgaGlzdG9yeSA9IHVzZVJvdXRlcigpXG4gIGNvbnN0IHsgZmV0Y2hGdWxsVXNlciB9ID0gdXNlQXV0aCgpXG4gIGNvbnN0IGF1dGhDbGllbnQgPSB1c2VNZW1vKCgpID0+IGNyZWF0ZUF1dGhDbGllbnQoeyBiYXNlVVJMLCBiYXNlUGF0aCB9KSwgW10pXG4gIGNvbnN0IHtcbiAgICBjb25maWc6IHtcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIHJvdXRlczogeyBsb2dpbjogbG9naW5Sb3V0ZSB9XG4gICAgICB9LFxuICAgICAgcm91dGVzOiB7IGFkbWluOiBhZG1pblJvdXRlIH1cbiAgICB9XG4gIH0gPSB1c2VDb25maWcoKVxuXG4gIGNvbnN0IHJlc2V0UGFzc3dvcmRTY2hlbWEgPSB6XG4gICAgLm9iamVjdCh7XG4gICAgICBwYXNzd29yZDogei5zdHJpbmcoKS5taW4oMSwgdCgndmFsaWRhdGlvbjpyZXF1aXJlZCcpIHx8ICdQYXNzd29yZCBpcyByZXF1aXJlZCcpLFxuICAgICAgY29uZmlybVBhc3N3b3JkOiB6LnN0cmluZygpLm1pbigxLCB0KCd2YWxpZGF0aW9uOnJlcXVpcmVkJykgfHwgJ0NvbmZpcm0gcGFzc3dvcmQgaXMgcmVxdWlyZWQnKVxuICAgIH0pXG4gICAgLnJlZmluZShcbiAgICAgIChkYXRhKSA9PiB7XG4gICAgICAgIC8vIE9ubHkgdmFsaWRhdGUgbWF0Y2hpbmcgcGFzc3dvcmRzIGlmIGJvdGggZmllbGRzIGhhdmUgdmFsdWVzXG4gICAgICAgIGlmIChkYXRhLnBhc3N3b3JkICYmIGRhdGEuY29uZmlybVBhc3N3b3JkKSB7XG4gICAgICAgICAgcmV0dXJuIGRhdGEucGFzc3dvcmQgPT09IGRhdGEuY29uZmlybVBhc3N3b3JkXG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgb25lIG9yIGJvdGggZmllbGRzIGFyZSBlbXB0eSwgdmFsaWRhdGlvbiB3aWxsIGJlIGhhbmRsZWQgYnkgdGhlIG1pbigxKSB2YWxpZGF0b3JzXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBtZXNzYWdlOiB0KCdmaWVsZHM6cGFzc3dvcmRzRG9Ob3RNYXRjaCcpIHx8ICdQYXNzd29yZHMgZG8gbm90IG1hdGNoJyxcbiAgICAgICAgcGF0aDogWydjb25maXJtUGFzc3dvcmQnXVxuICAgICAgfVxuICAgIClcblxuICBjb25zdCBmb3JtID0gdXNlQXBwRm9ybSh7XG4gICAgZGVmYXVsdFZhbHVlczoge1xuICAgICAgcGFzc3dvcmQ6ICcnLFxuICAgICAgY29uZmlybVBhc3N3b3JkOiAnJ1xuICAgIH0sXG4gICAgb25TdWJtaXQ6IGFzeW5jICh7IHZhbHVlIH0pID0+IHtcbiAgICAgIGNvbnN0IHsgcGFzc3dvcmQgfSA9IHZhbHVlXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBhdXRoQ2xpZW50LnJlc2V0UGFzc3dvcmQoe1xuICAgICAgICAgIG5ld1Bhc3N3b3JkOiBwYXNzd29yZCxcbiAgICAgICAgICB0b2tlblxuICAgICAgICB9KVxuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICB0b2FzdC5lcnJvcihlcnJvci5tZXNzYWdlIHx8ICdFcnJvciByZXNldHRpbmcgcGFzc3dvcmQnKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhPy5zdGF0dXMpIHtcbiAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgZmV0Y2hGdWxsVXNlcigpXG4gICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgIGhpc3RvcnkucHVzaChhZG1pblJvdXRlKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoaXN0b3J5LnB1c2goXG4gICAgICAgICAgICAgIGZvcm1hdEFkbWluVVJMKHtcbiAgICAgICAgICAgICAgICBhZG1pblJvdXRlLFxuICAgICAgICAgICAgICAgIHBhdGg6IGxvZ2luUm91dGVcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9hc3Quc3VjY2Vzcyh0KCdhdXRoZW50aWNhdGlvbjpwYXNzd29yZFJlc2V0U3VjY2Vzc2Z1bGx5JykpXG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdG9hc3QuZXJyb3IoJ0FuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWQnKVxuICAgICAgfVxuICAgIH0sXG4gICAgdmFsaWRhdG9yczoge1xuICAgICAgb25TdWJtaXQ6IHJlc2V0UGFzc3dvcmRTY2hlbWFcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIChcbiAgICA8Rm9ybVxuICAgICAgb25TdWJtaXQ9eyhlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB2b2lkIGZvcm0uaGFuZGxlU3VibWl0KClcbiAgICAgIH19PlxuICAgICAgPEZvcm1JbnB1dFdyYXAgY2xhc3NOYW1lPVwibG9naW5fX2Zvcm1cIj5cbiAgICAgICAgPGZvcm0uQXBwRmllbGRcbiAgICAgICAgICBuYW1lPVwicGFzc3dvcmRcIlxuICAgICAgICAgIGNoaWxkcmVuPXsoZmllbGQpID0+IDxmaWVsZC5UZXh0RmllbGQgdHlwZT1cInBhc3N3b3JkXCIgY2xhc3NOYW1lPVwicGFzc3dvcmRcIiBsYWJlbD17dCgnYXV0aGVudGljYXRpb246bmV3UGFzc3dvcmQnKX0gcmVxdWlyZWQgLz59XG4gICAgICAgIC8+XG4gICAgICAgIDxmb3JtLkFwcEZpZWxkXG4gICAgICAgICAgbmFtZT1cImNvbmZpcm1QYXNzd29yZFwiXG4gICAgICAgICAgY2hpbGRyZW49eyhmaWVsZCkgPT4gKFxuICAgICAgICAgICAgPGZpZWxkLlRleHRGaWVsZCB0eXBlPVwicGFzc3dvcmRcIiBjbGFzc05hbWU9XCJwYXNzd29yZFwiIGxhYmVsPXt0KCdhdXRoZW50aWNhdGlvbjpjb25maXJtUGFzc3dvcmQnKX0gcmVxdWlyZWQgLz5cbiAgICAgICAgICApfVxuICAgICAgICAvPlxuICAgICAgPC9Gb3JtSW5wdXRXcmFwPlxuICAgICAgPGZvcm0uQXBwRm9ybSBjaGlsZHJlbj17PGZvcm0uU3VibWl0IGxhYmVsPXt0KCdhdXRoZW50aWNhdGlvbjpyZXNldFBhc3N3b3JkJyl9IGxvYWRpbmdMYWJlbD17dCgnZ2VuZXJhbDpsb2FkaW5nJyl9IC8+fSAvPlxuICAgIDwvRm9ybT5cbiAgKVxufVxuIl0sIm5hbWVzIjpbIlJlYWN0IiwidXNlTWVtbyIsInoiLCJGb3JtIiwiRm9ybUlucHV0V3JhcCIsInVzZVJvdXRlciIsImZvcm1hdEFkbWluVVJMIiwiY3JlYXRlQXV0aENsaWVudCIsInVzZUF1dGgiLCJ1c2VDb25maWciLCJ1c2VUcmFuc2xhdGlvbiIsInRvYXN0IiwidXNlQXBwRm9ybSIsIlBhc3N3b3JkUmVzZXRGb3JtIiwidG9rZW4iLCJiYXNlVVJMIiwiYmFzZVBhdGgiLCJ0IiwiaGlzdG9yeSIsImZldGNoRnVsbFVzZXIiLCJhdXRoQ2xpZW50IiwiY29uZmlnIiwiYWRtaW4iLCJyb3V0ZXMiLCJsb2dpbiIsImxvZ2luUm91dGUiLCJhZG1pblJvdXRlIiwicmVzZXRQYXNzd29yZFNjaGVtYSIsIm9iamVjdCIsInBhc3N3b3JkIiwic3RyaW5nIiwibWluIiwiY29uZmlybVBhc3N3b3JkIiwicmVmaW5lIiwiZGF0YSIsIm1lc3NhZ2UiLCJwYXRoIiwiZm9ybSIsImRlZmF1bHRWYWx1ZXMiLCJvblN1Ym1pdCIsInZhbHVlIiwiZXJyb3IiLCJyZXNldFBhc3N3b3JkIiwibmV3UGFzc3dvcmQiLCJzdGF0dXMiLCJ1c2VyIiwicHVzaCIsInN1Y2Nlc3MiLCJlIiwidmFsaWRhdG9ycyIsInByZXZlbnREZWZhdWx0IiwiaGFuZGxlU3VibWl0IiwiY2xhc3NOYW1lIiwiQXBwRmllbGQiLCJuYW1lIiwiY2hpbGRyZW4iLCJmaWVsZCIsIlRleHRGaWVsZCIsInR5cGUiLCJsYWJlbCIsInJlcXVpcmVkIiwiQXBwRm9ybSIsIlN1Ym1pdCIsImxvYWRpbmdMYWJlbCJdLCJtYXBw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