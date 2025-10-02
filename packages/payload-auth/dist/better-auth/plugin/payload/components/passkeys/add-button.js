'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useMemo, useState } from "react";
import { useAppForm } from "../../../../../shared/form";
import { Form, FormInputWrap } from "../../../../../shared/form/ui";
import { Button, Modal, toast, useModal } from "@payloadcms/ui";
import { passkeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { XIcon } from "lucide-react";
import { z } from "zod";
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC9jb21wb25lbnRzL3Bhc3NrZXlzL2FkZC1idXR0b24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50J1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHVzZUFwcEZvcm0gfSBmcm9tICdAL3NoYXJlZC9mb3JtJ1xuaW1wb3J0IHsgRm9ybSwgRm9ybUlucHV0V3JhcCB9IGZyb20gJ0Avc2hhcmVkL2Zvcm0vdWknXG5pbXBvcnQgeyBCdXR0b24sIE1vZGFsLCB0b2FzdCwgdXNlTW9kYWwgfSBmcm9tICdAcGF5bG9hZGNtcy91aSdcbmltcG9ydCB7IHBhc3NrZXlDbGllbnQgfSBmcm9tICdiZXR0ZXItYXV0aC9jbGllbnQvcGx1Z2lucydcbmltcG9ydCB7IGNyZWF0ZUF1dGhDbGllbnQgfSBmcm9tICdiZXR0ZXItYXV0aC9yZWFjdCdcbmltcG9ydCB7IFhJY29uIH0gZnJvbSAnbHVjaWRlLXJlYWN0J1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCdcblxuY29uc3QgYmFzZUNsYXNzID0gJ3Bhc3NrZXlzLW1vZGFsJ1xuXG5pbnRlcmZhY2UgUGFzc0tleUFkZEJ1dHRvblByb3BzIHtcbiAgb25BZGQ/OiAoKSA9PiB2b2lkXG4gIGJhc2VVUkw/OiBzdHJpbmdcbiAgYmFzZVBhdGg/OiBzdHJpbmdcbn1cblxuZXhwb3J0IGNvbnN0IFBhc3NLZXlBZGRCdXR0b246IFJlYWN0LkZDPFBhc3NLZXlBZGRCdXR0b25Qcm9wcz4gPSAoeyBvbkFkZCwgYmFzZVVSTCwgYmFzZVBhdGggfSkgPT4ge1xuICBjb25zdCB7IG9wZW5Nb2RhbCwgY2xvc2VNb2RhbCB9ID0gdXNlTW9kYWwoKVxuICBjb25zdCBhdXRoQ2xpZW50ID0gdXNlTWVtbygoKSA9PiBjcmVhdGVBdXRoQ2xpZW50KHsgYmFzZVVSTCwgYmFzZVBhdGgsIHBsdWdpbnM6IFtwYXNza2V5Q2xpZW50KCldIH0pLCBbXSlcblxuICBjb25zdCBBZGRQYXNza2V5Rm9ybTogUmVhY3QuRkMgPSAoKSA9PiB7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICAgIGNvbnN0IG5hbWVTY2hlbWEgPSB6Lm9iamVjdCh7XG4gICAgICBuYW1lOiB6LnN0cmluZygpLm1pbigxLCAnTmFtZSBpcyByZXF1aXJlZCcpXG4gICAgfSlcblxuICAgIGNvbnN0IGZvcm0gPSB1c2VBcHBGb3JtKHtcbiAgICAgIGRlZmF1bHRWYWx1ZXM6IHsgbmFtZTogJycgfSxcbiAgICAgIG9uU3VibWl0OiBhc3luYyAoeyB2YWx1ZSB9KSA9PiB7XG4gICAgICAgIHNldElzTG9hZGluZyh0cnVlKVxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBhdXRoQ2xpZW50LnBhc3NrZXkuYWRkUGFzc2tleSh7IG5hbWU6IHZhbHVlLm5hbWUgfSlcbiAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKVxuICAgICAgICBpZiAocmVzPy5lcnJvcikge1xuICAgICAgICAgIHRvYXN0LmVycm9yKHJlcy5lcnJvci5tZXNzYWdlKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHRvYXN0LnN1Y2Nlc3MoJ1Bhc3NrZXkgYWRkZWQgc3VjY2Vzc2Z1bGx5JylcbiAgICAgICAgY2xvc2VNb2RhbCgncGFzc2tleXMtbW9kYWwnKVxuICAgICAgICBpZiAodHlwZW9mIG9uQWRkID09PSAnZnVuY3Rpb24nKSBvbkFkZCgpXG4gICAgICB9LFxuICAgICAgdmFsaWRhdG9yczoge1xuICAgICAgICBvblN1Ym1pdDogbmFtZVNjaGVtYVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gKFxuICAgICAgPEZvcm1cbiAgICAgICAgb25TdWJtaXQ9eyhlKSA9PiB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgdm9pZCBmb3JtLmhhbmRsZVN1Ym1pdCgpXG4gICAgICAgIH19XG4gICAgICAgIGNsYXNzTmFtZT1cInBhc3NrZXlzLWFkZC1mb3JtXCI+XG4gICAgICAgIDxGb3JtSW5wdXRXcmFwIGNsYXNzTmFtZT1cInBhc3NrZXlzLWFkZC1mb3JtX19pbnB1dFdyYXBcIj5cbiAgICAgICAgICA8Zm9ybS5BcHBGaWVsZCBuYW1lPVwibmFtZVwiPlxuICAgICAgICAgICAgeyhmaWVsZDogYW55KSA9PiA8ZmllbGQuVGV4dEZpZWxkIHR5cGU9XCJ0ZXh0XCIgY2xhc3NOYW1lPVwidGV4dCBuYW1lXCIgbGFiZWw9XCJQYXNza2V5IE5hbWVcIiByZXF1aXJlZCAvPn1cbiAgICAgICAgICA8L2Zvcm0uQXBwRmllbGQ+XG4gICAgICAgIDwvRm9ybUlucHV0V3JhcD5cbiAgICAgICAgPGZvcm0uQXBwRm9ybT5cbiAgICAgICAgICA8Zm9ybS5TdWJtaXQgbGFiZWw9XCJDcmVhdGUgUGFzc2tleVwiIGxvYWRpbmdMYWJlbD1cIkNyZWF0aW5nXCIgLz5cbiAgICAgICAgPC9mb3JtLkFwcEZvcm0+XG4gICAgICA8L0Zvcm0+XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBvcGVuTW9kYWwoJ3Bhc3NrZXlzLW1vZGFsJyl9IHNpemU9XCJtZWRpdW1cIiBidXR0b25TdHlsZT1cInBpbGxcIj5cbiAgICAgICAgQWRkIFBhc3NrZXlcbiAgICAgIDwvQnV0dG9uPlxuICAgICAgPE1vZGFsIHNsdWc9XCJwYXNza2V5cy1tb2RhbFwiIGNsYXNzTmFtZT17YmFzZUNsYXNzfSBjbG9zZU9uQmx1cj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake2Jhc2VDbGFzc31fX3dyYXBwZXJgfT5cbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBjbG9zZU1vZGFsKCdwYXNza2V5cy1tb2RhbCcpfVxuICAgICAgICAgICAgYnV0dG9uU3R5bGU9XCJpY29uLWxhYmVsXCJcbiAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICBjbGFzc05hbWU9e2Ake2Jhc2VDbGFzc31fX2Nsb3NlLWJ1dHRvbmB9PlxuICAgICAgICAgICAgPFhJY29uIHNpemU9ezI0fSAvPlxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtiYXNlQ2xhc3N9X19jb250ZW50YH0gc3R5bGU9e3sgbWF4V2lkdGg6ICczMHJlbScgfX0+XG4gICAgICAgICAgICA8aDI+Q3JlYXRlIE5ldyBQYXNza2V5PC9oMj5cbiAgICAgICAgICAgIDxwPlNlY3VyZWx5IGFjY2VzcyB5b3VyIGFjY291bnQgd2l0aG91dCBhIHBhc3N3b3JkIGJ5IGNyZWF0aW5nIGEgbmV3IHBhc3NrZXkuPC9wPlxuICAgICAgICAgICAgPEFkZFBhc3NrZXlGb3JtIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9Nb2RhbD5cbiAgICA8Lz5cbiAgKVxufVxuIl0sIm5hbWVzIjpbIlJlYWN0IiwidXNlTWVtbyIsInVzZVN0YXRlIiwidXNlQXBwRm9ybSIsIkZvcm0iLCJGb3JtSW5wdXRXcmFwIiwiQnV0dG9uIiwiTW9kYWwiLCJ0b2FzdCIsInVzZU1vZGFsIiwicGFzc2tleUNsaWVudCIsImNyZWF0ZUF1dGhDbGllbnQiLCJYSWNvbiIsInoiLCJiYXNlQ2xhc3MiLCJQYXNzS2V5QWRkQnV0dG9uIiwib25BZGQiLCJiYXNlVVJMIiwiYmFzZVBhdGgiLCJvcGVuTW9kYWwiLCJjbG9zZU1vZGFsIiwiYXV0aENsaWVudCIsInBsdWdpbnMiLCJBZGRQYXNza2V5Rm9ybSIsImlzTG9hZGluZyIsInNldElzTG9hZGluZyIsIm5hbWVTY2hlbWEiLCJvYmplY3QiLCJuYW1lIiwic3RyaW5nIiwibWluIiwiZm9ybSIsImRlZmF1bHRWYWx1ZXMiLCJvblN1Ym1pdCIsInZhbHVlIiwicmVzIiwicGFzc2tleSIsImFkZFBhc3NrZXkiLCJlcnJvciIsIm1lc3NhZ2UiLCJzdWNjZXNzIiwidmFsaWRhdG9ycyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImhhbmRsZVN1Ym1pdCIsImNsYXNzTmFtZSIsIkFwcEZpZWxkIiwiZmllbGQiLCJUZXh0RmllbGQiLCJ0eXBlIiwibGFiZWwiLCJyZXF1aXJlZCIsIkFwcEZvcm0iLCJTdWJtaXQiLCJsb2FkaW5nTGFiZWwiLCJvbkNsaWNrIiwic2l6ZSIsImJ1dHRvblN0eWxlIiwic2x1ZyIsImNsb3NlT25CbHVyIiwiZGl2Iiwic3R5bGUiLCJtYXhXaWR0aCIsImgyIiwicCJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsT0FBT0EsU0FBU0MsT0FBTyxFQUFFQyxRQUFRLFFBQVEsUUFBTztBQUNoRCxTQUFTQyxVQUFVLFFBQVEsNkJBQWU7QUFDMUMsU0FBU0MsSUFBSSxFQUFFQyxhQUFhLFFBQVEsZ0NBQWtCO0FBQ3RELFNBQVNDLE1BQU0sRUFBRUMsS0FBSyxFQUFFQyxLQUFLLEVBQUVDLFFBQVEsUUFBUSxpQkFBZ0I7QUFDL0QsU0FBU0MsYUFBYSxRQUFRLDZCQUE0QjtBQUMxRCxTQUFTQyxnQkFBZ0IsUUFBUSxvQkFBbUI7QUFDcEQsU0FBU0MsS0FBSyxRQUFRLGVBQWM7QUFDcEMsU0FBU0MsQ0FBQyxRQUFRLE1BQUs7QUFFdkIsTUFBTUMsWUFBWTtBQVFsQixPQUFPLE1BQU1DLG1CQUFvRCxDQUFDLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxFQUFFQyxRQUFRLEVBQUU7SUFDNUYsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLFVBQVUsRUFBRSxHQUFHWDtJQUNsQyxNQUFNWSxhQUFhcEIsUUFBUSxJQUFNVSxpQkFBaUI7WUFBRU07WUFBU0M7WUFBVUksU0FBUztnQkFBQ1o7YUFBZ0I7UUFBQyxJQUFJLEVBQUU7SUFFeEcsTUFBTWEsaUJBQTJCO1FBQy9CLE1BQU0sQ0FBQ0MsV0FBV0MsYUFBYSxHQUFHdkIsU0FBUztRQUMzQyxNQUFNd0IsYUFBYWIsRUFBRWMsTUFBTSxDQUFDO1lBQzFCQyxNQUFNZixFQUFFZ0IsTUFBTSxHQUFHQyxHQUFHLENBQUMsR0FBRztRQUMxQjtRQUVBLE1BQU1DLE9BQU81QixXQUFXO1lBQ3RCNkIsZUFBZTtnQkFBRUosTUFBTTtZQUFHO1lBQzFCSyxVQUFVLE9BQU8sRUFBRUMsS0FBSyxFQUFFO2dCQUN4QlQsYUFBYTtnQkFDYixNQUFNVSxNQUFNLE1BQU1kLFdBQVdlLE9BQU8sQ0FBQ0MsVUFBVSxDQUFDO29CQUFFVCxNQUFNTSxNQUFNTixJQUFJO2dCQUFDO2dCQUNuRUgsYUFBYTtnQkFDYixJQUFJVSxLQUFLRyxPQUFPO29CQUNkOUIsTUFBTThCLEtBQUssQ0FBQ0gsSUFBSUcsS0FBSyxDQUFDQyxPQUFPO29CQUM3QjtnQkFDRjtnQkFDQS9CLE1BQU1nQyxPQUFPLENBQUM7Z0JBQ2RwQixXQUFXO2dCQUNYLElBQUksT0FBT0osVUFBVSxZQUFZQTtZQUNuQztZQUNBeUIsWUFBWTtnQkFDVlIsVUFBVVA7WUFDWjtRQUNGO1FBRUEscUJBQ0UsTUFBQ3RCO1lBQ0M2QixVQUFVLENBQUNTO2dCQUNUQSxFQUFFQyxjQUFjO2dCQUNoQixLQUFLWixLQUFLYSxZQUFZO1lBQ3hCO1lBQ0FDLFdBQVU7OzhCQUNWLEtBQUN4QztvQkFBY3dDLFdBQVU7OEJBQ3ZCLGNBQUEsS0FBQ2QsS0FBS2UsUUFBUTt3QkFBQ2xCLE1BQUs7a0NBQ2pCLENBQUNtQixzQkFBZSxLQUFDQSxNQUFNQyxTQUFTO2dDQUFDQyxNQUFLO2dDQUFPSixXQUFVO2dDQUFZSyxPQUFNO2dDQUFlQyxRQUFROzs7OzhCQUdyRyxLQUFDcEIsS0FBS3FCLE9BQU87OEJBQ1gsY0FBQSxLQUFDckIsS0FBS3NCLE1BQU07d0JBQUNILE9BQU07d0JBQWlCSSxjQUFhOzs7OztJQUl6RDtJQUVBLHFCQUNFOzswQkFDRSxLQUFDaEQ7Z0JBQU9pRCxTQUFTLElBQU1wQyxVQUFVO2dCQUFtQnFDLE1BQUs7Z0JBQVNDLGFBQVk7MEJBQU87OzBCQUdyRixLQUFDbEQ7Z0JBQU1tRCxNQUFLO2dCQUFpQmIsV0FBVy9CO2dCQUFXNkMsV0FBVzswQkFDNUQsY0FBQSxNQUFDQztvQkFBSWYsV0FBVyxHQUFHL0IsVUFBVSxTQUFTLENBQUM7O3NDQUNyQyxLQUFDUjs0QkFDQ2lELFNBQVMsSUFBTW5DLFdBQVc7NEJBQzFCcUMsYUFBWTs0QkFDWkQsTUFBSzs0QkFDTFgsV0FBVyxHQUFHL0IsVUFBVSxjQUFjLENBQUM7c0NBQ3ZDLGNBQUEsS0FBQ0Y7Z0NBQU00QyxNQUFNOzs7c0NBRWYsTUFBQ0k7NEJBQUlmLFdBQVcsR0FBRy9CLFVBQVUsU0FBUyxDQUFDOzRCQUFFK0MsT0FBTztnQ0FBRUMsVUFBVTs0QkFBUTs7OENBQ2xFLEtBQUNDOzhDQUFHOzs4Q0FDSixLQUFDQzs4Q0FBRTs7OENBQ0gsS0FBQ3pDOzs7Ozs7OztBQU1iLEVBQUMifQ==