'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button, toast } from "@payloadcms/ui";
import { useState } from "react";
import { usePathname } from "next/navigation";
export const SyncClerkUsersButton = ({ userCollectionSlug, apiBasePath, adminBasePath })=>{
    const [isPending, setIsPending] = useState(false);
    const path = usePathname();
    if (`${adminBasePath}/collections/${userCollectionSlug}` !== path) return null;
    const handleSync = async ()=>{
        setIsPending(true);
        try {
            const response = await fetch(`${apiBasePath}/${userCollectionSlug}/sync-from-clerk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            if (result.success) {
                toast.success(result.message || `Successfully synced users from Clerk`, {
                    duration: 5000
                });
            } else {
                toast.error(result.error || 'Failed to sync users from Clerk', {
                    duration: 5000
                });
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error syncing users from Clerk', {
                duration: 5000
            });
            console.error('Error syncing users:', error);
        } finally{
            setIsPending(false);
        }
    };
    return /*#__PURE__*/ _jsxs(_Fragment, {
        children: [
            /*#__PURE__*/ _jsx(Button, {
                className: "sync-clerk-users-button",
                disabled: isPending,
                onClick: handleSync,
                children: isPending ? 'Syncing...' : 'Sync Users'
            }),
            /*#__PURE__*/ _jsx("style", {
                children: `
        .list-header:has(.collection-list__sub-header .sync-clerk-users-button) {
          display: flex;
          align-items: center;
        }

        .list-header:has(.collection-list__sub-header .sync-clerk-users-button) .collection-list__sub-header {
          margin-left: auto;
          display: flex;
          justify-content: flex-start;
          flex-basis: 100%;
        }
        .list-header:has(.collection-list__sub-header .sync-clerk-users-button) .btn {
          flex-shrink: 0;
          margin-bottom: 0;
        }
        @media (min-width: 768px) {
          .list-header:has(.collection-list__sub-header .sync-clerk-users-button) .collection-list__sub-header {
            flex-basis: 70%;
            justify-content: flex-end;
          }
        }
        `
            })
        ]
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGVyay9wbHVnaW4vY29tcG9uZW50cy9zeW5jLWNsZXJrLXVzZXJzLWJ1dHRvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBjbGllbnQnXG5cbmltcG9ydCB7IEJ1dHRvbiwgdG9hc3QgfSBmcm9tICdAcGF5bG9hZGNtcy91aSdcbmltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB1c2VQYXRobmFtZSB9IGZyb20gJ25leHQvbmF2aWdhdGlvbidcbmltcG9ydCB0eXBlIHsgU3luY0NsZXJrVXNlcnNSZXNwb25zZSB9IGZyb20gJy4uL2NvbGxlY3Rpb25zL3VzZXJzL2VuZHBvaW50cy9zeW5jLWZyb20tY2xlcmsnXG5cbmV4cG9ydCBjb25zdCBTeW5jQ2xlcmtVc2Vyc0J1dHRvbiA9ICh7XG4gIHVzZXJDb2xsZWN0aW9uU2x1ZyxcbiAgYXBpQmFzZVBhdGgsXG4gIGFkbWluQmFzZVBhdGhcbn06IHtcbiAgdXNlckNvbGxlY3Rpb25TbHVnOiBzdHJpbmdcbiAgYXBpQmFzZVBhdGg6IHN0cmluZ1xuICBhZG1pbkJhc2VQYXRoOiBzdHJpbmdcbn0pID0+IHtcbiAgY29uc3QgW2lzUGVuZGluZywgc2V0SXNQZW5kaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBwYXRoID0gdXNlUGF0aG5hbWUoKVxuXG4gIGlmIChgJHthZG1pbkJhc2VQYXRofS9jb2xsZWN0aW9ucy8ke3VzZXJDb2xsZWN0aW9uU2x1Z31gICE9PSBwYXRoKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IGhhbmRsZVN5bmMgPSBhc3luYyAoKSA9PiB7XG4gICAgc2V0SXNQZW5kaW5nKHRydWUpXG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHthcGlCYXNlUGF0aH0vJHt1c2VyQ29sbGVjdGlvblNsdWd9L3N5bmMtZnJvbS1jbGVya2AsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IHJlc3VsdDogU3luY0NsZXJrVXNlcnNSZXNwb25zZSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuXG4gICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgdG9hc3Quc3VjY2VzcyhyZXN1bHQubWVzc2FnZSB8fCBgU3VjY2Vzc2Z1bGx5IHN5bmNlZCB1c2VycyBmcm9tIENsZXJrYCwgeyBkdXJhdGlvbjogNTAwMCB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9hc3QuZXJyb3IocmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gc3luYyB1c2VycyBmcm9tIENsZXJrJywgeyBkdXJhdGlvbjogNTAwMCB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0b2FzdC5lcnJvcihlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdFcnJvciBzeW5jaW5nIHVzZXJzIGZyb20gQ2xlcmsnLCB7IGR1cmF0aW9uOiA1MDAwIH0pXG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzeW5jaW5nIHVzZXJzOicsIGVycm9yKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRJc1BlbmRpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJzeW5jLWNsZXJrLXVzZXJzLWJ1dHRvblwiIGRpc2FibGVkPXtpc1BlbmRpbmd9IG9uQ2xpY2s9e2hhbmRsZVN5bmN9PlxuICAgICAgICB7aXNQZW5kaW5nID8gJ1N5bmNpbmcuLi4nIDogJ1N5bmMgVXNlcnMnfVxuICAgICAgPC9CdXR0b24+XG5cbiAgICAgIDxzdHlsZT5cbiAgICAgICAge2BcbiAgICAgICAgLmxpc3QtaGVhZGVyOmhhcyguY29sbGVjdGlvbi1saXN0X19zdWItaGVhZGVyIC5zeW5jLWNsZXJrLXVzZXJzLWJ1dHRvbikge1xuICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC5saXN0LWhlYWRlcjpoYXMoLmNvbGxlY3Rpb24tbGlzdF9fc3ViLWhlYWRlciAuc3luYy1jbGVyay11c2Vycy1idXR0b24pIC5jb2xsZWN0aW9uLWxpc3RfX3N1Yi1oZWFkZXIge1xuICAgICAgICAgIG1hcmdpbi1sZWZ0OiBhdXRvO1xuICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xuICAgICAgICAgIGZsZXgtYmFzaXM6IDEwMCU7XG4gICAgICAgIH1cbiAgICAgICAgLmxpc3QtaGVhZGVyOmhhcyguY29sbGVjdGlvbi1saXN0X19zdWItaGVhZGVyIC5zeW5jLWNsZXJrLXVzZXJzLWJ1dHRvbikgLmJ0biB7XG4gICAgICAgICAgZmxleC1zaHJpbms6IDA7XG4gICAgICAgICAgbWFyZ2luLWJvdHRvbTogMDtcbiAgICAgICAgfVxuICAgICAgICBAbWVkaWEgKG1pbi13aWR0aDogNzY4cHgpIHtcbiAgICAgICAgICAubGlzdC1oZWFkZXI6aGFzKC5jb2xsZWN0aW9uLWxpc3RfX3N1Yi1oZWFkZXIgLnN5bmMtY2xlcmstdXNlcnMtYnV0dG9uKSAuY29sbGVjdGlvbi1saXN0X19zdWItaGVhZGVyIHtcbiAgICAgICAgICAgIGZsZXgtYmFzaXM6IDcwJTtcbiAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGB9XG4gICAgICA8L3N0eWxlPlxuICAgIDwvPlxuICApXG59XG4iXSwibmFtZXMiOlsiQnV0dG9uIiwidG9hc3QiLCJ1c2VTdGF0ZSIsInVzZVBhdGhuYW1lIiwiU3luY0NsZXJrVXNlcnNCdXR0b24iLCJ1c2VyQ29sbGVjdGlvblNsdWciLCJhcGlCYXNlUGF0aCIsImFkbWluQmFzZVBhdGgiLCJpc1BlbmRpbmciLCJzZXRJc1BlbmRpbmciLCJwYXRoIiwiaGFuZGxlU3luYyIsInJlc3BvbnNlIiwiZmV0Y2giLCJtZXRob2QiLCJoZWFkZXJzIiwicmVzdWx0IiwianNvbiIsInN1Y2Nlc3MiLCJtZXNzYWdlIiwiZHVyYXRpb24iLCJlcnJvciIsIkVycm9yIiwiY29uc29sZSIsImNsYXNzTmFtZSIsImRpc2FibGVkIiwib25DbGljayIsInN0eWxlIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQSxTQUFTQSxNQUFNLEVBQUVDLEtBQUssUUFBUSxpQkFBZ0I7QUFDOUMsU0FBU0MsUUFBUSxRQUFRLFFBQU87QUFDaEMsU0FBU0MsV0FBVyxRQUFRLGtCQUFpQjtBQUc3QyxPQUFPLE1BQU1DLHVCQUF1QixDQUFDLEVBQ25DQyxrQkFBa0IsRUFDbEJDLFdBQVcsRUFDWEMsYUFBYSxFQUtkO0lBQ0MsTUFBTSxDQUFDQyxXQUFXQyxhQUFhLEdBQUdQLFNBQVM7SUFDM0MsTUFBTVEsT0FBT1A7SUFFYixJQUFJLEdBQUdJLGNBQWMsYUFBYSxFQUFFRixvQkFBb0IsS0FBS0ssTUFBTSxPQUFPO0lBRTFFLE1BQU1DLGFBQWE7UUFDakJGLGFBQWE7UUFFYixJQUFJO1lBQ0YsTUFBTUcsV0FBVyxNQUFNQyxNQUFNLEdBQUdQLFlBQVksQ0FBQyxFQUFFRCxtQkFBbUIsZ0JBQWdCLENBQUMsRUFBRTtnQkFDbkZTLFFBQVE7Z0JBQ1JDLFNBQVM7b0JBQ1AsZ0JBQWdCO2dCQUNsQjtZQUNGO1lBRUEsTUFBTUMsU0FBaUMsTUFBTUosU0FBU0ssSUFBSTtZQUUxRCxJQUFJRCxPQUFPRSxPQUFPLEVBQUU7Z0JBQ2xCakIsTUFBTWlCLE9BQU8sQ0FBQ0YsT0FBT0csT0FBTyxJQUFJLENBQUMsb0NBQW9DLENBQUMsRUFBRTtvQkFBRUMsVUFBVTtnQkFBSztZQUMzRixPQUFPO2dCQUNMbkIsTUFBTW9CLEtBQUssQ0FBQ0wsT0FBT0ssS0FBSyxJQUFJLG1DQUFtQztvQkFBRUQsVUFBVTtnQkFBSztZQUNsRjtRQUNGLEVBQUUsT0FBT0MsT0FBTztZQUNkcEIsTUFBTW9CLEtBQUssQ0FBQ0EsaUJBQWlCQyxRQUFRRCxNQUFNRixPQUFPLEdBQUcsa0NBQWtDO2dCQUFFQyxVQUFVO1lBQUs7WUFDeEdHLFFBQVFGLEtBQUssQ0FBQyx3QkFBd0JBO1FBQ3hDLFNBQVU7WUFDUlosYUFBYTtRQUNmO0lBQ0Y7SUFFQSxxQkFDRTs7MEJBQ0UsS0FBQ1Q7Z0JBQU93QixXQUFVO2dCQUEwQkMsVUFBVWpCO2dCQUFXa0IsU0FBU2Y7MEJBQ3ZFSCxZQUFZLGVBQWU7OzBCQUc5QixLQUFDbUI7MEJBQ0UsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQXNCRixDQUFDOzs7O0FBSVQsRUFBQyJ9