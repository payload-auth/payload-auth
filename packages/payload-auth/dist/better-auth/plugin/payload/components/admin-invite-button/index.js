'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Copy, Loader2, XIcon } from "lucide-react";
import { Button, Modal, Select, TextInput, toast, useConfig, useModal } from "@payloadcms/ui";
import { adminEndpoints } from "../../../constants";
import "./index.scss";
const baseClass = 'admin-invite-modal';
export const AdminInviteButton = ({ roles })=>{
    const [role, setRole] = useState(undefined);
    const [email, setEmail] = useState('');
    const [inviteLink, setInviteLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopyLoading, setIsCopyLoading] = useState(false);
    const { toggleModal } = useModal();
    const { config: { serverURL, routes: { api: apiRoute, admin: adminRoute }, admin: { user: userSlug } } } = useConfig();
    // Only render invite button in list view.
    const pathname = usePathname();
    if (pathname !== `${adminRoute}/collections/${userSlug}`) return null;
    const handleGenerateInvite = async ()=>{
        if (!role) {
            toast.error('Please select a role first');
            return null;
        }
        try {
            const url = `${serverURL}${apiRoute}/${userSlug}${adminEndpoints.generateInviteUrl}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    role
                }),
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to generate invite');
            const data = await response.json();
            setInviteLink(data.inviteLink);
            return data.inviteLink;
        } catch (error) {
            toast.error('Failed to generate invite link');
            return null;
        }
    };
    const handleSendEmail = async ()=>{
        if (!role) {
            toast.error('Please select a role first');
            return;
        }
        if (!email) {
            toast.error('Please enter an email address');
            return;
        }
        try {
            setIsLoading(true);
            let linkToCopy = inviteLink;
            if (!linkToCopy) {
                linkToCopy = await handleGenerateInvite();
            }
            if (linkToCopy) {
                const response = await fetch(`${serverURL}${apiRoute}/${userSlug}${adminEndpoints.sendInvite}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        link: linkToCopy
                    }),
                    credentials: 'include'
                });
                if (!response.ok) throw new Error('Failed to send invite');
                toast.success('Invite sent successfully');
                handleToggleModal();
            }
        } catch (error) {
            toast.error('Failed to send invite email');
        } finally{
            setIsLoading(false);
        }
    };
    const handleCopyLink = async ()=>{
        if (!role) {
            toast.error('Please select a role first');
            return;
        }
        try {
            setIsCopyLoading(true);
            let linkToCopy = inviteLink;
            if (!linkToCopy) {
                linkToCopy = await handleGenerateInvite();
            }
            if (linkToCopy) {
                await navigator.clipboard.writeText(linkToCopy);
                toast.success('Invite link copied to clipboard');
                toggleModal('admin-invite-modal');
            }
        } catch (error) {
            toast.error('Failed to copy invite link');
        } finally{
            setIsCopyLoading(false);
        }
    };
    const handleToggleModal = ()=>{
        toggleModal('admin-invite-modal');
    };
    return /*#__PURE__*/ _jsxs(_Fragment, {
        children: [
            /*#__PURE__*/ _jsx(Button, {
                onClick: handleToggleModal,
                type: "button",
                size: "small",
                buttonStyle: "pill",
                className: "admin-invite-button",
                children: "Invite User"
            }),
            /*#__PURE__*/ _jsx(Modal, {
                slug: "admin-invite-modal",
                className: `${baseClass}`,
                closeOnBlur: true,
                children: /*#__PURE__*/ _jsxs("div", {
                    className: `${baseClass}__wrapper`,
                    children: [
                        /*#__PURE__*/ _jsx(Button, {
                            onClick: handleToggleModal,
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
                                /*#__PURE__*/ _jsx("h2", {
                                    children: "Invite User"
                                }),
                                /*#__PURE__*/ _jsx("p", {
                                    children: "Invite a user to your application. Select the role of the user and send the invite via email or copy the invite link."
                                }),
                                /*#__PURE__*/ _jsx(Select, {
                                    options: roles,
                                    value: role,
                                    placeholder: "Select Role",
                                    onChange: (option)=>setRole(option)
                                }),
                                /*#__PURE__*/ _jsxs("div", {
                                    className: `${baseClass}__invite-controls`,
                                    children: [
                                        /*#__PURE__*/ _jsx("div", {
                                            className: `${baseClass}__email-field`,
                                            children: /*#__PURE__*/ _jsx(TextInput, {
                                                label: "Email Address",
                                                path: "email",
                                                value: email,
                                                onChange: (e)=>setEmail(e.target.value),
                                                placeholder: "user@example.com"
                                            })
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: `${baseClass}__buttons`,
                                            children: [
                                                /*#__PURE__*/ _jsxs(Button, {
                                                    type: "button",
                                                    onClick: handleSendEmail,
                                                    disabled: isLoading || !role || !email,
                                                    children: [
                                                        isLoading ? /*#__PURE__*/ _jsx(Loader2, {
                                                            size: 24,
                                                            className: "mr-2 animate-spin"
                                                        }) : null,
                                                        "Send Email"
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsxs(Button, {
                                                    size: "medium",
                                                    buttonStyle: "transparent",
                                                    className: `${baseClass}__copy-button`,
                                                    type: "button",
                                                    onClick: handleCopyLink,
                                                    disabled: isCopyLoading || !role,
                                                    children: [
                                                        isCopyLoading ? /*#__PURE__*/ _jsx(Loader2, {
                                                            size: 20,
                                                            strokeWidth: 1.5,
                                                            className: "animate-spin"
                                                        }) : /*#__PURE__*/ _jsx(Copy, {
                                                            size: 20,
                                                            strokeWidth: 1.5
                                                        }),
                                                        "Generate Link"
                                                    ]
                                                })
                                            ]
                                        })
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC9jb21wb25lbnRzL2FkbWluLWludml0ZS1idXR0b24vaW5kZXgudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50J1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHVzZVBhdGhuYW1lIH0gZnJvbSAnbmV4dC9uYXZpZ2F0aW9uJ1xuaW1wb3J0IHsgQ29weSwgTG9hZGVyMiwgWEljb24gfSBmcm9tICdsdWNpZGUtcmVhY3QnXG5pbXBvcnQgdHlwZSB7IE9wdGlvbiB9IGZyb20gJ0BwYXlsb2FkY21zL3VpL2VsZW1lbnRzL1JlYWN0U2VsZWN0J1xuaW1wb3J0IHsgQnV0dG9uLCBNb2RhbCwgU2VsZWN0LCBUZXh0SW5wdXQsIHRvYXN0LCB1c2VDb25maWcsIHVzZU1vZGFsIH0gZnJvbSAnQHBheWxvYWRjbXMvdWknXG5pbXBvcnQgeyBhZG1pbkVuZHBvaW50cyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2NvbnN0YW50cydcblxuaW1wb3J0ICcuL2luZGV4LnNjc3MnXG5cbmNvbnN0IGJhc2VDbGFzcyA9ICdhZG1pbi1pbnZpdGUtbW9kYWwnXG5cbnR5cGUgQWRtaW5JbnZpdGVCdXR0b25Qcm9wcyA9IHtcbiAgcm9sZXM6IHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IHN0cmluZyB9W11cbn1cblxuZXhwb3J0IGNvbnN0IEFkbWluSW52aXRlQnV0dG9uOiBSZWFjdC5GQzxBZG1pbkludml0ZUJ1dHRvblByb3BzPiA9ICh7IHJvbGVzIH0pID0+IHtcbiAgY29uc3QgW3JvbGUsIHNldFJvbGVdID0gdXNlU3RhdGU8T3B0aW9uIHwgdW5kZWZpbmVkPih1bmRlZmluZWQpXG4gIGNvbnN0IFtlbWFpbCwgc2V0RW1haWxdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtpbnZpdGVMaW5rLCBzZXRJbnZpdGVMaW5rXSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtpc0NvcHlMb2FkaW5nLCBzZXRJc0NvcHlMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCB7IHRvZ2dsZU1vZGFsIH0gPSB1c2VNb2RhbCgpXG5cbiAgY29uc3Qge1xuICAgIGNvbmZpZzoge1xuICAgICAgc2VydmVyVVJMLFxuICAgICAgcm91dGVzOiB7IGFwaTogYXBpUm91dGUsIGFkbWluOiBhZG1pblJvdXRlIH0sXG4gICAgICBhZG1pbjogeyB1c2VyOiB1c2VyU2x1ZyB9XG4gICAgfVxuICB9ID0gdXNlQ29uZmlnKClcblxuICAvLyBPbmx5IHJlbmRlciBpbnZpdGUgYnV0dG9uIGluIGxpc3Qgdmlldy5cbiAgY29uc3QgcGF0aG5hbWUgPSB1c2VQYXRobmFtZSgpXG4gIGlmIChwYXRobmFtZSAhPT0gYCR7YWRtaW5Sb3V0ZX0vY29sbGVjdGlvbnMvJHt1c2VyU2x1Z31gKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IGhhbmRsZUdlbmVyYXRlSW52aXRlID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghcm9sZSkge1xuICAgICAgdG9hc3QuZXJyb3IoJ1BsZWFzZSBzZWxlY3QgYSByb2xlIGZpcnN0JylcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHVybCA9IGAke3NlcnZlclVSTH0ke2FwaVJvdXRlfS8ke3VzZXJTbHVnfSR7YWRtaW5FbmRwb2ludHMuZ2VuZXJhdGVJbnZpdGVVcmx9YFxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgcm9sZSB9KSxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJ1xuICAgICAgfSlcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGdlbmVyYXRlIGludml0ZScpXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgICBzZXRJbnZpdGVMaW5rKGRhdGEuaW52aXRlTGluaylcbiAgICAgIHJldHVybiBkYXRhLmludml0ZUxpbmtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdG9hc3QuZXJyb3IoJ0ZhaWxlZCB0byBnZW5lcmF0ZSBpbnZpdGUgbGluaycpXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGhhbmRsZVNlbmRFbWFpbCA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIXJvbGUpIHtcbiAgICAgIHRvYXN0LmVycm9yKCdQbGVhc2Ugc2VsZWN0IGEgcm9sZSBmaXJzdCcpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoIWVtYWlsKSB7XG4gICAgICB0b2FzdC5lcnJvcignUGxlYXNlIGVudGVyIGFuIGVtYWlsIGFkZHJlc3MnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHNldElzTG9hZGluZyh0cnVlKVxuICAgICAgbGV0IGxpbmtUb0NvcHkgPSBpbnZpdGVMaW5rXG4gICAgICBpZiAoIWxpbmtUb0NvcHkpIHtcbiAgICAgICAgbGlua1RvQ29weSA9IGF3YWl0IGhhbmRsZUdlbmVyYXRlSW52aXRlKClcbiAgICAgIH1cbiAgICAgIGlmIChsaW5rVG9Db3B5KSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7c2VydmVyVVJMfSR7YXBpUm91dGV9LyR7dXNlclNsdWd9JHthZG1pbkVuZHBvaW50cy5zZW5kSW52aXRlfWAsIHtcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgICAgfSxcbiAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGVtYWlsLCBsaW5rOiBsaW5rVG9Db3B5IH0pLFxuICAgICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZSdcbiAgICAgICAgfSlcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gc2VuZCBpbnZpdGUnKVxuICAgICAgICB0b2FzdC5zdWNjZXNzKCdJbnZpdGUgc2VudCBzdWNjZXNzZnVsbHknKVxuICAgICAgICBoYW5kbGVUb2dnbGVNb2RhbCgpXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRvYXN0LmVycm9yKCdGYWlsZWQgdG8gc2VuZCBpbnZpdGUgZW1haWwnKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgaGFuZGxlQ29weUxpbmsgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFyb2xlKSB7XG4gICAgICB0b2FzdC5lcnJvcignUGxlYXNlIHNlbGVjdCBhIHJvbGUgZmlyc3QnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHNldElzQ29weUxvYWRpbmcodHJ1ZSlcbiAgICAgIGxldCBsaW5rVG9Db3B5ID0gaW52aXRlTGlua1xuXG4gICAgICBpZiAoIWxpbmtUb0NvcHkpIHtcbiAgICAgICAgbGlua1RvQ29weSA9IGF3YWl0IGhhbmRsZUdlbmVyYXRlSW52aXRlKClcbiAgICAgIH1cblxuICAgICAgaWYgKGxpbmtUb0NvcHkpIHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQobGlua1RvQ29weSlcbiAgICAgICAgdG9hc3Quc3VjY2VzcygnSW52aXRlIGxpbmsgY29waWVkIHRvIGNsaXBib2FyZCcpXG4gICAgICAgIHRvZ2dsZU1vZGFsKCdhZG1pbi1pbnZpdGUtbW9kYWwnKVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0b2FzdC5lcnJvcignRmFpbGVkIHRvIGNvcHkgaW52aXRlIGxpbmsnKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRJc0NvcHlMb2FkaW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGhhbmRsZVRvZ2dsZU1vZGFsID0gKCkgPT4ge1xuICAgIHRvZ2dsZU1vZGFsKCdhZG1pbi1pbnZpdGUtbW9kYWwnKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEJ1dHRvbiBvbkNsaWNrPXtoYW5kbGVUb2dnbGVNb2RhbH0gdHlwZT1cImJ1dHRvblwiIHNpemU9XCJzbWFsbFwiIGJ1dHRvblN0eWxlPVwicGlsbFwiIGNsYXNzTmFtZT1cImFkbWluLWludml0ZS1idXR0b25cIj5cbiAgICAgICAgSW52aXRlIFVzZXJcbiAgICAgIDwvQnV0dG9uPlxuICAgICAgPE1vZGFsIHNsdWc9XCJhZG1pbi1pbnZpdGUtbW9kYWxcIiBjbGFzc05hbWU9e2Ake2Jhc2VDbGFzc31gfSBjbG9zZU9uQmx1cj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake2Jhc2VDbGFzc31fX3dyYXBwZXJgfT5cbiAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e2hhbmRsZVRvZ2dsZU1vZGFsfSBidXR0b25TdHlsZT1cImljb24tbGFiZWxcIiBzaXplPVwic21hbGxcIiBjbGFzc05hbWU9e2Ake2Jhc2VDbGFzc31fX2Nsb3NlLWJ1dHRvbmB9PlxuICAgICAgICAgICAgPFhJY29uIHNpemU9ezI0fSAvPlxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtiYXNlQ2xhc3N9X19jb250ZW50YH0gc3R5bGU9e3sgbWF4V2lkdGg6ICczOHJlbScgfX0+XG4gICAgICAgICAgICA8aDI+SW52aXRlIFVzZXI8L2gyPlxuICAgICAgICAgICAgPHA+SW52aXRlIGEgdXNlciB0byB5b3VyIGFwcGxpY2F0aW9uLiBTZWxlY3QgdGhlIHJvbGUgb2YgdGhlIHVzZXIgYW5kIHNlbmQgdGhlIGludml0ZSB2aWEgZW1haWwgb3IgY29weSB0aGUgaW52aXRlIGxpbmsuPC9wPlxuICAgICAgICAgICAgPFNlbGVjdCBvcHRpb25zPXtyb2xlc30gdmFsdWU9e3JvbGV9IHBsYWNlaG9sZGVyPVwiU2VsZWN0IFJvbGVcIiBvbkNoYW5nZT17KG9wdGlvbjogYW55KSA9PiBzZXRSb2xlKG9wdGlvbil9IC8+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtiYXNlQ2xhc3N9X19pbnZpdGUtY29udHJvbHNgfT5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake2Jhc2VDbGFzc31fX2VtYWlsLWZpZWxkYH0+XG4gICAgICAgICAgICAgICAgPFRleHRJbnB1dFxuICAgICAgICAgICAgICAgICAgbGFiZWw9XCJFbWFpbCBBZGRyZXNzXCJcbiAgICAgICAgICAgICAgICAgIHBhdGg9XCJlbWFpbFwiXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17ZW1haWx9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGU6IGFueSkgPT4gc2V0RW1haWwoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJ1c2VyQGV4YW1wbGUuY29tXCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7YmFzZUNsYXNzfV9fYnV0dG9uc2B9PlxuICAgICAgICAgICAgICAgIDxCdXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e2hhbmRsZVNlbmRFbWFpbH0gZGlzYWJsZWQ9e2lzTG9hZGluZyB8fCAhcm9sZSB8fCAhZW1haWx9PlxuICAgICAgICAgICAgICAgICAge2lzTG9hZGluZyA/IDxMb2FkZXIyIHNpemU9ezI0fSBjbGFzc05hbWU9XCJtci0yIGFuaW1hdGUtc3BpblwiIC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIFNlbmQgRW1haWxcbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cblxuICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgIHNpemU9XCJtZWRpdW1cIlxuICAgICAgICAgICAgICAgICAgYnV0dG9uU3R5bGU9XCJ0cmFuc3BhcmVudFwiXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Ake2Jhc2VDbGFzc31fX2NvcHktYnV0dG9uYH1cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlQ29weUxpbmt9XG4gICAgICAgICAgICAgICAgICBkaXNhYmxlZD17aXNDb3B5TG9hZGluZyB8fCAhcm9sZX0+XG4gICAgICAgICAgICAgICAgICB7aXNDb3B5TG9hZGluZyA/IDxMb2FkZXIyIHNpemU9ezIwfSBzdHJva2VXaWR0aD17MS41fSBjbGFzc05hbWU9XCJhbmltYXRlLXNwaW5cIiAvPiA6IDxDb3B5IHNpemU9ezIwfSBzdHJva2VXaWR0aD17MS41fSAvPn1cbiAgICAgICAgICAgICAgICAgIEdlbmVyYXRlIExpbmtcbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L01vZGFsPlxuICAgIDwvPlxuICApXG59XG4iXSwibmFtZXMiOlsiUmVhY3QiLCJ1c2VTdGF0ZSIsInVzZVBhdGhuYW1lIiwiQ29weSIsIkxvYWRlcjIiLCJYSWNvbiIsIkJ1dHRvbiIsIk1vZGFsIiwiU2VsZWN0IiwiVGV4dElucHV0IiwidG9hc3QiLCJ1c2VDb25maWciLCJ1c2VNb2RhbCIsImFkbWluRW5kcG9pbnRzIiwiYmFzZUNsYXNzIiwiQWRtaW5JbnZpdGVCdXR0b24iLCJyb2xlcyIsInJvbGUiLCJzZXRSb2xlIiwidW5kZWZpbmVkIiwiZW1haWwiLCJzZXRFbWFpbCIsImludml0ZUxpbmsiLCJzZXRJbnZpdGVMaW5rIiwiaXNMb2FkaW5nIiwic2V0SXNMb2FkaW5nIiwiaXNDb3B5TG9hZGluZyIsInNldElzQ29weUxvYWRpbmciLCJ0b2dnbGVNb2RhbCIsImNvbmZpZyIsInNlcnZlclVSTCIsInJvdXRlcyIsImFwaSIsImFwaVJvdXRlIiwiYWRtaW4iLCJhZG1pblJvdXRlIiwidXNlciIsInVzZXJTbHVnIiwicGF0aG5hbWUiLCJoYW5kbGVHZW5lcmF0ZUludml0ZSIsImVycm9yIiwidXJsIiwiZ2VuZXJhdGVJbnZpdGVVcmwiLCJyZXNwb25zZSIsImZldGNoIiwibWV0aG9kIiwiaGVhZGVycyIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5IiwiY3JlZGVudGlhbHMiLCJvayIsIkVycm9yIiwiZGF0YSIsImpzb24iLCJoYW5kbGVTZW5kRW1haWwiLCJsaW5rVG9Db3B5Iiwic2VuZEludml0ZSIsImxpbmsiLCJzdWNjZXNzIiwiaGFuZGxlVG9nZ2xlTW9kYWwiLCJoYW5kbGVDb3B5TGluayIsIm5hdmlnYXRvciIsImNsaXBib2FyZCIsIndyaXRlVGV4dCIsIm9uQ2xpY2siLCJ0eXBlIiwic2l6ZSIsImJ1dHRvblN0eWxlIiwiY2xhc3NOYW1lIiwic2x1ZyIsImNsb3NlT25CbHVyIiwiZGl2Iiwic3R5bGUiLCJtYXhXaWR0aCIsImgyIiwicCIsIm9wdGlvbnMiLCJ2YWx1ZSIsInBsYWNlaG9sZGVyIiwib25DaGFuZ2UiLCJvcHRpb24iLCJsYWJlbCIsInBhdGgiLCJlIiwidGFyZ2V0IiwiZGlzYWJsZWQiLCJzdHJva2VXaWR0aCJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsT0FBT0EsU0FBU0MsUUFBUSxRQUFRLFFBQU87QUFDdkMsU0FBU0MsV0FBVyxRQUFRLGtCQUFpQjtBQUM3QyxTQUFTQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsS0FBSyxRQUFRLGVBQWM7QUFF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