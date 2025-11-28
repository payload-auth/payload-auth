'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Fragment, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { Button, toast, useDocumentInfo, useFormFields } from "@payloadcms/ui";
import "./index.scss";
export const AdminButtons = ({ baseURL, basePath })=>{
    const router = useRouter();
    const { id } = useDocumentInfo();
    const isBanned = useFormFields(([fields])=>fields.banned);
    if (!id) {
        return null;
    }
    const authClient = useMemo(()=>createAuthClient({
            baseURL,
            basePath,
            plugins: [
                adminClient()
            ]
        }), []);
    const handleImpersonate = async ()=>{
        await authClient.admin.impersonateUser({
            userId: String(id),
            fetchOptions: {
                onSuccess () {
                    router.push('/');
                },
                onError (error) {
                    console.error('Error impersonating user:', error);
                    toast.error('Failed to impersonate user');
                }
            }
        });
    };
    const handleBan = async ()=>{
        await authClient.admin.banUser({
            userId: String(id),
            fetchOptions: {
                onSuccess () {
                    toast.success('User banned successfully');
                    router.refresh();
                },
                onError (error) {
                    console.error('Error banning user:', error);
                    toast.error('Failed to ban user');
                }
            }
        });
    };
    const handleUnban = async ()=>{
        await authClient.admin.unbanUser({
            userId: String(id),
            fetchOptions: {
                onSuccess () {
                    toast.success('User unbanned successfully');
                    router.refresh();
                },
                onError (error) {
                    console.error('Error unbanning user:', error);
                    toast.error('Failed to unban user');
                }
            }
        });
    };
    const handleRevokeAllSessions = async ()=>{
        await authClient.admin.revokeUserSessions({
            userId: String(id),
            fetchOptions: {
                onSuccess () {
                    toast.success('All sessions revoked successfully');
                    router.refresh();
                },
                onError (error) {
                    console.error('Error revoking all sessions:', error);
                    toast.error('Failed to revoke all sessions');
                }
            }
        });
    };
    return /*#__PURE__*/ _jsxs(Fragment, {
        children: [
            /*#__PURE__*/ _jsx(Button, {
                onClick: handleImpersonate,
                buttonStyle: "pill",
                className: "impersonate-button",
                size: "medium",
                children: "Impersonate"
            }),
            /*#__PURE__*/ _jsx(Button, {
                onClick: handleRevokeAllSessions,
                buttonStyle: "secondary",
                className: "revoke-sessions-button",
                size: "medium",
                children: "Revoke All Sessions"
            }),
            !isBanned ? /*#__PURE__*/ _jsx(Button, {
                onClick: handleBan,
                buttonStyle: "error",
                className: "ban-button",
                size: "medium",
                children: "Ban"
            }) : null,
            isBanned ? /*#__PURE__*/ _jsx(Button, {
                onClick: handleUnban,
                buttonStyle: "primary",
                className: "unban-button",
                size: "medium",
                children: "Unban"
            }) : null
        ]
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC9jb21wb25lbnRzL2FkbWluLWJ1dHRvbnMvaW5kZXgudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50J1xuXG5pbXBvcnQgUmVhY3QsIHsgRnJhZ21lbnQsIHVzZU1lbW8gfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHVzZVJvdXRlciB9IGZyb20gJ25leHQvbmF2aWdhdGlvbidcbmltcG9ydCB7IGNyZWF0ZUF1dGhDbGllbnQgfSBmcm9tICdiZXR0ZXItYXV0aC9yZWFjdCdcbmltcG9ydCB7IGFkbWluQ2xpZW50IH0gZnJvbSAnYmV0dGVyLWF1dGgvY2xpZW50L3BsdWdpbnMnXG5pbXBvcnQgeyBCdXR0b24sIHRvYXN0LCB1c2VEb2N1bWVudEluZm8sIHVzZUZvcm1GaWVsZHMgfSBmcm9tICdAcGF5bG9hZGNtcy91aSdcblxuaW1wb3J0ICcuL2luZGV4LnNjc3MnXG5cbnR5cGUgQWRtaW5CdXR0b25zUHJvcHMgPSB7XG4gIHVzZXJTbHVnOiBzdHJpbmdcbiAgYmFzZVVSTD86IHN0cmluZ1xuICBiYXNlUGF0aD86IHN0cmluZ1xufVxuXG5leHBvcnQgY29uc3QgQWRtaW5CdXR0b25zOiBSZWFjdC5GQzxBZG1pbkJ1dHRvbnNQcm9wcz4gPSAoeyBiYXNlVVJMLCBiYXNlUGF0aCB9KSA9PiB7XG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpXG4gIGNvbnN0IHsgaWQgfSA9IHVzZURvY3VtZW50SW5mbygpXG4gIGNvbnN0IGlzQmFubmVkID0gdXNlRm9ybUZpZWxkcygoW2ZpZWxkc10pID0+IGZpZWxkcy5iYW5uZWQpXG5cbiAgaWYgKCFpZCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBhdXRoQ2xpZW50ID0gdXNlTWVtbyhcbiAgICAoKSA9PlxuICAgICAgY3JlYXRlQXV0aENsaWVudCh7XG4gICAgICAgIGJhc2VVUkwsXG4gICAgICAgIGJhc2VQYXRoLFxuICAgICAgICBwbHVnaW5zOiBbYWRtaW5DbGllbnQoKV1cbiAgICAgIH0pLFxuICAgIFtdXG4gIClcblxuICBjb25zdCBoYW5kbGVJbXBlcnNvbmF0ZSA9IGFzeW5jICgpID0+IHtcbiAgICBhd2FpdCBhdXRoQ2xpZW50LmFkbWluLmltcGVyc29uYXRlVXNlcih7XG4gICAgICB1c2VySWQ6IFN0cmluZyhpZCksXG4gICAgICBmZXRjaE9wdGlvbnM6IHtcbiAgICAgICAgb25TdWNjZXNzKCkge1xuICAgICAgICAgIHJvdXRlci5wdXNoKCcvJylcbiAgICAgICAgfSxcbiAgICAgICAgb25FcnJvcihlcnJvcjogYW55KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW1wZXJzb25hdGluZyB1c2VyOicsIGVycm9yKVxuICAgICAgICAgIHRvYXN0LmVycm9yKCdGYWlsZWQgdG8gaW1wZXJzb25hdGUgdXNlcicpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgaGFuZGxlQmFuID0gYXN5bmMgKCkgPT4ge1xuICAgIGF3YWl0IGF1dGhDbGllbnQuYWRtaW4uYmFuVXNlcih7XG4gICAgICB1c2VySWQ6IFN0cmluZyhpZCksXG4gICAgICBmZXRjaE9wdGlvbnM6IHtcbiAgICAgICAgb25TdWNjZXNzKCkge1xuICAgICAgICAgIHRvYXN0LnN1Y2Nlc3MoJ1VzZXIgYmFubmVkIHN1Y2Nlc3NmdWxseScpXG4gICAgICAgICAgcm91dGVyLnJlZnJlc2goKVxuICAgICAgICB9LFxuICAgICAgICBvbkVycm9yKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBiYW5uaW5nIHVzZXI6JywgZXJyb3IpXG4gICAgICAgICAgdG9hc3QuZXJyb3IoJ0ZhaWxlZCB0byBiYW4gdXNlcicpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgaGFuZGxlVW5iYW4gPSBhc3luYyAoKSA9PiB7XG4gICAgYXdhaXQgYXV0aENsaWVudC5hZG1pbi51bmJhblVzZXIoe1xuICAgICAgdXNlcklkOiBTdHJpbmcoaWQpLFxuICAgICAgZmV0Y2hPcHRpb25zOiB7XG4gICAgICAgIG9uU3VjY2VzcygpIHtcbiAgICAgICAgICB0b2FzdC5zdWNjZXNzKCdVc2VyIHVuYmFubmVkIHN1Y2Nlc3NmdWxseScpXG4gICAgICAgICAgcm91dGVyLnJlZnJlc2goKVxuICAgICAgICB9LFxuICAgICAgICBvbkVycm9yKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1bmJhbm5pbmcgdXNlcjonLCBlcnJvcilcbiAgICAgICAgICB0b2FzdC5lcnJvcignRmFpbGVkIHRvIHVuYmFuIHVzZXInKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGhhbmRsZVJldm9rZUFsbFNlc3Npb25zID0gYXN5bmMgKCkgPT4ge1xuICAgIGF3YWl0IGF1dGhDbGllbnQuYWRtaW4ucmV2b2tlVXNlclNlc3Npb25zKHtcbiAgICAgIHVzZXJJZDogU3RyaW5nKGlkKSxcbiAgICAgIGZldGNoT3B0aW9uczoge1xuICAgICAgICBvblN1Y2Nlc3MoKSB7XG4gICAgICAgICAgdG9hc3Quc3VjY2VzcygnQWxsIHNlc3Npb25zIHJldm9rZWQgc3VjY2Vzc2Z1bGx5JylcbiAgICAgICAgICByb3V0ZXIucmVmcmVzaCgpXG4gICAgICAgIH0sXG4gICAgICAgIG9uRXJyb3IoZXJyb3I6IGFueSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHJldm9raW5nIGFsbCBzZXNzaW9uczonLCBlcnJvcilcbiAgICAgICAgICB0b2FzdC5lcnJvcignRmFpbGVkIHRvIHJldm9rZSBhbGwgc2Vzc2lvbnMnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEZyYWdtZW50PlxuICAgICAgPEJ1dHRvbiBvbkNsaWNrPXtoYW5kbGVJbXBlcnNvbmF0ZX0gYnV0dG9uU3R5bGU9XCJwaWxsXCIgY2xhc3NOYW1lPVwiaW1wZXJzb25hdGUtYnV0dG9uXCIgc2l6ZT1cIm1lZGl1bVwiPlxuICAgICAgICBJbXBlcnNvbmF0ZVxuICAgICAgPC9CdXR0b24+XG4gICAgICA8QnV0dG9uIG9uQ2xpY2s9e2hhbmRsZVJldm9rZUFsbFNlc3Npb25zfSBidXR0b25TdHlsZT1cInNlY29uZGFyeVwiIGNsYXNzTmFtZT1cInJldm9rZS1zZXNzaW9ucy1idXR0b25cIiBzaXplPVwibWVkaXVtXCI+XG4gICAgICAgIFJldm9rZSBBbGwgU2Vzc2lvbnNcbiAgICAgIDwvQnV0dG9uPlxuICAgICAgeyFpc0Jhbm5lZCA/IChcbiAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXtoYW5kbGVCYW59IGJ1dHRvblN0eWxlPVwiZXJyb3JcIiBjbGFzc05hbWU9XCJiYW4tYnV0dG9uXCIgc2l6ZT1cIm1lZGl1bVwiPlxuICAgICAgICAgIEJhblxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgICkgOiBudWxsfVxuICAgICAge2lzQmFubmVkID8gKFxuICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e2hhbmRsZVVuYmFufSBidXR0b25TdHlsZT1cInByaW1hcnlcIiBjbGFzc05hbWU9XCJ1bmJhbi1idXR0b25cIiBzaXplPVwibWVkaXVtXCI+XG4gICAgICAgICAgVW5iYW5cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICApIDogbnVsbH1cbiAgICA8L0ZyYWdtZW50PlxuICApXG59XG4iXSwibmFtZXMiOlsiUmVhY3QiLCJGcmFnbWVudCIsInVzZU1lbW8iLCJ1c2VSb3V0ZXIiLCJjcmVhdGVBdXRoQ2xpZW50IiwiYWRtaW5DbGllbnQiLCJCdXR0b24iLCJ0b2FzdCIsInVzZURvY3VtZW50SW5mbyIsInVzZUZvcm1GaWVsZHMiLCJBZG1pbkJ1dHRvbnMiLCJiYXNlVVJMIiwiYmFzZVBhdGgiLCJyb3V0ZXIiLCJpZCIsImlzQmFubmVkIiwiZmllbGRzIiwiYmFubmVkIiwiYXV0aENsaWVudCIsInBsdWdpbnMiLCJoYW5kbGVJbXBlcnNvbmF0ZSIsImFkbWluIiwiaW1wZXJzb25hdGVVc2VyIiwidXNlcklkIiwiU3RyaW5nIiwiZmV0Y2hPcHRpb25zIiwib25TdWNjZXNzIiwicHVzaCIsIm9uRXJyb3IiLCJlcnJvciIsImNvbnNvbGUiLCJoYW5kbGVCYW4iLCJiYW5Vc2VyIiwic3VjY2VzcyIsInJlZnJlc2giLCJoYW5kbGVVbmJhbiIsInVuYmFuVXNlciIsImhhbmRsZVJldm9rZUFsbFNlc3Npb25zIiwicmV2b2tlVXNlclNlc3Npb25zIiwib25DbGljayIsImJ1dHRvblN0eWxlIiwiY2xhc3NOYW1lIiwic2l6ZSJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsT0FBT0EsU0FBU0MsUUFBUSxFQUFFQyxPQUFPLFFBQVEsUUFBTztBQUNoRCxTQUFTQyxTQUFTLFFBQVEsa0JBQWlCO0FBQzNDLFNBQVNDLGdCQUFnQixRQUFRLG9CQUFtQjtBQUNwRCxTQUFTQyxXQUFXLFFBQVEsNkJBQTRCO0FBQ3hELFNBQVNDLE1BQU0sRUFBRUMsS0FBSyxFQUFFQyxlQUFlLEVBQUVDLGFBQWEsUUFBUSxpQkFBZ0I7QUFFOUUsT0FBTyxlQUFjO0FBUXJCLE9BQU8sTUFBTUMsZUFBNEMsQ0FBQyxFQUFFQyxPQUFPLEVBQUVDLFFBQVEsRUFBRTtJQUM3RSxNQUFNQyxTQUFTVjtJQUNmLE1BQU0sRUFBRVcsRUFBRSxFQUFFLEdBQUdOO0lBQ2YsTUFBTU8sV0FBV04sY0FBYyxDQUFDLENBQUNPLE9BQU8sR0FBS0EsT0FBT0MsTUFBTTtJQUUxRCxJQUFJLENBQUNILElBQUk7UUFDUCxPQUFPO0lBQ1Q7SUFFQSxNQUFNSSxhQUFhaEIsUUFDakIsSUFDRUUsaUJBQWlCO1lBQ2ZPO1lBQ0FDO1lBQ0FPLFNBQVM7Z0JBQUNkO2FBQWM7UUFDMUIsSUFDRixFQUFFO0lBR0osTUFBTWUsb0JBQW9CO1FBQ3hCLE1BQU1GLFdBQVdHLEtBQUssQ0FBQ0MsZUFBZSxDQUFDO1lBQ3JDQyxRQUFRQyxPQUFPVjtZQUNmVyxjQUFjO2dCQUNaQztvQkFDRWIsT0FBT2MsSUFBSSxDQUFDO2dCQUNkO2dCQUNBQyxTQUFRQyxLQUFVO29CQUNoQkMsUUFBUUQsS0FBSyxDQUFDLDZCQUE2QkE7b0JBQzNDdEIsTUFBTXNCLEtBQUssQ0FBQztnQkFDZDtZQUNGO1FBQ0Y7SUFDRjtJQUVBLE1BQU1FLFlBQVk7UUFDaEIsTUFBTWIsV0FBV0csS0FBSyxDQUFDVyxPQUFPLENBQUM7WUFDN0JULFFBQVFDLE9BQU9WO1lBQ2ZXLGNBQWM7Z0JBQ1pDO29CQUNFbkIsTUFBTTBCLE9BQU8sQ0FBQztvQkFDZHBCLE9BQU9xQixPQUFPO2dCQUNoQjtnQkFDQU4sU0FBUUMsS0FBVTtvQkFDaEJDLFFBQVFELEtBQUssQ0FBQyx1QkFBdUJBO29CQUNyQ3RCLE1BQU1zQixLQUFLLENBQUM7Z0JBQ2Q7WUFDRjtRQUNGO0lBQ0Y7SUFFQSxNQUFNTSxjQUFjO1FBQ2xCLE1BQU1qQixXQUFXRyxLQUFLLENBQUNlLFNBQVMsQ0FBQztZQUMvQmIsUUFBUUMsT0FBT1Y7WUFDZlcsY0FBYztnQkFDWkM7b0JBQ0VuQixNQUFNMEIsT0FBTyxDQUFDO29CQUNkcEIsT0FBT3FCLE9BQU87Z0JBQ2hCO2dCQUNBTixTQUFRQyxLQUFVO29CQUNoQkMsUUFBUUQsS0FBSyxDQUFDLHlCQUF5QkE7b0JBQ3ZDdEIsTUFBTXNCLEtBQUssQ0FBQztnQkFDZDtZQUNGO1FBQ0Y7SUFDRjtJQUVBLE1BQU1RLDBCQUEwQjtRQUM5QixNQUFNbkIsV0FBV0csS0FBSyxDQUFDaUIsa0JBQWtCLENBQUM7WUFDeENmLFFBQVFDLE9BQU9WO1lBQ2ZXLGNBQWM7Z0JBQ1pDO29CQUNFbkIsTUFBTTBCLE9BQU8sQ0FBQztvQkFDZHBCLE9BQU9xQixPQUFPO2dCQUNoQjtnQkFDQU4sU0FBUUMsS0FBVTtvQkFDaEJDLFFBQVFELEtBQUssQ0FBQyxnQ0FBZ0NBO29CQUM5Q3RCLE1BQU1zQixLQUFLLENBQUM7Z0JBQ2Q7WUFDRjtRQUNGO0lBQ0Y7SUFFQSxxQkFDRSxNQUFDNUI7OzBCQUNDLEtBQUNLO2dCQUFPaUMsU0FBU25CO2dCQUFtQm9CLGFBQVk7Z0JBQU9DLFdBQVU7Z0JBQXFCQyxNQUFLOzBCQUFTOzswQkFHcEcsS0FBQ3BDO2dCQUFPaUMsU0FBU0Y7Z0JBQXlCRyxhQUFZO2dCQUFZQyxXQUFVO2dCQUF5QkMsTUFBSzswQkFBUzs7WUFHbEgsQ0FBQzNCLHlCQUNBLEtBQUNUO2dCQUFPaUMsU0FBU1I7Z0JBQVdTLGFBQVk7Z0JBQVFDLFdBQVU7Z0JBQWFDLE1BQUs7MEJBQVM7aUJBR25GO1lBQ0gzQix5QkFDQyxLQUFDVDtnQkFBT2lDLFNBQVNKO2dCQUFhSyxhQUFZO2dCQUFVQyxXQUFVO2dCQUFlQyxNQUFLOzBCQUFTO2lCQUd6Rjs7O0FBR1YsRUFBQyJ9