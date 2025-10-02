'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createAuthClient } from "better-auth/react";
import { useMemo, useState } from "react";
import { adminRoutes } from "../../../constants";
import { useAppForm } from "../../../../../shared/form";
import { Form, FormInputWrap } from "../../../../../shared/form/ui";
import { FormHeader } from "../../../../../shared/form/ui/header";
import { emailRegex } from "../../../../../shared/utils/regex";
import { toast, useConfig, useTranslation } from "@payloadcms/ui";
import { z } from "zod";
export const ForgotPasswordForm = ({ baseURL, basePath })=>{
    const { t } = useTranslation();
    const { config } = useConfig();
    const adminRoute = config.routes.admin;
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const authClient = useMemo(()=>createAuthClient({
            baseURL,
            basePath
        }), []);
    const forgotSchema = z.object({
        email: z.string().superRefine((val, ctx)=>{
            if (!val) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t('validation:required')
                });
                return;
            }
            if (!emailRegex.test(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t('authentication:emailNotValid') || 'Invalid email'
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
                const { data, error } = await authClient.forgetPassword({
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC92aWV3cy9mb3Jnb3QtcGFzc3dvcmQvY2xpZW50LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGNsaWVudCdcblxuaW1wb3J0IHsgY3JlYXRlQXV0aENsaWVudCB9IGZyb20gJ2JldHRlci1hdXRoL3JlYWN0J1xuaW1wb3J0IHsgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGFkbWluUm91dGVzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgdXNlQXBwRm9ybSB9IGZyb20gJ0Avc2hhcmVkL2Zvcm0nXG5pbXBvcnQgeyBGb3JtLCBGb3JtSW5wdXRXcmFwIH0gZnJvbSAnQC9zaGFyZWQvZm9ybS91aSdcbmltcG9ydCB7IEZvcm1IZWFkZXIgfSBmcm9tICdAL3NoYXJlZC9mb3JtL3VpL2hlYWRlcidcbmltcG9ydCB7IGVtYWlsUmVnZXggfSBmcm9tICdAL3NoYXJlZC91dGlscy9yZWdleCdcbmltcG9ydCB7IHRvYXN0LCB1c2VDb25maWcsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnQHBheWxvYWRjbXMvdWknXG5pbXBvcnQgdHlwZSB7IEZDIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJ1xuXG50eXBlIEZvcmdvdFBhc3N3b3JkRm9ybVByb3BzID0ge1xuICBiYXNlVVJMPzogc3RyaW5nXG4gIGJhc2VQYXRoPzogc3RyaW5nXG59XG5cbmV4cG9ydCBjb25zdCBGb3Jnb3RQYXNzd29yZEZvcm06IEZDPEZvcmdvdFBhc3N3b3JkRm9ybVByb3BzPiA9ICh7IGJhc2VVUkwsIGJhc2VQYXRoIH0pID0+IHtcbiAgY29uc3QgeyB0IH0gPSB1c2VUcmFuc2xhdGlvbigpXG4gIGNvbnN0IHsgY29uZmlnIH0gPSB1c2VDb25maWcoKVxuICBjb25zdCBhZG1pblJvdXRlID0gY29uZmlnLnJvdXRlcy5hZG1pblxuICBjb25zdCBbaGFzU3VibWl0dGVkLCBzZXRIYXNTdWJtaXR0ZWRdID0gdXNlU3RhdGU8Ym9vbGVhbj4oZmFsc2UpXG4gIGNvbnN0IGF1dGhDbGllbnQgPSB1c2VNZW1vKCgpID0+IGNyZWF0ZUF1dGhDbGllbnQoeyBiYXNlVVJMLCBiYXNlUGF0aCB9KSwgW10pXG5cbiAgY29uc3QgZm9yZ290U2NoZW1hID0gei5vYmplY3Qoe1xuICAgIGVtYWlsOiB6LnN0cmluZygpLnN1cGVyUmVmaW5lKCh2YWwsIGN0eCkgPT4ge1xuICAgICAgaWYgKCF2YWwpIHtcbiAgICAgICAgY3R4LmFkZElzc3VlKHtcbiAgICAgICAgICBjb2RlOiB6LlpvZElzc3VlQ29kZS5jdXN0b20sXG4gICAgICAgICAgbWVzc2FnZTogdCgndmFsaWRhdGlvbjpyZXF1aXJlZCcpXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKCFlbWFpbFJlZ2V4LnRlc3QodmFsKSkge1xuICAgICAgICBjdHguYWRkSXNzdWUoe1xuICAgICAgICAgIGNvZGU6IHouWm9kSXNzdWVDb2RlLmN1c3RvbSxcbiAgICAgICAgICBtZXNzYWdlOiB0KCdhdXRoZW50aWNhdGlvbjplbWFpbE5vdFZhbGlkJykgfHwgJ0ludmFsaWQgZW1haWwnXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcbiAgfSlcblxuICBjb25zdCBmb3JtID0gdXNlQXBwRm9ybSh7XG4gICAgZGVmYXVsdFZhbHVlczoge1xuICAgICAgZW1haWw6ICcnXG4gICAgfSxcbiAgICBvblN1Ym1pdDogYXN5bmMgKHsgdmFsdWUgfSkgPT4ge1xuICAgICAgY29uc3QgeyBlbWFpbCB9ID0gdmFsdWVcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IGF1dGhDbGllbnQuZm9yZ2V0UGFzc3dvcmQoe1xuICAgICAgICAgIGVtYWlsLFxuICAgICAgICAgIHJlZGlyZWN0VG86IGAke2FkbWluUm91dGV9JHthZG1pblJvdXRlcy5yZXNldFBhc3N3b3JkfWBcbiAgICAgICAgfSlcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgdG9hc3QuZXJyb3IoZXJyb3IubWVzc2FnZSB8fCB0KCdhdXRoZW50aWNhdGlvbjplbWFpbE5vdFZhbGlkJykgfHwgJ0Vycm9yJylcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YT8uc3RhdHVzKSB7XG4gICAgICAgICAgc2V0SGFzU3VibWl0dGVkKHRydWUpXG4gICAgICAgICAgdG9hc3Quc3VjY2VzcygnU3VjY2Vzc2Z1bGx5IHNlbnQgcmVzZXQgZW1haWwuJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2FzdC5lcnJvcih0KCdnZW5lcmFsOmVycm9yJykgfHwgJ1NlcnZlciBFcnJvcicpXG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdG9hc3QuZXJyb3IodCgnZ2VuZXJhbDplcnJvcicpIHx8ICdBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkJylcbiAgICAgIH1cbiAgICB9LFxuICAgIHZhbGlkYXRvcnM6IHtcbiAgICAgIG9uU3VibWl0OiBmb3Jnb3RTY2hlbWFcbiAgICB9XG4gIH0pXG5cbiAgaWYgKGhhc1N1Ym1pdHRlZCkge1xuICAgIHJldHVybiA8Rm9ybUhlYWRlciBkZXNjcmlwdGlvbj17dCgnYXV0aGVudGljYXRpb246Y2hlY2tZb3VyRW1haWxGb3JQYXNzd29yZFJlc2V0Jyl9IGhlYWRpbmc9e3QoJ2F1dGhlbnRpY2F0aW9uOmVtYWlsU2VudCcpfSAvPlxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Rm9ybVxuICAgICAgb25TdWJtaXQ9eyhlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB2b2lkIGZvcm0uaGFuZGxlU3VibWl0KClcbiAgICAgIH19PlxuICAgICAgPEZvcm1IZWFkZXIgaGVhZGluZz17dCgnYXV0aGVudGljYXRpb246Zm9yZ290UGFzc3dvcmQnKX0gZGVzY3JpcHRpb249e3QoJ2F1dGhlbnRpY2F0aW9uOmZvcmdvdFBhc3N3b3JkRW1haWxJbnN0cnVjdGlvbnMnKX0gLz5cbiAgICAgIDxGb3JtSW5wdXRXcmFwPlxuICAgICAgICA8Zm9ybS5BcHBGaWVsZFxuICAgICAgICAgIG5hbWU9XCJlbWFpbFwiXG4gICAgICAgICAgY2hpbGRyZW49eyhmaWVsZCkgPT4gPGZpZWxkLlRleHRGaWVsZCB0eXBlPVwidGV4dFwiIGNsYXNzTmFtZT1cImVtYWlsXCIgYXV0b0NvbXBsZXRlPVwiZW1haWxcIiBsYWJlbD17dCgnZ2VuZXJhbDplbWFpbCcpfSAvPn1cbiAgICAgICAgLz5cbiAgICAgIDwvRm9ybUlucHV0V3JhcD5cbiAgICAgIDxmb3JtLkFwcEZvcm0gY2hpbGRyZW49ezxmb3JtLlN1Ym1pdCBsYWJlbD17dCgnZ2VuZXJhbDpzdWJtaXQnKX0gbG9hZGluZ0xhYmVsPXt0KCdnZW5lcmFsOmxvYWRpbmcnKX0gLz59IC8+XG4gICAgPC9Gb3JtPlxuICApXG59XG4iXSwibmFtZXMiOlsiY3JlYXRlQXV0aENsaWVudCIsInVzZU1lbW8iLCJ1c2VTdGF0ZSIsImFkbWluUm91dGVzIiwidXNlQXBwRm9ybSIsIkZvcm0iLCJGb3JtSW5wdXRXcmFwIiwiRm9ybUhlYWRlciIsImVtYWlsUmVnZXgiLCJ0b2FzdCIsInVzZUNvbmZpZyIsInVzZVRyYW5zbGF0aW9uIiwieiIsIkZvcmdvdFBhc3N3b3JkRm9ybSIsImJhc2VVUkwiLCJiYXNlUGF0aCIsInQiLCJjb25maWciLCJhZG1pblJvdXRlIiwicm91dGVzIiwiYWRtaW4iLCJoYXNTdWJtaXR0ZWQiLCJzZXRIYXNTdWJtaXR0ZWQiLCJhdXRoQ2xpZW50IiwiZm9yZ290U2NoZW1hIiwib2JqZWN0IiwiZW1haWwiLCJzdHJpbmciLCJzdXBlclJlZmluZSIsInZhbCIsImN0eCIsImFkZElzc3VlIiwiY29kZSIsIlpvZElzc3VlQ29kZSIsImN1c3RvbSIsIm1lc3NhZ2UiLCJ0ZXN0IiwiZm9ybSIsImRlZmF1bHRWYWx1ZXMiLCJvblN1Ym1pdCIsInZhbHVlIiwiZGF0YSIsImVycm9yIiwiZm9yZ2V0UGFzc3dvcmQiLCJyZWRpcmVjdFRvIiwicmVzZXRQYXNzd29yZCIsInN0YXR1cyIsInN1Y2Nlc3MiLCJlIiwidmFsaWRhdG9ycyIsImRlc2NyaXB0aW9uIiwiaGVhZGluZyIsInByZXZlbnREZWZhdWx0IiwiaGFuZGxlU3VibWl0IiwiQXBwRmllbGQiLCJuYW1lIiwiY2hpbGRyZW4iLCJmaWVsZCIsIlRleHRGaWVsZCIsInR5cGUiLCJjbGFzc05hbWUiLCJhdXRvQ29tcGxldGUiLCJsYWJlbCIsIkFwcEZvcm0iLCJTdWJtaXQiLCJsb2FkaW5nTGFiZWwiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLFNBQVNBLGdCQUFnQixRQUFRLG9CQUFtQjtBQUNwRCxTQUFTQyxPQUFPLEVBQUVDLFFBQVEsUUFBUSxRQUFPO0FBQ3pDLFNBQVNDLFdBQVcsUUFBUSxxQkFBZ0M7QUFDNUQsU0FBU0MsVUFBVSxRQUFRLDZCQUFlO0FBQzFDLFNBQVNDLElBQUksRUFBRUMsYUFBYSxRQUFRLGdDQUFrQjtBQUN0RCxTQUFTQyxVQUFVLFFBQVEsdUNBQXlCO0FBQ3BELFNBQVNDLFVBQVUsUUFBUSxvQ0FBc0I7QUFDakQsU0FBU0MsS0FBSyxFQUFFQyxTQUFTLEVBQUVDLGNBQWMsUUFBUSxpQkFBZ0I7QUFFakUsU0FBU0MsQ0FBQyxRQUFRLE1BQUs7QUFPdkIsT0FBTyxNQUFNQyxxQkFBa0QsQ0FBQyxFQUFFQyxPQUFPLEVBQUVDLFFBQVEsRUFBRTtJQUNuRixNQUFNLEVBQUVDLENBQUMsRUFBRSxHQUFHTDtJQUNkLE1BQU0sRUFBRU0sTUFBTSxFQUFFLEdBQUdQO0lBQ25CLE1BQU1RLGFBQWFELE9BQU9FLE1BQU0sQ0FBQ0MsS0FBSztJQUN0QyxNQUFNLENBQUNDLGNBQWNDLGdCQUFnQixHQUFHcEIsU0FBa0I7SUFDMUQsTUFBTXFCLGFBQWF0QixRQUFRLElBQU1ELGlCQUFpQjtZQUFFYztZQUFTQztRQUFTLElBQUksRUFBRTtJQUU1RSxNQUFNUyxlQUFlWixFQUFFYSxNQUFNLENBQUM7UUFDNUJDLE9BQU9kLEVBQUVlLE1BQU0sR0FBR0MsV0FBVyxDQUFDLENBQUNDLEtBQUtDO1lBQ2xDLElBQUksQ0FBQ0QsS0FBSztnQkFDUkMsSUFBSUMsUUFBUSxDQUFDO29CQUNYQyxNQUFNcEIsRUFBRXFCLFlBQVksQ0FBQ0MsTUFBTTtvQkFDM0JDLFNBQVNuQixFQUFFO2dCQUNiO2dCQUNBO1lBQ0Y7WUFDQSxJQUFJLENBQUNSLFdBQVc0QixJQUFJLENBQUNQLE1BQU07Z0JBQ3pCQyxJQUFJQyxRQUFRLENBQUM7b0JBQ1hDLE1BQU1wQixFQUFFcUIsWUFBWSxDQUFDQyxNQUFNO29CQUMzQkMsU0FBU25CLEVBQUUsbUNBQW1DO2dCQUNoRDtZQUNGO1FBQ0Y7SUFDRjtJQUVBLE1BQU1xQixPQUFPakMsV0FBVztRQUN0QmtDLGVBQWU7WUFDYlosT0FBTztRQUNUO1FBQ0FhLFVBQVUsT0FBTyxFQUFFQyxLQUFLLEVBQUU7WUFDeEIsTUFBTSxFQUFFZCxLQUFLLEVBQUUsR0FBR2M7WUFDbEIsSUFBSTtnQkFDRixNQUFNLEVBQUVDLElBQUksRUFBRUMsS0FBSyxFQUFFLEdBQUcsTUFBTW5CLFdBQVdvQixjQUFjLENBQUM7b0JBQ3REakI7b0JBQ0FrQixZQUFZLEdBQUcxQixhQUFhZixZQUFZMEMsYUFBYSxFQUFFO2dCQUN6RDtnQkFDQSxJQUFJSCxPQUFPO29CQUNUakMsTUFBTWlDLEtBQUssQ0FBQ0EsTUFBTVAsT0FBTyxJQUFJbkIsRUFBRSxtQ0FBbUM7b0JBQ2xFO2dCQUNGO2dCQUNBLElBQUl5QixNQUFNSyxRQUFRO29CQUNoQnhCLGdCQUFnQjtvQkFDaEJiLE1BQU1zQyxPQUFPLENBQUM7Z0JBQ2hCLE9BQU87b0JBQ0x0QyxNQUFNaUMsS0FBSyxDQUFDMUIsRUFBRSxvQkFBb0I7Z0JBQ3BDO1lBQ0YsRUFBRSxPQUFPZ0MsR0FBRztnQkFDVnZDLE1BQU1pQyxLQUFLLENBQUMxQixFQUFFLG9CQUFvQjtZQUNwQztRQUNGO1FBQ0FpQyxZQUFZO1lBQ1ZWLFVBQVVmO1FBQ1o7SUFDRjtJQUVBLElBQUlILGNBQWM7UUFDaEIscUJBQU8sS0FBQ2Q7WUFBVzJDLGFBQWFsQyxFQUFFO1lBQWtEbUMsU0FBU25DLEVBQUU7O0lBQ2pHO0lBRUEscUJBQ0UsTUFBQ1g7UUFDQ2tDLFVBQVUsQ0FBQ1M7WUFDVEEsRUFBRUksY0FBYztZQUNoQixLQUFLZixLQUFLZ0IsWUFBWTtRQUN4Qjs7MEJBQ0EsS0FBQzlDO2dCQUFXNEMsU0FBU25DLEVBQUU7Z0JBQWtDa0MsYUFBYWxDLEVBQUU7OzBCQUN4RSxLQUFDVjswQkFDQyxjQUFBLEtBQUMrQixLQUFLaUIsUUFBUTtvQkFDWkMsTUFBSztvQkFDTEMsVUFBVSxDQUFDQyxzQkFBVSxLQUFDQSxNQUFNQyxTQUFTOzRCQUFDQyxNQUFLOzRCQUFPQyxXQUFVOzRCQUFRQyxjQUFhOzRCQUFRQyxPQUFPOUMsRUFBRTs7OzswQkFHdEcsS0FBQ3FCLEtBQUswQixPQUFPO2dCQUFDUCx3QkFBVSxLQUFDbkIsS0FBSzJCLE1BQU07b0JBQUNGLE9BQU85QyxFQUFFO29CQUFtQmlELGNBQWNqRCxFQUFFOzs7OztBQUd2RixFQUFDIn0=