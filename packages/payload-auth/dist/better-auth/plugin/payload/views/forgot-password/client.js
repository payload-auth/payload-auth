'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { toast, useConfig, useTranslation } from "@payloadcms/ui";
import { createAuthClient } from "better-auth/react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { adminRoutes } from "../../../constants";
import { useAppForm } from "../../../../../shared/form";
import { Form, FormInputWrap } from "../../../../../shared/form/ui";
import { FormHeader } from "../../../../../shared/form/ui/header";
import { emailRegex } from "../../../../../shared/utils/regex";
export const ForgotPasswordForm = ({ baseURL, basePath })=>{
    const { t } = useTranslation();
    const { config } = useConfig();
    const adminRoute = config.routes.admin;
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const authClient = useMemo(()=>createAuthClient({
            baseURL,
            basePath
        }), [
        basePath,
        baseURL
    ]);
    const forgotSchema = z.object({
        email: z.string().superRefine((val, ctx)=>{
            if (!emailRegex.test(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: val ? t('authentication:emailNotValid') || 'Invalid email' : t('validation:required')
                });
            }
        })
    });
    const form = useAppForm({
        defaultValues: {
            email: ''
        },
        onSubmit: async ({ value })=>{
            const { email } = value;
            try {
                const { data, error } = await authClient.requestPasswordReset({
                    email,
                    redirectTo: `${adminRoute}${adminRoutes.resetPassword}`
                });
                if (error) {
                    toast.error(error.message || t('authentication:emailNotValid') || 'Error');
                    return;
                }
                if (data?.status) {
                    setHasSubmitted(true);
                    toast.success('Successfully sent reset email.');
                } else {
                    toast.error(t('general:error') || 'Server Error');
                }
            } catch (e) {
                toast.error(t('general:error') || 'An unexpected error occurred');
            }
        },
        validators: {
            onSubmit: forgotSchema
        }
    });
    if (hasSubmitted) {
        return /*#__PURE__*/ _jsx(FormHeader, {
            description: t('authentication:checkYourEmailForPasswordReset'),
            heading: t('authentication:emailSent')
        });
    }
    return /*#__PURE__*/ _jsxs(Form, {
        onSubmit: (e)=>{
            e.preventDefault();
            void form.handleSubmit();
        },
        children: [
            /*#__PURE__*/ _jsx(FormHeader, {
                heading: t('authentication:forgotPassword'),
                description: t('authentication:forgotPasswordEmailInstructions')
            }),
            /*#__PURE__*/ _jsx(FormInputWrap, {
                children: /*#__PURE__*/ _jsx(form.AppField, {
                    name: "email",
                    children: (field)=>/*#__PURE__*/ _jsx(field.TextField, {
                            type: "text",
                            className: "email",
                            autoComplete: "email",
                            label: t('general:email')
                        })
                })
            }),
            /*#__PURE__*/ _jsx(form.AppForm, {
                children: /*#__PURE__*/ _jsx(form.Submit, {
                    label: t('general:submit'),
                    loadingLabel: t('general:loading')
                })
            })
        ]
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC92aWV3cy9mb3Jnb3QtcGFzc3dvcmQvY2xpZW50LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGNsaWVudCdcblxuaW1wb3J0IHsgdG9hc3QsIHVzZUNvbmZpZywgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdAcGF5bG9hZGNtcy91aSdcbmltcG9ydCB7IGNyZWF0ZUF1dGhDbGllbnQgfSBmcm9tICdiZXR0ZXItYXV0aC9yZWFjdCdcbmltcG9ydCB0eXBlIHsgRkMgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJ1xuaW1wb3J0IHsgYWRtaW5Sb3V0ZXMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9jb25zdGFudHMnXG5pbXBvcnQgeyB1c2VBcHBGb3JtIH0gZnJvbSAnQC9zaGFyZWQvZm9ybSdcbmltcG9ydCB7IEZvcm0sIEZvcm1JbnB1dFdyYXAgfSBmcm9tICdAL3NoYXJlZC9mb3JtL3VpJ1xuaW1wb3J0IHsgRm9ybUhlYWRlciB9IGZyb20gJ0Avc2hhcmVkL2Zvcm0vdWkvaGVhZGVyJ1xuaW1wb3J0IHsgZW1haWxSZWdleCB9IGZyb20gJ0Avc2hhcmVkL3V0aWxzL3JlZ2V4J1xuXG50eXBlIEZvcmdvdFBhc3N3b3JkRm9ybVByb3BzID0ge1xuICBiYXNlVVJMPzogc3RyaW5nXG4gIGJhc2VQYXRoPzogc3RyaW5nXG59XG5cbmV4cG9ydCBjb25zdCBGb3Jnb3RQYXNzd29yZEZvcm06IEZDPEZvcmdvdFBhc3N3b3JkRm9ybVByb3BzPiA9ICh7IGJhc2VVUkwsIGJhc2VQYXRoIH0pID0+IHtcbiAgY29uc3QgeyB0IH0gPSB1c2VUcmFuc2xhdGlvbigpXG4gIGNvbnN0IHsgY29uZmlnIH0gPSB1c2VDb25maWcoKVxuICBjb25zdCBhZG1pblJvdXRlID0gY29uZmlnLnJvdXRlcy5hZG1pblxuICBjb25zdCBbaGFzU3VibWl0dGVkLCBzZXRIYXNTdWJtaXR0ZWRdID0gdXNlU3RhdGU8Ym9vbGVhbj4oZmFsc2UpXG4gIGNvbnN0IGF1dGhDbGllbnQgPSB1c2VNZW1vKCgpID0+IGNyZWF0ZUF1dGhDbGllbnQoeyBiYXNlVVJMLCBiYXNlUGF0aCB9KSwgW2Jhc2VQYXRoLCBiYXNlVVJMXSlcblxuICBjb25zdCBmb3Jnb3RTY2hlbWEgPSB6Lm9iamVjdCh7XG4gICAgZW1haWw6IHouc3RyaW5nKCkuc3VwZXJSZWZpbmUoKHZhbCwgY3R4KSA9PiB7XG4gICAgICBpZiAoIWVtYWlsUmVnZXgudGVzdCh2YWwpKSB7XG4gICAgICAgIGN0eC5hZGRJc3N1ZSh7XG4gICAgICAgICAgY29kZTogei5ab2RJc3N1ZUNvZGUuY3VzdG9tLFxuICAgICAgICAgIG1lc3NhZ2U6IHZhbCA/IHQoJ2F1dGhlbnRpY2F0aW9uOmVtYWlsTm90VmFsaWQnKSB8fCAnSW52YWxpZCBlbWFpbCcgOiB0KCd2YWxpZGF0aW9uOnJlcXVpcmVkJylcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuICB9KVxuXG4gIGNvbnN0IGZvcm0gPSB1c2VBcHBGb3JtKHtcbiAgICBkZWZhdWx0VmFsdWVzOiB7XG4gICAgICBlbWFpbDogJydcbiAgICB9LFxuICAgIG9uU3VibWl0OiBhc3luYyAoeyB2YWx1ZSB9KSA9PiB7XG4gICAgICBjb25zdCB7IGVtYWlsIH0gPSB2YWx1ZVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgYXV0aENsaWVudC5yZXF1ZXN0UGFzc3dvcmRSZXNldCh7XG4gICAgICAgICAgZW1haWwsXG4gICAgICAgICAgcmVkaXJlY3RUbzogYCR7YWRtaW5Sb3V0ZX0ke2FkbWluUm91dGVzLnJlc2V0UGFzc3dvcmR9YFxuICAgICAgICB9KVxuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICB0b2FzdC5lcnJvcihlcnJvci5tZXNzYWdlIHx8IHQoJ2F1dGhlbnRpY2F0aW9uOmVtYWlsTm90VmFsaWQnKSB8fCAnRXJyb3InKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhPy5zdGF0dXMpIHtcbiAgICAgICAgICBzZXRIYXNTdWJtaXR0ZWQodHJ1ZSlcbiAgICAgICAgICB0b2FzdC5zdWNjZXNzKCdTdWNjZXNzZnVsbHkgc2VudCByZXNldCBlbWFpbC4nKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRvYXN0LmVycm9yKHQoJ2dlbmVyYWw6ZXJyb3InKSB8fCAnU2VydmVyIEVycm9yJylcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0b2FzdC5lcnJvcih0KCdnZW5lcmFsOmVycm9yJykgfHwgJ0FuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWQnKVxuICAgICAgfVxuICAgIH0sXG4gICAgdmFsaWRhdG9yczoge1xuICAgICAgb25TdWJtaXQ6IGZvcmdvdFNjaGVtYVxuICAgIH1cbiAgfSlcblxuICBpZiAoaGFzU3VibWl0dGVkKSB7XG4gICAgcmV0dXJuIDxGb3JtSGVhZGVyIGRlc2NyaXB0aW9uPXt0KCdhdXRoZW50aWNhdGlvbjpjaGVja1lvdXJFbWFpbEZvclBhc3N3b3JkUmVzZXQnKX0gaGVhZGluZz17dCgnYXV0aGVudGljYXRpb246ZW1haWxTZW50Jyl9IC8+XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxGb3JtXG4gICAgICBvblN1Ym1pdD17KGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHZvaWQgZm9ybS5oYW5kbGVTdWJtaXQoKVxuICAgICAgfX0+XG4gICAgICA8Rm9ybUhlYWRlciBoZWFkaW5nPXt0KCdhdXRoZW50aWNhdGlvbjpmb3Jnb3RQYXNzd29yZCcpfSBkZXNjcmlwdGlvbj17dCgnYXV0aGVudGljYXRpb246Zm9yZ290UGFzc3dvcmRFbWFpbEluc3RydWN0aW9ucycpfSAvPlxuICAgICAgPEZvcm1JbnB1dFdyYXA+XG4gICAgICAgIDxmb3JtLkFwcEZpZWxkXG4gICAgICAgICAgbmFtZT1cImVtYWlsXCJcbiAgICAgICAgICBjaGlsZHJlbj17KGZpZWxkKSA9PiA8ZmllbGQuVGV4dEZpZWxkIHR5cGU9XCJ0ZXh0XCIgY2xhc3NOYW1lPVwiZW1haWxcIiBhdXRvQ29tcGxldGU9XCJlbWFpbFwiIGxhYmVsPXt0KCdnZW5lcmFsOmVtYWlsJyl9IC8+fVxuICAgICAgICAvPlxuICAgICAgPC9Gb3JtSW5wdXRXcmFwPlxuICAgICAgPGZvcm0uQXBwRm9ybSBjaGlsZHJlbj17PGZvcm0uU3VibWl0IGxhYmVsPXt0KCdnZW5lcmFsOnN1Ym1pdCcpfSBsb2FkaW5nTGFiZWw9e3QoJ2dlbmVyYWw6bG9hZGluZycpfSAvPn0gLz5cbiAgICA8L0Zvcm0+XG4gIClcbn1cbiJdLCJuYW1lcyI6WyJ0b2FzdCIsInVzZUNvbmZpZyIsInVzZVRyYW5zbGF0aW9uIiwiY3JlYXRlQXV0aENsaWVudCIsInVzZU1lbW8iLCJ1c2VTdGF0ZSIsInoiLCJhZG1pblJvdXRlcyIsInVzZUFwcEZvcm0iLCJGb3JtIiwiRm9ybUlucHV0V3JhcCIsIkZvcm1IZWFkZXIiLCJlbWFpbFJlZ2V4IiwiRm9yZ290UGFzc3dvcmRGb3JtIiwiYmFzZVVSTCIsImJhc2VQYXRoIiwidCIsImNvbmZpZyIsImFkbWluUm91dGUiLCJyb3V0ZXMiLCJhZG1pbiIsImhhc1N1Ym1pdHRlZCIsInNldEhhc1N1Ym1pdHRlZCIsImF1dGhDbGllbnQiLCJmb3Jnb3RTY2hlbWEiLCJvYmplY3QiLCJlbWFpbCIsInN0cmluZyIsInN1cGVyUmVmaW5lIiwidmFsIiwiY3R4IiwidGVzdCIsImFkZElzc3VlIiwiY29kZSIsIlpvZElzc3VlQ29kZSIsImN1c3RvbSIsIm1lc3NhZ2UiLCJmb3JtIiwiZGVmYXVsdFZhbHVlcyIsIm9uU3VibWl0IiwidmFsdWUiLCJkYXRhIiwiZXJyb3IiLCJyZXF1ZXN0UGFzc3dvcmRSZXNldCIsInJlZGlyZWN0VG8iLCJyZXNldFBhc3N3b3JkIiwic3RhdHVzIiwic3VjY2VzcyIsImUiLCJ2YWxpZGF0b3JzIiwiZGVzY3JpcHRpb24iLCJoZWFkaW5nIiwicHJldmVudERlZmF1bHQiLCJoYW5kbGVTdWJtaXQiLCJBcHBGaWVsZCIsIm5hbWUiLCJjaGlsZHJlbiIsImZpZWxkIiwiVGV4dEZpZWxkIiwidHlwZSIsImNsYXNzTmFtZSIsImF1dG9Db21wbGV0ZSIsImxhYmVsIiwiQXBwRm9ybSIsIlN1Ym1pdCIsImxvYWRpbmdMYWJlbCJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsU0FBU0EsS0FBSyxFQUFFQyxTQUFTLEVBQUVDLGNBQWMsUUFBUSxpQkFBZ0I7QUFDakUsU0FBU0MsZ0JBQWdCLFFBQVEsb0JBQW1CO0FBRXBELFNBQVNDLE9BQU8sRUFBRUMsUUFBUSxRQUFRLFFBQU87QUFDekMsU0FBU0MsQ0FBQyxRQUFRLE1BQUs7QUFDdkIsU0FBU0MsV0FBVyxRQUFRLHFCQUFnQztBQUM1RCxTQUFTQyxVQUFVLFFBQVEsNkJBQWU7QUFDMUMsU0FBU0MsSUFBSSxFQUFFQyxhQUFhLFFBQVEsZ0NBQWtCO0FBQ3RELFNBQVNDLFVBQVUsUUFBUSx1Q0FBeUI7QUFDcEQsU0FBU0MsVUFBVSxRQUFRLG9DQUFzQjtBQU9qRCxPQUFPLE1BQU1DLHFCQUFrRCxDQUFDLEVBQUVDLE9BQU8sRUFBRUMsUUFBUSxFQUFFO0lBQ25GLE1BQU0sRUFBRUMsQ0FBQyxFQUFFLEdBQUdkO0lBQ2QsTUFBTSxFQUFFZSxNQUFNLEVBQUUsR0FBR2hCO0lBQ25CLE1BQU1pQixhQUFhRCxPQUFPRSxNQUFNLENBQUNDLEtBQUs7SUFDdEMsTUFBTSxDQUFDQyxjQUFjQyxnQkFBZ0IsR0FBR2pCLFNBQWtCO0lBQzFELE1BQU1rQixhQUFhbkIsUUFBUSxJQUFNRCxpQkFBaUI7WUFBRVc7WUFBU0M7UUFBUyxJQUFJO1FBQUNBO1FBQVVEO0tBQVE7SUFFN0YsTUFBTVUsZUFBZWxCLEVBQUVtQixNQUFNLENBQUM7UUFDNUJDLE9BQU9wQixFQUFFcUIsTUFBTSxHQUFHQyxXQUFXLENBQUMsQ0FBQ0MsS0FBS0M7WUFDbEMsSUFBSSxDQUFDbEIsV0FBV21CLElBQUksQ0FBQ0YsTUFBTTtnQkFDekJDLElBQUlFLFFBQVEsQ0FBQztvQkFDWEMsTUFBTTNCLEVBQUU0QixZQUFZLENBQUNDLE1BQU07b0JBQzNCQyxTQUFTUCxNQUFNYixFQUFFLG1DQUFtQyxrQkFBa0JBLEVBQUU7Z0JBQzFFO1lBQ0Y7UUFDRjtJQUNGO0lBRUEsTUFBTXFCLE9BQU83QixXQUFXO1FBQ3RCOEIsZUFBZTtZQUNiWixPQUFPO1FBQ1Q7UUFDQWEsVUFBVSxPQUFPLEVBQUVDLEtBQUssRUFBRTtZQUN4QixNQUFNLEVBQUVkLEtBQUssRUFBRSxHQUFHYztZQUNsQixJQUFJO2dCQUNGLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxLQUFLLEVBQUUsR0FBRyxNQUFNbkIsV0FBV29CLG9CQUFvQixDQUFDO29CQUM1RGpCO29CQUNBa0IsWUFBWSxHQUFHMUIsYUFBYVgsWUFBWXNDLGFBQWEsRUFBRTtnQkFDekQ7Z0JBQ0EsSUFBSUgsT0FBTztvQkFDVDFDLE1BQU0wQyxLQUFLLENBQUNBLE1BQU1OLE9BQU8sSUFBSXBCLEVBQUUsbUNBQW1DO29CQUNsRTtnQkFDRjtnQkFDQSxJQUFJeUIsTUFBTUssUUFBUTtvQkFDaEJ4QixnQkFBZ0I7b0JBQ2hCdEIsTUFBTStDLE9BQU8sQ0FBQztnQkFDaEIsT0FBTztvQkFDTC9DLE1BQU0wQyxLQUFLLENBQUMxQixFQUFFLG9CQUFvQjtnQkFDcEM7WUFDRixFQUFFLE9BQU9nQyxHQUFHO2dCQUNWaEQsTUFBTTBDLEtBQUssQ0FBQzFCLEVBQUUsb0JBQW9CO1lBQ3BDO1FBQ0Y7UUFDQWlDLFlBQVk7WUFDVlYsVUFBVWY7UUFDWjtJQUNGO0lBRUEsSUFBSUgsY0FBYztRQUNoQixxQkFBTyxLQUFDVjtZQUFXdUMsYUFBYWxDLEVBQUU7WUFBa0RtQyxTQUFTbkMsRUFBRTs7SUFDakc7SUFFQSxxQkFDRSxNQUFDUDtRQUNDOEIsVUFBVSxDQUFDUztZQUNUQSxFQUFFSSxjQUFjO1lBQ2hCLEtBQUtmLEtBQUtnQixZQUFZO1FBQ3hCOzswQkFDQSxLQUFDMUM7Z0JBQVd3QyxTQUFTbkMsRUFBRTtnQkFBa0NrQyxhQUFhbEMsRUFBRTs7MEJBQ3hFLEtBQUNOOzBCQUNDLGNBQUEsS0FBQzJCLEtBQUtpQixRQUFRO29CQUNaQyxNQUFLO29CQUNMQyxVQUFVLENBQUNDLHNCQUFVLEtBQUNBLE1BQU1DLFNBQVM7NEJBQUNDLE1BQUs7NEJBQU9DLFdBQVU7NEJBQVFDLGNBQWE7NEJBQVFDLE9BQU85QyxFQUFFOzs7OzBCQUd0RyxLQUFDcUIsS0FBSzBCLE9BQU87Z0JBQUNQLHdCQUFVLEtBQUNuQixLQUFLMkIsTUFBTTtvQkFBQ0YsT0FBTzlDLEVBQUU7b0JBQW1CaUQsY0FBY2pELEVBQUU7Ozs7O0FBR3ZGLEVBQUMifQ==