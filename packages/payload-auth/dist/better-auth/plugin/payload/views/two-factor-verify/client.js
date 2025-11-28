'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
import { useAppForm } from "../../../../../shared/form";
import { Form, FormInputWrap } from "../../../../../shared/form/ui";
import { FormHeader } from "../../../../../shared/form/ui/header";
import { toast, useTranslation } from "@payloadcms/ui";
import { z } from "zod";
import { useRouter } from "next/navigation";
export const TwoFactorVerifyForm = ({ redirect, twoFactorDigits = 6, baseURL, basePath })=>{
    const { t } = useTranslation();
    const router = useRouter();
    const authClient = useMemo(()=>createAuthClient({
            baseURL,
            basePath,
            plugins: [
                twoFactorClient()
            ]
        }), []);
    const otpSchema = z.object({
        code: z.string().length(twoFactorDigits, `Code must be ${twoFactorDigits} digits`).refine((val)=>/^\d{6}$/.test(val), 'Code must be numeric')
    });
    const form = useAppForm({
        defaultValues: {
            code: ''
        },
        onSubmit: async ({ value })=>{
            const { code } = value;
            const { error } = await authClient.twoFactor.verifyTotp({
                code
            });
            if (error) {
                toast.error(error.message);
                return;
            }
            router.push(redirect);
            toast.success('Two-factor verified!');
        },
        validators: {
            onSubmit: otpSchema
        }
    });
    return /*#__PURE__*/ _jsxs(Form, {
        onSubmit: (e)=>{
            e.preventDefault();
            void form.handleSubmit();
        },
        children: [
            /*#__PURE__*/ _jsx(FormHeader, {
                style: {
                    textAlign: 'center'
                },
                heading: 'Verify Two-Factor'
            }),
            /*#__PURE__*/ _jsx(FormInputWrap, {
                children: /*#__PURE__*/ _jsx(form.AppField, {
                    name: "code",
                    children: (field)=>/*#__PURE__*/ _jsx(field.TextField, {
                            type: "text",
                            className: "text otp",
                            label: '6-digit Code',
                            required: true,
                            autoComplete: "one-time-password"
                        })
                })
            }),
            /*#__PURE__*/ _jsx(form.AppForm, {
                children: /*#__PURE__*/ _jsx(form.Submit, {
                    label: t('authentication:verify') || 'Verify',
                    loadingLabel: t('general:loading') || 'Loading'
                })
            })
        ]
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC92aWV3cy90d28tZmFjdG9yLXZlcmlmeS9jbGllbnQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50J1xuXG5pbXBvcnQgeyB1c2VNZW1vIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBjcmVhdGVBdXRoQ2xpZW50IH0gZnJvbSAnYmV0dGVyLWF1dGgvcmVhY3QnXG5pbXBvcnQgeyB0d29GYWN0b3JDbGllbnQgfSBmcm9tICdiZXR0ZXItYXV0aC9jbGllbnQvcGx1Z2lucydcbmltcG9ydCB7IHVzZUFwcEZvcm0gfSBmcm9tICdAL3NoYXJlZC9mb3JtJ1xuaW1wb3J0IHsgRm9ybSwgRm9ybUlucHV0V3JhcCB9IGZyb20gJ0Avc2hhcmVkL2Zvcm0vdWknXG5pbXBvcnQgeyBGb3JtSGVhZGVyIH0gZnJvbSAnQC9zaGFyZWQvZm9ybS91aS9oZWFkZXInXG5pbXBvcnQgeyB0b2FzdCwgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdAcGF5bG9hZGNtcy91aSdcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnXG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tICduZXh0L25hdmlnYXRpb24nXG5cbmV4cG9ydCBjb25zdCBUd29GYWN0b3JWZXJpZnlGb3JtID0gKHtcbiAgcmVkaXJlY3QsXG4gIHR3b0ZhY3RvckRpZ2l0cyA9IDYsXG4gIGJhc2VVUkwsXG4gIGJhc2VQYXRoXG59OiB7XG4gIHJlZGlyZWN0OiBzdHJpbmdcbiAgdHdvRmFjdG9yRGlnaXRzPzogbnVtYmVyXG4gIGJhc2VVUkw/OiBzdHJpbmdcbiAgYmFzZVBhdGg/OiBzdHJpbmdcbn0pID0+IHtcbiAgY29uc3QgeyB0IH0gPSB1c2VUcmFuc2xhdGlvbigpXG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpXG4gIGNvbnN0IGF1dGhDbGllbnQgPSB1c2VNZW1vKCgpID0+IGNyZWF0ZUF1dGhDbGllbnQoeyBiYXNlVVJMLCBiYXNlUGF0aCwgcGx1Z2luczogW3R3b0ZhY3RvckNsaWVudCgpXSB9KSwgW10pXG5cbiAgY29uc3Qgb3RwU2NoZW1hID0gei5vYmplY3Qoe1xuICAgIGNvZGU6IHpcbiAgICAgIC5zdHJpbmcoKVxuICAgICAgLmxlbmd0aCh0d29GYWN0b3JEaWdpdHMsIGBDb2RlIG11c3QgYmUgJHt0d29GYWN0b3JEaWdpdHN9IGRpZ2l0c2ApXG4gICAgICAucmVmaW5lKCh2YWwpID0+IC9eXFxkezZ9JC8udGVzdCh2YWwpLCAnQ29kZSBtdXN0IGJlIG51bWVyaWMnKVxuICB9KVxuXG4gIGNvbnN0IGZvcm0gPSB1c2VBcHBGb3JtKHtcbiAgICBkZWZhdWx0VmFsdWVzOiB7IGNvZGU6ICcnIH0sXG4gICAgb25TdWJtaXQ6IGFzeW5jICh7IHZhbHVlIH0pID0+IHtcbiAgICAgIGNvbnN0IHsgY29kZSB9ID0gdmFsdWVcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IGF1dGhDbGllbnQudHdvRmFjdG9yLnZlcmlmeVRvdHAoeyBjb2RlIH0pXG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgdG9hc3QuZXJyb3IoZXJyb3IubWVzc2FnZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICByb3V0ZXIucHVzaChyZWRpcmVjdClcbiAgICAgIHRvYXN0LnN1Y2Nlc3MoJ1R3by1mYWN0b3IgdmVyaWZpZWQhJylcbiAgICB9LFxuICAgIHZhbGlkYXRvcnM6IHsgb25TdWJtaXQ6IG90cFNjaGVtYSB9XG4gIH0pXG5cbiAgcmV0dXJuIChcbiAgICA8Rm9ybVxuICAgICAgb25TdWJtaXQ9eyhlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB2b2lkIGZvcm0uaGFuZGxlU3VibWl0KClcbiAgICAgIH19PlxuICAgICAgPEZvcm1IZWFkZXIgc3R5bGU9e3sgdGV4dEFsaWduOiAnY2VudGVyJyB9fSBoZWFkaW5nPXsnVmVyaWZ5IFR3by1GYWN0b3InfSAvPlxuICAgICAgPEZvcm1JbnB1dFdyYXA+XG4gICAgICAgIDxmb3JtLkFwcEZpZWxkXG4gICAgICAgICAgbmFtZT1cImNvZGVcIlxuICAgICAgICAgIGNoaWxkcmVuPXsoZmllbGQpID0+IChcbiAgICAgICAgICAgIDxmaWVsZC5UZXh0RmllbGQgdHlwZT1cInRleHRcIiBjbGFzc05hbWU9XCJ0ZXh0IG90cFwiIGxhYmVsPXsnNi1kaWdpdCBDb2RlJ30gcmVxdWlyZWQgYXV0b0NvbXBsZXRlPVwib25lLXRpbWUtcGFzc3dvcmRcIiAvPlxuICAgICAgICAgICl9XG4gICAgICAgIC8+XG4gICAgICA8L0Zvcm1JbnB1dFdyYXA+XG4gICAgICA8Zm9ybS5BcHBGb3JtXG4gICAgICAgIGNoaWxkcmVuPXs8Zm9ybS5TdWJtaXQgbGFiZWw9e3QoJ2F1dGhlbnRpY2F0aW9uOnZlcmlmeScpIHx8ICdWZXJpZnknfSBsb2FkaW5nTGFiZWw9e3QoJ2dlbmVyYWw6bG9hZGluZycpIHx8ICdMb2FkaW5nJ30gLz59XG4gICAgICAvPlxuICAgIDwvRm9ybT5cbiAgKVxufVxuIl0sIm5hbWVzIjpbInVzZU1lbW8iLCJjcmVhdGVBdXRoQ2xpZW50IiwidHdvRmFjdG9yQ2xpZW50IiwidXNlQXBwRm9ybSIsIkZvcm0iLCJGb3JtSW5wdXRXcmFwIiwiRm9ybUhlYWRlciIsInRvYXN0IiwidXNlVHJhbnNsYXRpb24iLCJ6IiwidXNlUm91dGVyIiwiVHdvRmFjdG9yVmVyaWZ5Rm9ybSIsInJlZGlyZWN0IiwidHdvRmFjdG9yRGlnaXRzIiwiYmFzZVVSTCIsImJhc2VQYXRoIiwidCIsInJvdXRlciIsImF1dGhDbGllbnQiLCJwbHVnaW5zIiwib3RwU2NoZW1hIiwib2JqZWN0IiwiY29kZSIsInN0cmluZyIsImxlbmd0aCIsInJlZmluZSIsInZhbCIsInRlc3QiLCJmb3JtIiwiZGVmYXVsdFZhbHVlcyIsIm9uU3VibWl0IiwidmFsdWUiLCJlcnJvciIsInR3b0ZhY3RvciIsInZlcmlmeVRvdHAiLCJtZXNzYWdlIiwicHVzaCIsInN1Y2Nlc3MiLCJ2YWxpZGF0b3JzIiwiZSIsInByZXZlbnREZWZhdWx0IiwiaGFuZGxlU3VibWl0Iiwic3R5bGUiLCJ0ZXh0QWxpZ24iLCJoZWFkaW5nIiwiQXBwRmllbGQiLCJuYW1lIiwiY2hpbGRyZW4iLCJmaWVsZCIsIlRleHRGaWVsZCIsInR5cGUiLCJjbGFzc05hbWUiLCJsYWJlbCIsInJlcXVpcmVkIiwiYXV0b0NvbXBsZXRlIiwiQXBwRm9ybSIsIlN1Ym1pdCIsImxvYWRpbmdMYWJlbCJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsU0FBU0EsT0FBTyxRQUFRLFFBQU87QUFDL0IsU0FBU0MsZ0JBQWdCLFFBQVEsb0JBQW1CO0FBQ3BELFNBQVNDLGVBQWUsUUFBUSw2QkFBNEI7QUFDNUQsU0FBU0MsVUFBVSxRQUFRLDZCQUFlO0FBQzFDLFNBQVNDLElBQUksRUFBRUMsYUFBYSxRQUFRLGdDQUFrQjtBQUN0RCxTQUFTQyxVQUFVLFFBQVEsdUNBQXlCO0FBQ3BELFNBQVNDLEtBQUssRUFBRUMsY0FBYyxRQUFRLGlCQUFnQjtBQUN0RCxTQUFTQyxDQUFDLFFBQVEsTUFBSztBQUN2QixTQUFTQyxTQUFTLFFBQVEsa0JBQWlCO0FBRTNDLE9BQU8sTUFBTUMsc0JBQXNCLENBQUMsRUFDbENDLFFBQVEsRUFDUkMsa0JBQWtCLENBQUMsRUFDbkJDLE9BQU8sRUFDUEMsUUFBUSxFQU1UO0lBQ0MsTUFBTSxFQUFFQyxDQUFDLEVBQUUsR0FBR1I7SUFDZCxNQUFNUyxTQUFTUDtJQUNmLE1BQU1RLGFBQWFsQixRQUFRLElBQU1DLGlCQUFpQjtZQUFFYTtZQUFTQztZQUFVSSxTQUFTO2dCQUFDakI7YUFBa0I7UUFBQyxJQUFJLEVBQUU7SUFFMUcsTUFBTWtCLFlBQVlYLEVBQUVZLE1BQU0sQ0FBQztRQUN6QkMsTUFBTWIsRUFDSGMsTUFBTSxHQUNOQyxNQUFNLENBQUNYLGlCQUFpQixDQUFDLGFBQWEsRUFBRUEsZ0JBQWdCLE9BQU8sQ0FBQyxFQUNoRVksTUFBTSxDQUFDLENBQUNDLE1BQVEsVUFBVUMsSUFBSSxDQUFDRCxNQUFNO0lBQzFDO0lBRUEsTUFBTUUsT0FBT3pCLFdBQVc7UUFDdEIwQixlQUFlO1lBQUVQLE1BQU07UUFBRztRQUMxQlEsVUFBVSxPQUFPLEVBQUVDLEtBQUssRUFBRTtZQUN4QixNQUFNLEVBQUVULElBQUksRUFBRSxHQUFHUztZQUNqQixNQUFNLEVBQUVDLEtBQUssRUFBRSxHQUFHLE1BQU1kLFdBQVdlLFNBQVMsQ0FBQ0MsVUFBVSxDQUFDO2dCQUFFWjtZQUFLO1lBQy9ELElBQUlVLE9BQU87Z0JBQ1R6QixNQUFNeUIsS0FBSyxDQUFDQSxNQUFNRyxPQUFPO2dCQUN6QjtZQUNGO1lBQ0FsQixPQUFPbUIsSUFBSSxDQUFDeEI7WUFDWkwsTUFBTThCLE9BQU8sQ0FBQztRQUNoQjtRQUNBQyxZQUFZO1lBQUVSLFVBQVVWO1FBQVU7SUFDcEM7SUFFQSxxQkFDRSxNQUFDaEI7UUFDQzBCLFVBQVUsQ0FBQ1M7WUFDVEEsRUFBRUMsY0FBYztZQUNoQixLQUFLWixLQUFLYSxZQUFZO1FBQ3hCOzswQkFDQSxLQUFDbkM7Z0JBQVdvQyxPQUFPO29CQUFFQyxXQUFXO2dCQUFTO2dCQUFHQyxTQUFTOzswQkFDckQsS0FBQ3ZDOzBCQUNDLGNBQUEsS0FBQ3VCLEtBQUtpQixRQUFRO29CQUNaQyxNQUFLO29CQUNMQyxVQUFVLENBQUNDLHNCQUNULEtBQUNBLE1BQU1DLFNBQVM7NEJBQUNDLE1BQUs7NEJBQU9DLFdBQVU7NEJBQVdDLE9BQU87NEJBQWdCQyxRQUFROzRCQUFDQyxjQUFhOzs7OzBCQUlyRyxLQUFDMUIsS0FBSzJCLE9BQU87Z0JBQ1hSLHdCQUFVLEtBQUNuQixLQUFLNEIsTUFBTTtvQkFBQ0osT0FBT3BDLEVBQUUsNEJBQTRCO29CQUFVeUMsY0FBY3pDLEVBQUUsc0JBQXNCOzs7OztBQUlwSCxFQUFDIn0=