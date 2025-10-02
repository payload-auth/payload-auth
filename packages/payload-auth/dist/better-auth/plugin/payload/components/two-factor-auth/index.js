'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import "./index.scss";
import React, { useMemo, useState } from "react";
import { XIcon, Copy } from "lucide-react";
import { Button, Modal, toast, useModal, useTranslation, useFormFields, useField } from "@payloadcms/ui";
import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
import { Form, FormInputWrap } from "../../../../../shared/form/ui";
import { z } from "zod";
import { passwordField } from "../../../../../shared/form/validation";
import { QRCodeSVG } from "qrcode.react";
import { useAppForm } from "../../../../../shared/form";
const baseClass = 'two-factor-auth-modal';
export const TwoFactorAuth = ({ baseURL, basePath })=>{
    const [totpURI, setTotpURI] = useState('');
    const [backupCodes, setBackupCodes] = useState(null);
    const [formState, setFormState] = useState('enable');
    const { openModal, closeModal } = useModal();
    const { t } = useTranslation();
    const twoFactorEnabledField = useFormFields(([fields])=>fields.twoFactorEnabled);
    const twoFactorEnabled = Boolean(twoFactorEnabledField?.value);
    const { setValue: setTwoFactorEnabled } = useField({
        path: 'twoFactorEnabled'
    });
    const authClient = useMemo(()=>createAuthClient({
            baseURL,
            basePath,
            plugins: [
                twoFactorClient()
            ]
        }), []);
    const copyURI = async ()=>{
        if (!totpURI) return;
        try {
            await navigator.clipboard.writeText(totpURI);
            toast.success('Copied');
        } catch  {
            toast.error('Failed to copy');
        }
    };
    // Form Schemas
    const passwordSchema = z.object({
        password: passwordField({
            t
        })
    });
    const otpSchema = z.object({
        otp: z.string().length(6, 'Code must be 6 digits').refine((val)=>/^\d{6}$/.test(val), 'Code must be numeric')
    });
    const EnableForm = ()=>{
        const [isLoading, setIsLoading] = useState(false);
        const form = useAppForm({
            defaultValues: {
                password: ''
            },
            onSubmit: async ({ value })=>{
                setIsLoading(true);
                const { data, error } = await authClient.twoFactor.enable({
                    password: value.password
                });
                setIsLoading(false);
                if (error) {
                    toast.error(error.message);
                    return;
                }
                setTotpURI(data.totpURI);
                if (data && 'backupCodes' in data && data.backupCodes) {
                    setBackupCodes(Array.isArray(data.backupCodes) ? data.backupCodes : String(data.backupCodes).split(/\s+/).filter(Boolean));
                } else {
                    setBackupCodes(null);
                }
                setFormState('verify');
            },
            validators: {
                onSubmit: passwordSchema
            }
        });
        return /*#__PURE__*/ _jsxs(Form, {
            onSubmit: (e)=>{
                e.preventDefault();
                void form.handleSubmit();
            },
            className: "two-factor-enable-form",
            children: [
                /*#__PURE__*/ _jsx(FormInputWrap, {
                    className: "two-factor-enable-form__inputWrap",
                    children: /*#__PURE__*/ _jsx(form.AppField, {
                        name: "password",
                        children: (field)=>/*#__PURE__*/ _jsx(field.TextField, {
                                type: "password",
                                className: "password",
                                label: "Password",
                                required: true
                            })
                    })
                }),
                /*#__PURE__*/ _jsx(form.AppForm, {
                    children: /*#__PURE__*/ _jsx(form.Submit, {
                        label: "Enable",
                        loadingLabel: "Enabling"
                    })
                })
            ]
        });
    };
    const VerifyForm = ()=>{
        const [isLoading, setIsLoading] = useState(false);
        const form = useAppForm({
            defaultValues: {
                otp: ''
            },
            onSubmit: async ({ value })=>{
                setIsLoading(true);
                const { data, error } = await authClient.twoFactor.verifyTotp({
                    code: value.otp
                });
                setIsLoading(false);
                if (error) {
                    toast.error(error.message);
                    return;
                }
                if (data && 'backupCodes' in data && data.backupCodes) {
                    setBackupCodes(Array.isArray(data.backupCodes) ? data.backupCodes : String(data.backupCodes).split(/\s+/).filter(Boolean));
                }
                toast.success('Two‑factor verified & enabled');
                setTwoFactorEnabled(true);
                setFormState('backupCodes');
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
            className: "two-factor-verify-form",
            children: [
                /*#__PURE__*/ _jsx(FormInputWrap, {
                    className: "tf__inputWrap",
                    children: /*#__PURE__*/ _jsx(form.AppField, {
                        name: "otp",
                        children: (field)=>/*#__PURE__*/ _jsx(field.TextField, {
                                type: "text",
                                className: "text otp",
                                label: "6‑digit Code",
                                required: true
                            })
                    })
                }),
                /*#__PURE__*/ _jsx(form.AppForm, {
                    children: /*#__PURE__*/ _jsx(form.Submit, {
                        label: "Verify",
                        loadingLabel: "Verifying"
                    })
                })
            ]
        });
    };
    const DisableForm = ()=>{
        const form = useAppForm({
            defaultValues: {
                password: ''
            },
            onSubmit: async ({ value })=>{
                await authClient.twoFactor.disable({
                    password: value.password
                }, {
                    onSuccess () {
                        toast.success('Two‑factor disabled');
                        setTwoFactorEnabled(false);
                        closeModal('two-factor-auth-modal');
                        return undefined;
                    },
                    onError (ctx) {
                        toast.error(ctx.error.message);
                    }
                });
            },
            validators: {
                onSubmit: passwordSchema
            }
        });
        return /*#__PURE__*/ _jsxs(Form, {
            onSubmit: (e)=>{
                e.preventDefault();
                void form.handleSubmit();
            },
            className: "two-factor-disable-form mt-4",
            children: [
                /*#__PURE__*/ _jsx(FormInputWrap, {
                    className: "two-factor-disable-form__inputWrap",
                    children: /*#__PURE__*/ _jsx(form.AppField, {
                        name: "password",
                        children: (field)=>/*#__PURE__*/ _jsx(field.TextField, {
                                type: "password",
                                className: "password",
                                label: "Password",
                                required: true
                            })
                    })
                }),
                /*#__PURE__*/ _jsx(form.AppForm, {
                    children: /*#__PURE__*/ _jsx(form.Submit, {
                        label: "Disable Two‑Factor",
                        loadingLabel: "Disabling"
                    })
                })
            ]
        });
    };
    return /*#__PURE__*/ _jsxs("div", {
        className: "two-factor-auth-field",
        children: [
            twoFactorEnabled ? /*#__PURE__*/ _jsx(Button, {
                onClick: ()=>{
                    setFormState('disable');
                    openModal('two-factor-auth-modal');
                },
                size: "medium",
                buttonStyle: "pill",
                children: "Disable Two-Factor"
            }) : /*#__PURE__*/ _jsx(Button, {
                onClick: ()=>{
                    setFormState('enable');
                    openModal('two-factor-auth-modal');
                },
                size: "medium",
                buttonStyle: "pill",
                children: "Enable Two-Factor"
            }),
            /*#__PURE__*/ _jsx(Modal, {
                slug: "two-factor-auth-modal",
                className: baseClass,
                closeOnBlur: true,
                children: /*#__PURE__*/ _jsxs("div", {
                    className: `${baseClass}__wrapper`,
                    children: [
                        /*#__PURE__*/ _jsx(Button, {
                            onClick: ()=>closeModal('two-factor-auth-modal'),
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
                                maxWidth: '38rem'
                            },
                            children: [
                                formState === 'enable' && /*#__PURE__*/ _jsxs(_Fragment, {
                                    children: [
                                        /*#__PURE__*/ _jsx("h2", {
                                            children: "Enable Two‑Factor"
                                        }),
                                        /*#__PURE__*/ _jsx(EnableForm, {})
                                    ]
                                }),
                                formState === 'verify' && /*#__PURE__*/ _jsxs(_Fragment, {
                                    children: [
                                        /*#__PURE__*/ _jsx("h2", {
                                            children: "Verify Two‑Factor"
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "two-factor-auth-modal__verify-block",
                                            children: [
                                                /*#__PURE__*/ _jsx("p", {
                                                    children: "Scan the QR code with your authenticator app or copy the URI."
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "two-factor-auth-modal__qrcode",
                                                    children: /*#__PURE__*/ _jsx(QRCodeSVG, {
                                                        value: totpURI,
                                                        size: 200
                                                    })
                                                }),
                                                /*#__PURE__*/ _jsxs(Button, {
                                                    size: "small",
                                                    buttonStyle: "transparent",
                                                    onClick: copyURI,
                                                    className: "two-factor-auth-modal__copy-btn",
                                                    children: [
                                                        /*#__PURE__*/ _jsx(Copy, {
                                                            size: 18,
                                                            className: "two-factor-auth-modal__copy-icon"
                                                        }),
                                                        " Copy URI"
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsx(VerifyForm, {})
                                            ]
                                        })
                                    ]
                                }),
                                formState === 'backupCodes' && backupCodes && /*#__PURE__*/ _jsxs(_Fragment, {
                                    children: [
                                        /*#__PURE__*/ _jsx("h2", {
                                            children: "Backup Codes"
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "two-factor-auth-modal__backup-codes",
                                            children: [
                                                /*#__PURE__*/ _jsx("ul", {
                                                    children: backupCodes.map((code, i)=>/*#__PURE__*/ _jsx("li", {
                                                            className: "two-factor-auth-modal__backup-code",
                                                            children: code
                                                        }, i))
                                                }),
                                                /*#__PURE__*/ _jsx("p", {
                                                    className: "two-factor-auth-modal__backup-desc",
                                                    children: "Store these codes in a safe place. Each code can be used once if you lose access to your authenticator."
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsx(Button, {
                                            onClick: ()=>closeModal('two-factor-auth-modal'),
                                            buttonStyle: "primary",
                                            size: "large",
                                            className: "two-factor-auth-modal__backup-codes-close-button",
                                            children: "Saved them!"
                                        })
                                    ]
                                }),
                                formState === 'disable' && /*#__PURE__*/ _jsxs(_Fragment, {
                                    children: [
                                        /*#__PURE__*/ _jsx("h2", {
                                            children: "Two‑Factor Authentication"
                                        }),
                                        /*#__PURE__*/ _jsx(DisableForm, {})
                                    ]
                                })
                            ]
                        })
                    ]
                })
            })
        ]
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC9jb21wb25lbnRzL3R3by1mYWN0b3ItYXV0aC9pbmRleC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBjbGllbnQnXG5cbmltcG9ydCAnLi9pbmRleC5zY3NzJ1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IFhJY29uLCBDb3B5IH0gZnJvbSAnbHVjaWRlLXJlYWN0J1xuaW1wb3J0IHsgQnV0dG9uLCBNb2RhbCwgdG9hc3QsIHVzZU1vZGFsLCB1c2VUcmFuc2xhdGlvbiwgdXNlRm9ybUZpZWxkcywgdXNlRmllbGQgfSBmcm9tICdAcGF5bG9hZGNtcy91aSdcbmltcG9ydCB7IGNyZWF0ZUF1dGhDbGllbnQgfSBmcm9tICdiZXR0ZXItYXV0aC9yZWFjdCdcbmltcG9ydCB7IHR3b0ZhY3RvckNsaWVudCB9IGZyb20gJ2JldHRlci1hdXRoL2NsaWVudC9wbHVnaW5zJ1xuaW1wb3J0IHsgRm9ybSwgRm9ybUlucHV0V3JhcCB9IGZyb20gJ0Avc2hhcmVkL2Zvcm0vdWknXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJ1xuaW1wb3J0IHsgcGFzc3dvcmRGaWVsZCB9IGZyb20gJ0Avc2hhcmVkL2Zvcm0vdmFsaWRhdGlvbidcbmltcG9ydCB7IFFSQ29kZVNWRyB9IGZyb20gJ3FyY29kZS5yZWFjdCdcbmltcG9ydCB7IHVzZUFwcEZvcm0gfSBmcm9tICdAL3NoYXJlZC9mb3JtJ1xuXG5jb25zdCBiYXNlQ2xhc3MgPSAndHdvLWZhY3Rvci1hdXRoLW1vZGFsJ1xuXG50eXBlIFR3b0ZhY3RvckF1dGhQcm9wcyA9IHtcbiAgYmFzZVVSTD86IHN0cmluZ1xuICBiYXNlUGF0aD86IHN0cmluZ1xufVxuXG5leHBvcnQgY29uc3QgVHdvRmFjdG9yQXV0aDogUmVhY3QuRkM8VHdvRmFjdG9yQXV0aFByb3BzPiA9ICh7IGJhc2VVUkwsIGJhc2VQYXRoIH0pID0+IHtcbiAgY29uc3QgW3RvdHBVUkksIHNldFRvdHBVUkldID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtiYWNrdXBDb2Rlcywgc2V0QmFja3VwQ29kZXNdID0gdXNlU3RhdGU8c3RyaW5nW10gfCBudWxsPihudWxsKVxuICBjb25zdCBbZm9ybVN0YXRlLCBzZXRGb3JtU3RhdGVdID0gdXNlU3RhdGU8J2VuYWJsZScgfCAndmVyaWZ5JyB8ICdiYWNrdXBDb2RlcycgfCAnZGlzYWJsZSc+KCdlbmFibGUnKVxuICBjb25zdCB7IG9wZW5Nb2RhbCwgY2xvc2VNb2RhbCB9ID0gdXNlTW9kYWwoKVxuICBjb25zdCB7IHQgfSA9IHVzZVRyYW5zbGF0aW9uKClcbiAgY29uc3QgdHdvRmFjdG9yRW5hYmxlZEZpZWxkID0gdXNlRm9ybUZpZWxkcygoW2ZpZWxkc10pID0+IGZpZWxkcy50d29GYWN0b3JFbmFibGVkKVxuICBjb25zdCB0d29GYWN0b3JFbmFibGVkID0gQm9vbGVhbih0d29GYWN0b3JFbmFibGVkRmllbGQ/LnZhbHVlKVxuICBjb25zdCB7IHNldFZhbHVlOiBzZXRUd29GYWN0b3JFbmFibGVkIH0gPSB1c2VGaWVsZCh7IHBhdGg6ICd0d29GYWN0b3JFbmFibGVkJyB9KVxuXG4gIGNvbnN0IGF1dGhDbGllbnQgPSB1c2VNZW1vKCgpID0+IGNyZWF0ZUF1dGhDbGllbnQoeyBiYXNlVVJMLCBiYXNlUGF0aCwgcGx1Z2luczogW3R3b0ZhY3RvckNsaWVudCgpXSB9KSwgW10pXG5cbiAgY29uc3QgY29weVVSSSA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIXRvdHBVUkkpIHJldHVyblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0b3RwVVJJKVxuICAgICAgdG9hc3Quc3VjY2VzcygnQ29waWVkJylcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRvYXN0LmVycm9yKCdGYWlsZWQgdG8gY29weScpXG4gICAgfVxuICB9XG5cbiAgLy8gRm9ybSBTY2hlbWFzXG4gIGNvbnN0IHBhc3N3b3JkU2NoZW1hID0gei5vYmplY3Qoe1xuICAgIHBhc3N3b3JkOiBwYXNzd29yZEZpZWxkKHsgdCB9KVxuICB9KVxuXG4gIGNvbnN0IG90cFNjaGVtYSA9IHoub2JqZWN0KHtcbiAgICBvdHA6IHpcbiAgICAgIC5zdHJpbmcoKVxuICAgICAgLmxlbmd0aCg2LCAnQ29kZSBtdXN0IGJlIDYgZGlnaXRzJylcbiAgICAgIC5yZWZpbmUoKHZhbCkgPT4gL15cXGR7Nn0kLy50ZXN0KHZhbCksICdDb2RlIG11c3QgYmUgbnVtZXJpYycpXG4gIH0pXG5cbiAgY29uc3QgRW5hYmxlRm9ybSA9ICgpID0+IHtcbiAgICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gICAgY29uc3QgZm9ybSA9IHVzZUFwcEZvcm0oe1xuICAgICAgZGVmYXVsdFZhbHVlczogeyBwYXNzd29yZDogJycgfSxcbiAgICAgIG9uU3VibWl0OiBhc3luYyAoeyB2YWx1ZSB9OiB7IHZhbHVlOiB7IHBhc3N3b3JkOiBzdHJpbmcgfSB9KSA9PiB7XG4gICAgICAgIHNldElzTG9hZGluZyh0cnVlKVxuICAgICAgICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBhdXRoQ2xpZW50LnR3b0ZhY3Rvci5lbmFibGUoeyBwYXNzd29yZDogdmFsdWUucGFzc3dvcmQgfSlcbiAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKVxuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICB0b2FzdC5lcnJvcihlcnJvci5tZXNzYWdlKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHNldFRvdHBVUkkoZGF0YS50b3RwVVJJKVxuICAgICAgICBpZiAoZGF0YSAmJiAnYmFja3VwQ29kZXMnIGluIGRhdGEgJiYgZGF0YS5iYWNrdXBDb2Rlcykge1xuICAgICAgICAgIHNldEJhY2t1cENvZGVzKEFycmF5LmlzQXJyYXkoZGF0YS5iYWNrdXBDb2RlcykgPyBkYXRhLmJhY2t1cENvZGVzIDogU3RyaW5nKGRhdGEuYmFja3VwQ29kZXMpLnNwbGl0KC9cXHMrLykuZmlsdGVyKEJvb2xlYW4pKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldEJhY2t1cENvZGVzKG51bGwpXG4gICAgICAgIH1cbiAgICAgICAgc2V0Rm9ybVN0YXRlKCd2ZXJpZnknKVxuICAgICAgfSxcbiAgICAgIHZhbGlkYXRvcnM6IHsgb25TdWJtaXQ6IHBhc3N3b3JkU2NoZW1hIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxGb3JtXG4gICAgICAgIG9uU3VibWl0PXsoZSkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIHZvaWQgZm9ybS5oYW5kbGVTdWJtaXQoKVxuICAgICAgICB9fVxuICAgICAgICBjbGFzc05hbWU9XCJ0d28tZmFjdG9yLWVuYWJsZS1mb3JtXCI+XG4gICAgICAgIDxGb3JtSW5wdXRXcmFwIGNsYXNzTmFtZT1cInR3by1mYWN0b3ItZW5hYmxlLWZvcm1fX2lucHV0V3JhcFwiPlxuICAgICAgICAgIDxmb3JtLkFwcEZpZWxkXG4gICAgICAgICAgICBuYW1lPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgY2hpbGRyZW49eyhmaWVsZDogYW55KSA9PiA8ZmllbGQuVGV4dEZpZWxkIHR5cGU9XCJwYXNzd29yZFwiIGNsYXNzTmFtZT1cInBhc3N3b3JkXCIgbGFiZWw9XCJQYXNzd29yZFwiIHJlcXVpcmVkIC8+fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvRm9ybUlucHV0V3JhcD5cbiAgICAgICAgPGZvcm0uQXBwRm9ybSBjaGlsZHJlbj17PGZvcm0uU3VibWl0IGxhYmVsPVwiRW5hYmxlXCIgbG9hZGluZ0xhYmVsPVwiRW5hYmxpbmdcIiAvPn0gLz5cbiAgICAgIDwvRm9ybT5cbiAgICApXG4gIH1cblxuICBjb25zdCBWZXJpZnlGb3JtID0gKCkgPT4ge1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgICBjb25zdCBmb3JtID0gdXNlQXBwRm9ybSh7XG4gICAgICBkZWZhdWx0VmFsdWVzOiB7IG90cDogJycgfSxcbiAgICAgIG9uU3VibWl0OiBhc3luYyAoeyB2YWx1ZSB9OiB7IHZhbHVlOiB7IG90cDogc3RyaW5nIH0gfSkgPT4ge1xuICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSlcbiAgICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgYXV0aENsaWVudC50d29GYWN0b3IudmVyaWZ5VG90cCh7IGNvZGU6IHZhbHVlLm90cCB9KVxuICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpXG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIHRvYXN0LmVycm9yKGVycm9yLm1lc3NhZ2UpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGEgJiYgJ2JhY2t1cENvZGVzJyBpbiBkYXRhICYmIGRhdGEuYmFja3VwQ29kZXMpIHtcbiAgICAgICAgICBzZXRCYWNrdXBDb2RlcyhBcnJheS5pc0FycmF5KGRhdGEuYmFja3VwQ29kZXMpID8gZGF0YS5iYWNrdXBDb2RlcyA6IFN0cmluZyhkYXRhLmJhY2t1cENvZGVzKS5zcGxpdCgvXFxzKy8pLmZpbHRlcihCb29sZWFuKSlcbiAgICAgICAgfVxuICAgICAgICB0b2FzdC5zdWNjZXNzKCdUd2/igJFmYWN0b3IgdmVyaWZpZWQgJiBlbmFibGVkJylcbiAgICAgICAgc2V0VHdvRmFjdG9yRW5hYmxlZCh0cnVlKVxuICAgICAgICBzZXRGb3JtU3RhdGUoJ2JhY2t1cENvZGVzJylcbiAgICAgIH0sXG4gICAgICB2YWxpZGF0b3JzOiB7IG9uU3VibWl0OiBvdHBTY2hlbWEgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gKFxuICAgICAgPEZvcm1cbiAgICAgICAgb25TdWJtaXQ9eyhlKSA9PiB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgdm9pZCBmb3JtLmhhbmRsZVN1Ym1pdCgpXG4gICAgICAgIH19XG4gICAgICAgIGNsYXNzTmFtZT1cInR3by1mYWN0b3ItdmVyaWZ5LWZvcm1cIj5cbiAgICAgICAgPEZvcm1JbnB1dFdyYXAgY2xhc3NOYW1lPVwidGZfX2lucHV0V3JhcFwiPlxuICAgICAgICAgIDxmb3JtLkFwcEZpZWxkXG4gICAgICAgICAgICBuYW1lPVwib3RwXCJcbiAgICAgICAgICAgIGNoaWxkcmVuPXsoZmllbGQ6IGFueSkgPT4gPGZpZWxkLlRleHRGaWVsZCB0eXBlPVwidGV4dFwiIGNsYXNzTmFtZT1cInRleHQgb3RwXCIgbGFiZWw9XCI24oCRZGlnaXQgQ29kZVwiIHJlcXVpcmVkIC8+fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvRm9ybUlucHV0V3JhcD5cbiAgICAgICAgPGZvcm0uQXBwRm9ybSBjaGlsZHJlbj17PGZvcm0uU3VibWl0IGxhYmVsPVwiVmVyaWZ5XCIgbG9hZGluZ0xhYmVsPVwiVmVyaWZ5aW5nXCIgLz59IC8+XG4gICAgICA8L0Zvcm0+XG4gICAgKVxuICB9XG5cbiAgY29uc3QgRGlzYWJsZUZvcm0gPSAoKSA9PiB7XG4gICAgY29uc3QgZm9ybSA9IHVzZUFwcEZvcm0oe1xuICAgICAgZGVmYXVsdFZhbHVlczogeyBwYXNzd29yZDogJycgfSxcbiAgICAgIG9uU3VibWl0OiBhc3luYyAoeyB2YWx1ZSB9OiB7IHZhbHVlOiB7IHBhc3N3b3JkOiBzdHJpbmcgfSB9KSA9PiB7XG4gICAgICAgIGF3YWl0IGF1dGhDbGllbnQudHdvRmFjdG9yLmRpc2FibGUoXG4gICAgICAgICAgeyBwYXNzd29yZDogdmFsdWUucGFzc3dvcmQgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBvblN1Y2Nlc3MoKSB7XG4gICAgICAgICAgICAgIHRvYXN0LnN1Y2Nlc3MoJ1R3b+KAkWZhY3RvciBkaXNhYmxlZCcpXG4gICAgICAgICAgICAgIHNldFR3b0ZhY3RvckVuYWJsZWQoZmFsc2UpXG4gICAgICAgICAgICAgIGNsb3NlTW9kYWwoJ3R3by1mYWN0b3ItYXV0aC1tb2RhbCcpXG4gICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkVycm9yKGN0eDogYW55KSB7XG4gICAgICAgICAgICAgIHRvYXN0LmVycm9yKGN0eC5lcnJvci5tZXNzYWdlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgfSxcbiAgICAgIHZhbGlkYXRvcnM6IHsgb25TdWJtaXQ6IHBhc3N3b3JkU2NoZW1hIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxGb3JtXG4gICAgICAgIG9uU3VibWl0PXsoZSkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIHZvaWQgZm9ybS5oYW5kbGVTdWJtaXQoKVxuICAgICAgICB9fVxuICAgICAgICBjbGFzc05hbWU9XCJ0d28tZmFjdG9yLWRpc2FibGUtZm9ybSBtdC00XCI+XG4gICAgICAgIDxGb3JtSW5wdXRXcmFwIGNsYXNzTmFtZT1cInR3by1mYWN0b3ItZGlzYWJsZS1mb3JtX19pbnB1dFdyYXBcIj5cbiAgICAgICAgICA8Zm9ybS5BcHBGaWVsZFxuICAgICAgICAgICAgbmFtZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgIGNoaWxkcmVuPXsoZmllbGQ6IGFueSkgPT4gPGZpZWxkLlRleHRGaWVsZCB0eXBlPVwicGFzc3dvcmRcIiBjbGFzc05hbWU9XCJwYXNzd29yZFwiIGxhYmVsPVwiUGFzc3dvcmRcIiByZXF1aXJlZCAvPn1cbiAgICAgICAgICAvPlxuICAgICAgICA8L0Zvcm1JbnB1dFdyYXA+XG4gICAgICAgIDxmb3JtLkFwcEZvcm0gY2hpbGRyZW49ezxmb3JtLlN1Ym1pdCBsYWJlbD1cIkRpc2FibGUgVHdv4oCRRmFjdG9yXCIgbG9hZGluZ0xhYmVsPVwiRGlzYWJsaW5nXCIgLz59IC8+XG4gICAgICA8L0Zvcm0+XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInR3by1mYWN0b3ItYXV0aC1maWVsZFwiPlxuICAgICAge3R3b0ZhY3RvckVuYWJsZWQgPyAoXG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBzZXRGb3JtU3RhdGUoJ2Rpc2FibGUnKVxuICAgICAgICAgICAgb3Blbk1vZGFsKCd0d28tZmFjdG9yLWF1dGgtbW9kYWwnKVxuICAgICAgICAgIH19XG4gICAgICAgICAgc2l6ZT1cIm1lZGl1bVwiXG4gICAgICAgICAgYnV0dG9uU3R5bGU9XCJwaWxsXCI+XG4gICAgICAgICAgRGlzYWJsZSBUd28tRmFjdG9yXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgKSA6IChcbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIHNldEZvcm1TdGF0ZSgnZW5hYmxlJylcbiAgICAgICAgICAgIG9wZW5Nb2RhbCgndHdvLWZhY3Rvci1hdXRoLW1vZGFsJylcbiAgICAgICAgICB9fVxuICAgICAgICAgIHNpemU9XCJtZWRpdW1cIlxuICAgICAgICAgIGJ1dHRvblN0eWxlPVwicGlsbFwiPlxuICAgICAgICAgIEVuYWJsZSBUd28tRmFjdG9yXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgKX1cbiAgICAgIDxNb2RhbCBzbHVnPVwidHdvLWZhY3Rvci1hdXRoLW1vZGFsXCIgY2xhc3NOYW1lPXtiYXNlQ2xhc3N9IGNsb3NlT25CbHVyPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7YmFzZUNsYXNzfV9fd3JhcHBlcmB9PlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGNsb3NlTW9kYWwoJ3R3by1mYWN0b3ItYXV0aC1tb2RhbCcpfVxuICAgICAgICAgICAgYnV0dG9uU3R5bGU9XCJpY29uLWxhYmVsXCJcbiAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICBjbGFzc05hbWU9e2Ake2Jhc2VDbGFzc31fX2Nsb3NlLWJ1dHRvbmB9PlxuICAgICAgICAgICAgPFhJY29uIHNpemU9ezI0fSAvPlxuICAgICAgICAgIDwvQnV0dG9uPlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake2Jhc2VDbGFzc31fX2NvbnRlbnRgfSBzdHlsZT17eyBtYXhXaWR0aDogJzM4cmVtJyB9fT5cbiAgICAgICAgICAgIHtmb3JtU3RhdGUgPT09ICdlbmFibGUnICYmIChcbiAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICA8aDI+RW5hYmxlIFR3b+KAkUZhY3RvcjwvaDI+XG4gICAgICAgICAgICAgICAgPEVuYWJsZUZvcm0gLz5cbiAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAge2Zvcm1TdGF0ZSA9PT0gJ3ZlcmlmeScgJiYgKFxuICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgIDxoMj5WZXJpZnkgVHdv4oCRRmFjdG9yPC9oMj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInR3by1mYWN0b3ItYXV0aC1tb2RhbF9fdmVyaWZ5LWJsb2NrXCI+XG4gICAgICAgICAgICAgICAgICA8cD5TY2FuIHRoZSBRUiBjb2RlIHdpdGggeW91ciBhdXRoZW50aWNhdG9yIGFwcCBvciBjb3B5IHRoZSBVUkkuPC9wPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0d28tZmFjdG9yLWF1dGgtbW9kYWxfX3FyY29kZVwiPlxuICAgICAgICAgICAgICAgICAgICA8UVJDb2RlU1ZHIHZhbHVlPXt0b3RwVVJJfSBzaXplPXsyMDB9IC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxCdXR0b24gc2l6ZT1cInNtYWxsXCIgYnV0dG9uU3R5bGU9XCJ0cmFuc3BhcmVudFwiIG9uQ2xpY2s9e2NvcHlVUkl9IGNsYXNzTmFtZT1cInR3by1mYWN0b3ItYXV0aC1tb2RhbF9fY29weS1idG5cIj5cbiAgICAgICAgICAgICAgICAgICAgPENvcHkgc2l6ZT17MTh9IGNsYXNzTmFtZT1cInR3by1mYWN0b3ItYXV0aC1tb2RhbF9fY29weS1pY29uXCIgLz4gQ29weSBVUklcbiAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPFZlcmlmeUZvcm0gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAge2Zvcm1TdGF0ZSA9PT0gJ2JhY2t1cENvZGVzJyAmJiBiYWNrdXBDb2RlcyAmJiAoXG4gICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgPGgyPkJhY2t1cCBDb2RlczwvaDI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0d28tZmFjdG9yLWF1dGgtbW9kYWxfX2JhY2t1cC1jb2Rlc1wiPlxuICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICB7YmFja3VwQ29kZXMubWFwKChjb2RlLCBpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGxpIGtleT17aX0gY2xhc3NOYW1lPVwidHdvLWZhY3Rvci1hdXRoLW1vZGFsX19iYWNrdXAtY29kZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2NvZGV9XG4gICAgICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidHdvLWZhY3Rvci1hdXRoLW1vZGFsX19iYWNrdXAtZGVzY1wiPlxuICAgICAgICAgICAgICAgICAgICBTdG9yZSB0aGVzZSBjb2RlcyBpbiBhIHNhZmUgcGxhY2UuIEVhY2ggY29kZSBjYW4gYmUgdXNlZCBvbmNlIGlmIHlvdSBsb3NlIGFjY2VzcyB0byB5b3VyIGF1dGhlbnRpY2F0b3IuXG4gICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gY2xvc2VNb2RhbCgndHdvLWZhY3Rvci1hdXRoLW1vZGFsJyl9XG4gICAgICAgICAgICAgICAgICBidXR0b25TdHlsZT1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgc2l6ZT1cImxhcmdlXCJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInR3by1mYWN0b3ItYXV0aC1tb2RhbF9fYmFja3VwLWNvZGVzLWNsb3NlLWJ1dHRvblwiPlxuICAgICAgICAgICAgICAgICAgU2F2ZWQgdGhlbSFcbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAge2Zvcm1TdGF0ZSA9PT0gJ2Rpc2FibGUnICYmIChcbiAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICA8aDI+VHdv4oCRRmFjdG9yIEF1dGhlbnRpY2F0aW9uPC9oMj5cbiAgICAgICAgICAgICAgICA8RGlzYWJsZUZvcm0gLz5cbiAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvTW9kYWw+XG4gICAgPC9kaXY+XG4gIClcbn1cbiJdLCJuYW1lcyI6WyJSZWFjdCIsInVzZU1lbW8iLCJ1c2VTdGF0ZSIsIlhJY29uIiwiQ29weSIsIkJ1dHRvbiIsIk1vZGFsIiwidG9hc3QiLCJ1c2VNb2RhbCIsInVzZVRyYW5zbGF0aW9uIiwidXNlRm9ybUZpZWxkcyIsInVzZUZpZWxkIiwiY3JlYXRlQXV0aENsaWVudCIsInR3b0ZhY3RvckNsaWVudCIsIkZvcm0iLCJGb3JtSW5wdXRXcmFwIiwieiIsInBhc3N3b3JkRmllbGQiLCJRUkNvZGVTVkciLCJ1c2VBcHBGb3JtIiwiYmFzZUNsYXNzIiwiVHdvRmFjdG9yQXV0aCIsImJhc2VVUkwiLCJiYXNlUGF0aCIsInRvdHBVUkkiLCJzZXRUb3RwVVJJIiwiYmFja3VwQ29kZXMiLCJzZXRCYWNrdXBDb2RlcyIsImZvcm1TdGF0ZSIsInNldEZvcm1TdGF0ZSIsIm9wZW5Nb2RhbCIsImNsb3NlTW9kYWwiLCJ0IiwidHdvRmFjdG9yRW5hYmxlZEZpZWxkIiwiZmllbGRzIiwidHdvRmFjdG9yRW5hYmxlZCIsIkJvb2xlYW4iLCJ2YWx1ZSIsInNldFZhbHVlIiwic2V0VHdvRmFjdG9yRW5hYmxlZCIsInBhdGgiLCJhdXRoQ2xpZW50IiwicGx1Z2lucyIsImNvcHlVUkkiLCJuYXZpZ2F0b3IiLCJjbGlwYm9hcmQiLCJ3cml0ZVRleHQiLCJzdWNjZXNzIiwiZXJyb3IiLCJwYXNzd29yZFNjaGVtYSIsIm9iamVjdCIsInBhc3N3b3JkIiwib3RwU2NoZW1hIiwib3RwIiwic3RyaW5nIiwibGVuZ3RoIiwicmVmaW5lIiwidmFsIiwidGVzdCIsIkVuYWJsZUZvcm0iLCJpc0xvYWRpbmciLCJzZXRJc0xvYWRpbmciLCJmb3JtIiwiZGVmYXVsdFZhbHVlcyIsIm9uU3VibWl0IiwiZGF0YSIsInR3b0ZhY3RvciIsImVuYWJsZSIsIm1lc3NhZ2UiLCJBcnJheSIsImlzQXJyYXkiLCJTdHJpbmciLCJzcGxpdCIsImZpbHRlciIsInZhbGlkYXRvcnMiLCJlIiwicHJldmVudERlZmF1bHQiLCJoYW5kbGVTdWJtaXQiLCJjbGFzc05hbWUiLCJBcHBGaWVsZCIsIm5hbWUiLCJjaGlsZHJlbiIsImZpZWxkIiwiVGV4dEZpZWxkIiwidHlwZSIsImxhYmVsIiwicmVxdWlyZWQiLCJBcHBGb3JtIiwiU3VibWl0IiwibG9hZGluZ0xhYmVsIiwiVmVyaWZ5Rm9ybSIsInZlcmlmeVRvdHAiLCJjb2RlIiwiRGlzYWJsZUZvcm0iLCJkaXNhYmxlIiwib25TdWNjZXNzIiwidW5kZWZpbmVkIiwib25FcnJvciIsImN0eCIsImRpdiIsIm9uQ2xpY2siLCJzaXplIiwiYnV0dG9uU3R5bGUiLCJzbHVnIiwiY2xvc2VPbkJsdXIiLCJzdHlsZSIsIm1heFdpZHRoIiwiaDIiLCJwIiwidWwiLCJtYXAiLCJpIiwibGkiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLE9BQU8sZUFBYztBQUVyQixPQUFPQSxTQUFTQyxPQUFPLEVBQUVDLFFBQVEsUUFBUSxRQUFPO0FBQ2hELFNBQVNDLEtBQUssRUFBRUMsSUFBSSxRQUFRLGVBQWM7QUFDMUMsU0FBU0MsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLEtBQUssRUFBRUMsUUFBUSxFQUFFQyxjQUFjLEVBQUVDLGFBQWEsRUFBRUMsUUFBUSxRQUFRLGlCQUFnQjtBQUN4RyxTQUFTQyxnQkFBZ0IsUUFBUSxvQkFBbUI7QUFDcEQsU0FBU0MsZUFBZSxRQUFRLDZCQUE0QjtBQUM1RCxTQUFTQyxJQUFJLEVBQUVDLGFBQWEsUUFBUSxnQ0FBa0I7QUFDdEQsU0FBU0MsQ0FBQyxRQUFRLE1BQUs7QUFDdkIsU0FBU0MsYUFBYSxRQUFRLHdDQUEwQjtBQUN4RCxTQUFTQyxTQUFTLFFBQVEsZUFBYztBQUN4QyxTQUFTQyxVQUFVLFFBQVEsNkJBQWU7QUFFMUMsTUFBTUMsWUFBWTtBQU9sQixPQUFPLE1BQU1DLGdCQUE4QyxDQUFDLEVBQUVDLE9BQU8sRUFBRUMsUUFBUSxFQUFFO0lBQy9FLE1BQU0sQ0FBQ0MsU0FBU0MsV0FBVyxHQUFHdkIsU0FBUztJQUN2QyxNQUFNLENBQUN3QixhQUFhQyxlQUFlLEdBQUd6QixTQUEwQjtJQUNoRSxNQUFNLENBQUMwQixXQUFXQyxhQUFhLEdBQUczQixTQUEwRDtJQUM1RixNQUFNLEVBQUU0QixTQUFTLEVBQUVDLFVBQVUsRUFBRSxHQUFHdkI7SUFDbEMsTUFBTSxFQUFFd0IsQ0FBQyxFQUFFLEdBQUd2QjtJQUNkLE1BQU13Qix3QkFBd0J2QixjQUFjLENBQUMsQ0FBQ3dCLE9BQU8sR0FBS0EsT0FBT0MsZ0JBQWdCO0lBQ2pGLE1BQU1BLG1CQUFtQkMsUUFBUUgsdUJBQXVCSTtJQUN4RCxNQUFNLEVBQUVDLFVBQVVD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