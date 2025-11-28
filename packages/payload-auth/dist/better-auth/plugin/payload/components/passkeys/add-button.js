'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { passkeyClient } from "@better-auth/passkey/client";
import { Button, Modal, toast, useModal } from "@payloadcms/ui";
import { createAuthClient } from "better-auth/react";
import { XIcon } from "lucide-react";
import React, { useMemo, useState } from "react";
import { z } from "zod";
import { useAppForm } from "../../../../../shared/form";
import { Form, FormInputWrap } from "../../../../../shared/form/ui";
const baseClass = 'passkeys-modal';
export const PassKeyAddButton = ({ onAdd, baseURL, basePath })=>{
    const { openModal, closeModal } = useModal();
    const authClient = useMemo(()=>createAuthClient({
            baseURL,
            basePath,
            plugins: [
                passkeyClient()
            ]
        }), []);
    const AddPasskeyForm = ()=>{
        const [isLoading, setIsLoading] = useState(false);
        const nameSchema = z.object({
            name: z.string().min(1, 'Name is required')
        });
        const form = useAppForm({
            defaultValues: {
                name: ''
            },
            onSubmit: async ({ value })=>{
                setIsLoading(true);
                const res = await authClient.passkey.addPasskey({
                    name: value.name
                });
                setIsLoading(false);
                if (res?.error) {
                    toast.error(res.error.message);
                    return;
                }
                toast.success('Passkey added successfully');
                closeModal('passkeys-modal');
                if (typeof onAdd === 'function') onAdd();
            },
            validators: {
                onSubmit: nameSchema
            }
        });
        return /*#__PURE__*/ _jsxs(Form, {
            onSubmit: (e)=>{
                e.preventDefault();
                void form.handleSubmit();
            },
            className: "passkeys-add-form",
            children: [
                /*#__PURE__*/ _jsx(FormInputWrap, {
                    className: "passkeys-add-form__inputWrap",
                    children: /*#__PURE__*/ _jsx(form.AppField, {
                        name: "name",
                        children: (field)=>/*#__PURE__*/ _jsx(field.TextField, {
                                type: "text",
                                className: "text name",
                                label: "Passkey Name",
                                required: true
                            })
                    })
                }),
                /*#__PURE__*/ _jsx(form.AppForm, {
                    children: /*#__PURE__*/ _jsx(form.Submit, {
                        label: "Create Passkey",
                        loadingLabel: "Creating"
                    })
                })
            ]
        });
    };
    return /*#__PURE__*/ _jsxs(_Fragment, {
        children: [
            /*#__PURE__*/ _jsx(Button, {
                onClick: ()=>openModal('passkeys-modal'),
                size: "medium",
                buttonStyle: "pill",
                children: "Add Passkey"
            }),
            /*#__PURE__*/ _jsx(Modal, {
                slug: "passkeys-modal",
                className: baseClass,
                closeOnBlur: true,
                children: /*#__PURE__*/ _jsxs("div", {
                    className: `${baseClass}__wrapper`,
                    children: [
                        /*#__PURE__*/ _jsx(Button, {
                            onClick: ()=>closeModal('passkeys-modal'),
                            buttonStyle: "icon-label",
                            size: "small",
                            className: `${baseClass}__close-button`,
                            children: /*#__PURE__*/ _jsx(XIcon, {
                                size: 24
                            })
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: `${baseClass}__content`,
                            style: {
                                maxWidth: '30rem'
                            },
                            children: [
                                /*#__PURE__*/ _jsx("h2", {
                                    children: "Create New Passkey"
                                }),
                                /*#__PURE__*/ _jsx("p", {
                                    children: "Securely access your account without a password by creating a new passkey."
                                }),
                                /*#__PURE__*/ _jsx(AddPasskeyForm, {})
                            ]
                        })
                    ]
                })
            })
        ]
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC9jb21wb25lbnRzL3Bhc3NrZXlzL2FkZC1idXR0b24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50J1xuXG5pbXBvcnQgeyBwYXNza2V5Q2xpZW50IH0gZnJvbSAnQGJldHRlci1hdXRoL3Bhc3NrZXkvY2xpZW50J1xuaW1wb3J0IHsgQnV0dG9uLCBNb2RhbCwgdG9hc3QsIHVzZU1vZGFsIH0gZnJvbSAnQHBheWxvYWRjbXMvdWknXG5pbXBvcnQgeyBjcmVhdGVBdXRoQ2xpZW50IH0gZnJvbSAnYmV0dGVyLWF1dGgvcmVhY3QnXG5pbXBvcnQgeyBYSWNvbiB9IGZyb20gJ2x1Y2lkZS1yZWFjdCdcbmltcG9ydCBSZWFjdCwgeyB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCdcbmltcG9ydCB7IHVzZUFwcEZvcm0gfSBmcm9tICdAL3NoYXJlZC9mb3JtJ1xuaW1wb3J0IHsgRm9ybSwgRm9ybUlucHV0V3JhcCB9IGZyb20gJ0Avc2hhcmVkL2Zvcm0vdWknXG5cbmNvbnN0IGJhc2VDbGFzcyA9ICdwYXNza2V5cy1tb2RhbCdcblxuaW50ZXJmYWNlIFBhc3NLZXlBZGRCdXR0b25Qcm9wcyB7XG4gIG9uQWRkPzogKCkgPT4gdm9pZFxuICBiYXNlVVJMPzogc3RyaW5nXG4gIGJhc2VQYXRoPzogc3RyaW5nXG59XG5cbmV4cG9ydCBjb25zdCBQYXNzS2V5QWRkQnV0dG9uOiBSZWFjdC5GQzxQYXNzS2V5QWRkQnV0dG9uUHJvcHM+ID0gKHsgb25BZGQsIGJhc2VVUkwsIGJhc2VQYXRoIH0pID0+IHtcbiAgY29uc3QgeyBvcGVuTW9kYWwsIGNsb3NlTW9kYWwgfSA9IHVzZU1vZGFsKClcbiAgY29uc3QgYXV0aENsaWVudCA9IHVzZU1lbW8oKCkgPT4gY3JlYXRlQXV0aENsaWVudCh7IGJhc2VVUkwsIGJhc2VQYXRoLCBwbHVnaW5zOiBbcGFzc2tleUNsaWVudCgpXSB9KSwgW10pXG5cbiAgY29uc3QgQWRkUGFzc2tleUZvcm06IFJlYWN0LkZDID0gKCkgPT4ge1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgICBjb25zdCBuYW1lU2NoZW1hID0gei5vYmplY3Qoe1xuICAgICAgbmFtZTogei5zdHJpbmcoKS5taW4oMSwgJ05hbWUgaXMgcmVxdWlyZWQnKVxuICAgIH0pXG5cbiAgICBjb25zdCBmb3JtID0gdXNlQXBwRm9ybSh7XG4gICAgICBkZWZhdWx0VmFsdWVzOiB7IG5hbWU6ICcnIH0sXG4gICAgICBvblN1Ym1pdDogYXN5bmMgKHsgdmFsdWUgfSkgPT4ge1xuICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSlcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgYXV0aENsaWVudC5wYXNza2V5LmFkZFBhc3NrZXkoeyBuYW1lOiB2YWx1ZS5uYW1lIH0pXG4gICAgICAgIHNldElzTG9hZGluZyhmYWxzZSlcbiAgICAgICAgaWYgKHJlcz8uZXJyb3IpIHtcbiAgICAgICAgICB0b2FzdC5lcnJvcihyZXMuZXJyb3IubWVzc2FnZSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0b2FzdC5zdWNjZXNzKCdQYXNza2V5IGFkZGVkIHN1Y2Nlc3NmdWxseScpXG4gICAgICAgIGNsb3NlTW9kYWwoJ3Bhc3NrZXlzLW1vZGFsJylcbiAgICAgICAgaWYgKHR5cGVvZiBvbkFkZCA9PT0gJ2Z1bmN0aW9uJykgb25BZGQoKVxuICAgICAgfSxcbiAgICAgIHZhbGlkYXRvcnM6IHtcbiAgICAgICAgb25TdWJtaXQ6IG5hbWVTY2hlbWFcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxGb3JtXG4gICAgICAgIG9uU3VibWl0PXsoZSkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIHZvaWQgZm9ybS5oYW5kbGVTdWJtaXQoKVxuICAgICAgICB9fVxuICAgICAgICBjbGFzc05hbWU9XCJwYXNza2V5cy1hZGQtZm9ybVwiPlxuICAgICAgICA8Rm9ybUlucHV0V3JhcCBjbGFzc05hbWU9XCJwYXNza2V5cy1hZGQtZm9ybV9faW5wdXRXcmFwXCI+XG4gICAgICAgICAgPGZvcm0uQXBwRmllbGQgbmFtZT1cIm5hbWVcIj5cbiAgICAgICAgICAgIHsoZmllbGQ6IGFueSkgPT4gPGZpZWxkLlRleHRGaWVsZCB0eXBlPVwidGV4dFwiIGNsYXNzTmFtZT1cInRleHQgbmFtZVwiIGxhYmVsPVwiUGFzc2tleSBOYW1lXCIgcmVxdWlyZWQgLz59XG4gICAgICAgICAgPC9mb3JtLkFwcEZpZWxkPlxuICAgICAgICA8L0Zvcm1JbnB1dFdyYXA+XG4gICAgICAgIDxmb3JtLkFwcEZvcm0+XG4gICAgICAgICAgPGZvcm0uU3VibWl0IGxhYmVsPVwiQ3JlYXRlIFBhc3NrZXlcIiBsb2FkaW5nTGFiZWw9XCJDcmVhdGluZ1wiIC8+XG4gICAgICAgIDwvZm9ybS5BcHBGb3JtPlxuICAgICAgPC9Gb3JtPlxuICAgIClcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxCdXR0b24gb25DbGljaz17KCkgPT4gb3Blbk1vZGFsKCdwYXNza2V5cy1tb2RhbCcpfSBzaXplPVwibWVkaXVtXCIgYnV0dG9uU3R5bGU9XCJwaWxsXCI+XG4gICAgICAgIEFkZCBQYXNza2V5XG4gICAgICA8L0J1dHRvbj5cbiAgICAgIDxNb2RhbCBzbHVnPVwicGFzc2tleXMtbW9kYWxcIiBjbGFzc05hbWU9e2Jhc2VDbGFzc30gY2xvc2VPbkJsdXI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtiYXNlQ2xhc3N9X193cmFwcGVyYH0+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gY2xvc2VNb2RhbCgncGFzc2tleXMtbW9kYWwnKX1cbiAgICAgICAgICAgIGJ1dHRvblN0eWxlPVwiaWNvbi1sYWJlbFwiXG4gICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgJHtiYXNlQ2xhc3N9X19jbG9zZS1idXR0b25gfT5cbiAgICAgICAgICAgIDxYSWNvbiBzaXplPXsyNH0gLz5cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7YmFzZUNsYXNzfV9fY29udGVudGB9IHN0eWxlPXt7IG1heFdpZHRoOiAnMzByZW0nIH19PlxuICAgICAgICAgICAgPGgyPkNyZWF0ZSBOZXcgUGFzc2tleTwvaDI+XG4gICAgICAgICAgICA8cD5TZWN1cmVseSBhY2Nlc3MgeW91ciBhY2NvdW50IHdpdGhvdXQgYSBwYXNzd29yZCBieSBjcmVhdGluZyBhIG5ldyBwYXNza2V5LjwvcD5cbiAgICAgICAgICAgIDxBZGRQYXNza2V5Rm9ybSAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvTW9kYWw+XG4gICAgPC8+XG4gIClcbn1cbiJdLCJuYW1lcyI6WyJwYXNza2V5Q2xpZW50IiwiQnV0dG9uIiwiTW9kYWwiLCJ0b2FzdCIsInVzZU1vZGFsIiwiY3JlYXRlQXV0aENsaWVudCIsIlhJY29uIiwiUmVhY3QiLCJ1c2VNZW1vIiwidXNlU3RhdGUiLCJ6IiwidXNlQXBwRm9ybSIsIkZvcm0iLCJGb3JtSW5wdXRXcmFwIiwiYmFzZUNsYXNzIiwiUGFzc0tleUFkZEJ1dHRvbiIsIm9uQWRkIiwiYmFzZVVSTCIsImJhc2VQYXRoIiwib3Blbk1vZGFsIiwiY2xvc2VNb2RhbCIsImF1dGhDbGllbnQiLCJwbHVnaW5zIiwiQWRkUGFzc2tleUZvcm0iLCJpc0xvYWRpbmciLCJzZXRJc0xvYWRpbmciLCJuYW1lU2NoZW1hIiwib2JqZWN0IiwibmFtZSIsInN0cmluZyIsIm1pbiIsImZvcm0iLCJkZWZhdWx0VmFsdWVzIiwib25TdWJtaXQiLCJ2YWx1ZSIsInJlcyIsInBhc3NrZXkiLCJhZGRQYXNza2V5IiwiZXJyb3IiLCJtZXNzYWdlIiwic3VjY2VzcyIsInZhbGlkYXRvcnMiLCJlIiwicHJldmVudERlZmF1bHQiLCJoYW5kbGVTdWJtaXQiLCJjbGFzc05hbWUiLCJBcHBGaWVsZCIsImZpZWxkIiwiVGV4dEZpZWxkIiwidHlwZSIsImxhYmVsIiwicmVxdWlyZWQiLCJBcHBGb3JtIiwiU3VibWl0IiwibG9hZGluZ0xhYmVsIiwib25DbGljayIsInNpemUiLCJidXR0b25TdHlsZSIsInNsdWciLCJjbG9zZU9uQmx1ciIsImRpdiIsInN0eWxlIiwibWF4V2lkdGgiLCJoMiIsInAiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLFNBQVNBLGFBQWEsUUFBUSw4QkFBNkI7QUFDM0QsU0FBU0MsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLEtBQUssRUFBRUMsUUFBUSxRQUFRLGlCQUFnQjtBQUMvRCxTQUFTQyxnQkFBZ0IsUUFBUSxvQkFBbUI7QUFDcEQsU0FBU0MsS0FBSyxRQUFRLGVBQWM7QUFDcEMsT0FBT0MsU0FBU0MsT0FBTyxFQUFFQyxRQUFRLFFBQVEsUUFBTztBQUNoRCxTQUFTQyxDQUFDLFFBQVEsTUFBSztBQUN2QixTQUFTQyxVQUFVLFFBQVEsNkJBQWU7QUFDMUMsU0FBU0MsSUFBSSxFQUFFQyxhQUFhLFFBQVEsZ0NBQWtCO0FBRXRELE1BQU1DLFlBQVk7QUFRbEIsT0FBTyxNQUFNQyxtQkFBb0QsQ0FBQyxFQUFFQyxLQUFLLEVBQUVDLE9BQU8sRUFBRUMsUUFBUSxFQUFFO0lBQzVGLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxVQUFVLEVBQUUsR0FBR2hCO0lBQ2xDLE1BQU1pQixhQUFhYixRQUFRLElBQU1ILGlCQUFpQjtZQUFFWTtZQUFTQztZQUFVSSxTQUFTO2dCQUFDdEI7YUFBZ0I7UUFBQyxJQUFJLEVBQUU7SUFFeEcsTUFBTXVCLGlCQUEyQjtRQUMvQixNQUFNLENBQUNDLFdBQVdDLGFBQWEsR0FBR2hCLFNBQVM7UUFDM0MsTUFBTWlCLGFBQWFoQixFQUFFaUIsTUFBTSxDQUFDO1lBQzFCQyxNQUFNbEIsRUFBRW1CLE1BQU0sR0FBR0MsR0FBRyxDQUFDLEdBQUc7UUFDMUI7UUFFQSxNQUFNQyxPQUFPcEIsV0FBVztZQUN0QnFCLGVBQWU7Z0JBQUVKLE1BQU07WUFBRztZQUMxQkssVUFBVSxPQUFPLEVBQUVDLEtBQUssRUFBRTtnQkFDeEJULGFBQWE7Z0JBQ2IsTUFBTVUsTUFBTSxNQUFNZCxXQUFXZSxPQUFPLENBQUNDLFVBQVUsQ0FBQztvQkFBRVQsTUFBTU0sTUFBTU4sSUFBSTtnQkFBQztnQkFDbkVILGFBQWE7Z0JBQ2IsSUFBSVUsS0FBS0csT0FBTztvQkFDZG5DLE1BQU1tQyxLQUFLLENBQUNILElBQUlHLEtBQUssQ0FBQ0MsT0FBTztvQkFDN0I7Z0JBQ0Y7Z0JBQ0FwQyxNQUFNcUMsT0FBTyxDQUFDO2dCQUNkcEIsV0FBVztnQkFDWCxJQUFJLE9BQU9KLFVBQVUsWUFBWUE7WUFDbkM7WUFDQXlCLFlBQVk7Z0JBQ1ZSLFVBQVVQO1lBQ1o7UUFDRjtRQUVBLHFCQUNFLE1BQUNkO1lBQ0NxQixVQUFVLENBQUNTO2dCQUNUQSxFQUFFQyxjQUFjO2dCQUNoQixLQUFLWixLQUFLYSxZQUFZO1lBQ3hCO1lBQ0FDLFdBQVU7OzhCQUNWLEtBQUNoQztvQkFBY2dDLFdBQVU7OEJBQ3ZCLGNBQUEsS0FBQ2QsS0FBS2UsUUFBUTt3QkFBQ2xCLE1BQUs7a0NBQ2pCLENBQUNtQixzQkFBZSxLQUFDQSxNQUFNQyxTQUFTO2dDQUFDQyxNQUFLO2dDQUFPSixXQUFVO2dDQUFZSyxPQUFNO2dDQUFlQyxRQUFROzs7OzhCQUdyRyxLQUFDcEIsS0FBS3FCLE9BQU87OEJBQ1gsY0FBQSxLQUFDckIsS0FBS3NCLE1BQU07d0JBQUNILE9BQU07d0JBQWlCSSxjQUFhOzs7OztJQUl6RDtJQUVBLHFCQUNFOzswQkFDRSxLQUFDckQ7Z0JBQU9zRCxTQUFTLElBQU1wQyxVQUFVO2dCQUFtQnFDLE1BQUs7Z0JBQVNDLGFBQVk7MEJBQU87OzBCQUdyRixLQUFDdkQ7Z0JBQU13RCxNQUFLO2dCQUFpQmIsV0FBVy9CO2dCQUFXNkMsV0FBVzswQkFDNUQsY0FBQSxNQUFDQztvQkFBSWYsV0FBVyxHQUFHL0IsVUFBVSxTQUFTLENBQUM7O3NDQUNyQyxLQUFDYjs0QkFDQ3NELFNBQVMsSUFBTW5DLFdBQVc7NEJBQzFCcUMsYUFBWTs0QkFDWkQsTUFBSzs0QkFDTFgsV0FBVyxHQUFHL0IsVUFBVSxjQUFjLENBQUM7c0NBQ3ZDLGNBQUEsS0FBQ1I7Z0NBQU1rRCxNQUFNOzs7c0NBRWYsTUFBQ0k7NEJBQUlmLFdBQVcsR0FBRy9CLFVBQVUsU0FBUyxDQUFDOzRCQUFFK0MsT0FBTztnQ0FBRUMsVUFBVTs0QkFBUTs7OENBQ2xFLEtBQUNDOzhDQUFHOzs4Q0FDSixLQUFDQzs4Q0FBRTs7OENBQ0gsS0FBQ3pDOzs7Ozs7OztBQU1iLEVBQUMifQ==