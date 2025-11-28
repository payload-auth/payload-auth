'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback } from "react";
import { useConfig } from "@payloadcms/ui";
import { PasskeyList } from "./list";
import { PassKeyAddButton } from "./add-button";
export const PasskeysClient = ({ initialPasskeys, documentId, currentUserId, passkeySlug, passkeyUserIdFieldName, baseURL, basePath })=>{
    const { config: { routes: { api: apiRoute } } } = useConfig();
    const [passkeys, setPasskeys] = useState(initialPasskeys);
    const fetchPasskeys = useCallback(async ()=>{
        const url = `${apiRoute}/${passkeySlug}?where[${passkeyUserIdFieldName}][equals]=${documentId}`;
        const res = await fetch(url, {
            credentials: 'include'
        });
        if (!res.ok) return;
        const data = await res.json();
        setPasskeys(data.docs);
    }, [
        apiRoute,
        passkeySlug,
        passkeyUserIdFieldName,
        documentId
    ]);
    useEffect(()=>{
        void fetchPasskeys();
    }, [
        fetchPasskeys
    ]);
    const handleDelete = useCallback(async (id)=>{
        const res = await fetch(`${apiRoute}/${passkeySlug}/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!res.ok) return;
        void fetchPasskeys();
    }, [
        apiRoute,
        passkeySlug,
        fetchPasskeys
    ]);
    const handleAdd = useCallback(()=>{
        void fetchPasskeys();
    }, [
        fetchPasskeys
    ]);
    return /*#__PURE__*/ _jsxs(_Fragment, {
        children: [
            /*#__PURE__*/ _jsx(PasskeyList, {
                passkeys: passkeys,
                onDelete: handleDelete
            }),
            currentUserId === documentId && /*#__PURE__*/ _jsx(PassKeyAddButton, {
                onAdd: handleAdd,
                baseURL: baseURL,
                basePath: basePath
            })
        ]
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC9jb21wb25lbnRzL3Bhc3NrZXlzL2NsaWVudC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBjbGllbnQnXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlQ29uZmlnIH0gZnJvbSAnQHBheWxvYWRjbXMvdWknXG5pbXBvcnQgdHlwZSB7IFBhc3NrZXlzQ2xpZW50Q29tcG9uZW50UHJvcHMsIFBhc3NrZXlXaXRoSWQgfSBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHsgUGFzc2tleUxpc3QgfSBmcm9tICcuL2xpc3QnXG5pbXBvcnQgeyBQYXNzS2V5QWRkQnV0dG9uIH0gZnJvbSAnLi9hZGQtYnV0dG9uJ1xuXG5leHBvcnQgY29uc3QgUGFzc2tleXNDbGllbnQ6IFJlYWN0LkZDPFBhc3NrZXlzQ2xpZW50Q29tcG9uZW50UHJvcHM+ID0gKHtcbiAgaW5pdGlhbFBhc3NrZXlzLFxuICBkb2N1bWVudElkLFxuICBjdXJyZW50VXNlcklkLFxuICBwYXNza2V5U2x1ZyxcbiAgcGFzc2tleVVzZXJJZEZpZWxkTmFtZSxcbiAgYmFzZVVSTCxcbiAgYmFzZVBhdGhcbn0pID0+IHtcbiAgY29uc3Qge1xuICAgIGNvbmZpZzoge1xuICAgICAgcm91dGVzOiB7IGFwaTogYXBpUm91dGUgfVxuICAgIH1cbiAgfSA9IHVzZUNvbmZpZygpXG5cbiAgY29uc3QgW3Bhc3NrZXlzLCBzZXRQYXNza2V5c10gPSB1c2VTdGF0ZTxQYXNza2V5V2l0aElkW10+KGluaXRpYWxQYXNza2V5cylcblxuICBjb25zdCBmZXRjaFBhc3NrZXlzID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHVybCA9IGAke2FwaVJvdXRlfS8ke3Bhc3NrZXlTbHVnfT93aGVyZVske3Bhc3NrZXlVc2VySWRGaWVsZE5hbWV9XVtlcXVhbHNdPSR7ZG9jdW1lbnRJZH1gXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2godXJsLCB7IGNyZWRlbnRpYWxzOiAnaW5jbHVkZScgfSlcbiAgICBpZiAoIXJlcy5vaykgcmV0dXJuXG4gICAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpKSBhcyB7IGRvY3M6IFBhc3NrZXlXaXRoSWRbXSB9XG4gICAgc2V0UGFzc2tleXMoZGF0YS5kb2NzKVxuICB9LCBbYXBpUm91dGUsIHBhc3NrZXlTbHVnLCBwYXNza2V5VXNlcklkRmllbGROYW1lLCBkb2N1bWVudElkXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHZvaWQgZmV0Y2hQYXNza2V5cygpXG4gIH0sIFtmZXRjaFBhc3NrZXlzXSlcblxuICBjb25zdCBoYW5kbGVEZWxldGUgPSB1c2VDYWxsYmFjayhcbiAgICBhc3luYyAoaWQ6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7YXBpUm91dGV9LyR7cGFzc2tleVNsdWd9LyR7aWR9YCwgeyBtZXRob2Q6ICdERUxFVEUnLCBjcmVkZW50aWFsczogJ2luY2x1ZGUnIH0pXG4gICAgICBpZiAoIXJlcy5vaykgcmV0dXJuXG4gICAgICB2b2lkIGZldGNoUGFzc2tleXMoKVxuICAgIH0sXG4gICAgW2FwaVJvdXRlLCBwYXNza2V5U2x1ZywgZmV0Y2hQYXNza2V5c11cbiAgKVxuXG4gIGNvbnN0IGhhbmRsZUFkZCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICB2b2lkIGZldGNoUGFzc2tleXMoKVxuICB9LCBbZmV0Y2hQYXNza2V5c10pXG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPFBhc3NrZXlMaXN0IHBhc3NrZXlzPXtwYXNza2V5c30gb25EZWxldGU9e2hhbmRsZURlbGV0ZX0gLz5cbiAgICAgIHtjdXJyZW50VXNlcklkID09PSBkb2N1bWVudElkICYmIDxQYXNzS2V5QWRkQnV0dG9uIG9uQWRkPXtoYW5kbGVBZGR9IGJhc2VVUkw9e2Jhc2VVUkx9IGJhc2VQYXRoPXtiYXNlUGF0aH0gLz59XG4gICAgPC8+XG4gIClcbn1cbiJdLCJuYW1lcyI6WyJSZWFjdCIsInVzZVN0YXRlIiwidXNlRWZmZWN0IiwidXNlQ2FsbGJhY2siLCJ1c2VDb25maWciLCJQYXNza2V5TGlzdCIsIlBhc3NLZXlBZGRCdXR0b24iLCJQYXNza2V5c0NsaWVudCIsImluaXRpYWxQYXNza2V5cyIsImRvY3VtZW50SWQiLCJjdXJyZW50VXNlcklkIiwicGFzc2tleVNsdWciLCJwYXNza2V5VXNlcklkRmllbGROYW1lIiwiYmFzZVVSTCIsImJhc2VQYXRoIiwiY29uZmlnIiwicm91dGVzIiwiYXBpIiwiYXBpUm91dGUiLCJwYXNza2V5cyIsInNldFBhc3NrZXlzIiwiZmV0Y2hQYXNza2V5cyIsInVybCIsInJlcyIsImZldGNoIiwiY3JlZGVudGlhbHMiLCJvayIsImRhdGEiLCJqc29uIiwiZG9jcyIsImhhbmRsZURlbGV0ZSIsImlkIiwibWV0aG9kIiwiaGFuZGxlQWRkIiwib25EZWxldGUiLCJvbkFkZCJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsT0FBT0EsU0FBU0MsUUFBUSxFQUFFQyxTQUFTLEVBQUVDLFdBQVcsUUFBUSxRQUFPO0FBQy9ELFNBQVNDLFNBQVMsUUFBUSxpQkFBZ0I7QUFFMUMsU0FBU0MsV0FBVyxRQUFRLFNBQVE7QUFDcEMsU0FBU0MsZ0JBQWdCLFFBQVEsZUFBYztBQUUvQyxPQUFPLE1BQU1DLGlCQUF5RCxDQUFDLEVBQ3JFQyxlQUFlLEVBQ2ZDLFVBQVUsRUFDVkMsYUFBYSxFQUNiQyxXQUFXLEVBQ1hDLHNCQUFzQixFQUN0QkMsT0FBTyxFQUNQQyxRQUFRLEVBQ1Q7SUFDQyxNQUFNLEVBQ0pDLFFBQVEsRUFDTkMsUUFBUSxFQUFFQyxLQUFLQyxRQUFRLEVBQUUsRUFDMUIsRUFDRixHQUFHZDtJQUVKLE1BQU0sQ0FBQ2UsVUFBVUMsWUFBWSxHQUFHbkIsU0FBMEJPO0lBRTFELE1BQU1hLGdCQUFnQmxCLFlBQVk7UUFDaEMsTUFBTW1CLE1BQU0sR0FBR0osU0FBUyxDQUFDLEVBQUVQLFlBQVksT0FBTyxFQUFFQyx1QkFBdUIsVUFBVSxFQUFFSCxZQUFZO1FBQy9GLE1BQU1jLE1BQU0sTUFBTUMsTUFBTUYsS0FBSztZQUFFRyxhQUFhO1FBQVU7UUFDdEQsSUFBSSxDQUFDRixJQUFJRyxFQUFFLEVBQUU7UUFDYixNQUFNQyxPQUFRLE1BQU1KLElBQUlLLElBQUk7UUFDNUJSLFlBQVlPLEtBQUtFLElBQUk7SUFDdkIsR0FBRztRQUFDWDtRQUFVUDtRQUFhQztRQUF3Qkg7S0FBVztJQUU5RFAsVUFBVTtRQUNSLEtBQUttQjtJQUNQLEdBQUc7UUFBQ0E7S0FBYztJQUVsQixNQUFNUyxlQUFlM0IsWUFDbkIsT0FBTzRCO1FBQ0wsTUFBTVIsTUFBTSxNQUFNQyxNQUFNLEdBQUdOLFNBQVMsQ0FBQyxFQUFFUCxZQUFZLENBQUMsRUFBRW9CLElBQUksRUFBRTtZQUFFQyxRQUFRO1lBQVVQLGFBQWE7UUFBVTtRQUN2RyxJQUFJLENBQUNGLElBQUlHLEVBQUUsRUFBRTtRQUNiLEtBQUtMO0lBQ1AsR0FDQTtRQUFDSDtRQUFVUDtRQUFhVTtLQUFjO0lBR3hDLE1BQU1ZLFlBQVk5QixZQUFZO1FBQzVCLEtBQUtrQjtJQUNQLEdBQUc7UUFBQ0E7S0FBYztJQUVsQixxQkFDRTs7MEJBQ0UsS0FBQ2hCO2dCQUFZYyxVQUFVQTtnQkFBVWUsVUFBVUo7O1lBQzFDcEIsa0JBQWtCRCw0QkFBYyxLQUFDSDtnQkFBaUI2QixPQUFPRjtnQkFBV3BCLFNBQVNBO2dCQUFTQyxVQUFVQTs7OztBQUd2RyxFQUFDIn0=