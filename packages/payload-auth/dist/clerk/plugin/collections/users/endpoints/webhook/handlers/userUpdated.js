import { findUserFromClerkUser } from "../../../../../../utils/user";
export async function handleUserUpdated({ data, payload, userSlug, mappingFunction, options }) {
    const clerkUser = data;
    try {
        const existingUsers = await findUserFromClerkUser({
            payload,
            userSlug,
            clerkUser
        });
        if (existingUsers.docs.length > 0) {
            const existingUser = existingUsers.docs[0];
            let userData = {
                ...mappingFunction(clerkUser)
            };
            if ('role' in userData) {
                const { role, ...dataWithoutRole } = userData;
                userData = dataWithoutRole;
            }
            await payload.update({
                collection: userSlug,
                id: existingUser.id,
                data: userData
            });
            if (options.enableDebugLogs) {
                console.log(`Updated user from Clerk: ${clerkUser.id}`);
            }
        } else if (options.enableDebugLogs) {
            console.log(`Attempted to update non-existent user: ${clerkUser.id}`);
        }
    } catch (error) {
        console.error('Error updating user from Clerk webhook:', error);
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jbGVyay9wbHVnaW4vY29sbGVjdGlvbnMvdXNlcnMvZW5kcG9pbnRzL3dlYmhvb2svaGFuZGxlcnMvdXNlclVwZGF0ZWQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGF5bG9hZCwgVXNlciB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBDbGVya1BsdWdpbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi8uLi90eXBlcydcbmltcG9ydCB7IGZpbmRVc2VyRnJvbUNsZXJrVXNlciB9IGZyb20gJy4uLy4uLy4uLy4uLy4uLy4uL3V0aWxzL3VzZXInXG5pbXBvcnQgdHlwZSB7IFVzZXJKU09OIH0gZnJvbSAnQGNsZXJrL3R5cGVzJ1xuXG5pbnRlcmZhY2UgVXNlclVwZGF0ZWRIYW5kbGVyUGFyYW1zIHtcbiAgZGF0YTogYW55XG4gIHBheWxvYWQ6IFBheWxvYWRcbiAgdXNlclNsdWc6IHN0cmluZ1xuICBtYXBwaW5nRnVuY3Rpb246IChjbGVya1VzZXI6IFBhcnRpYWw8VXNlckpTT04+KSA9PiBPbWl0PFVzZXIsICdpZCc+XG4gIG9wdGlvbnM6IENsZXJrUGx1Z2luT3B0aW9uc1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlVXNlclVwZGF0ZWQoeyBkYXRhLCBwYXlsb2FkLCB1c2VyU2x1ZywgbWFwcGluZ0Z1bmN0aW9uLCBvcHRpb25zIH06IFVzZXJVcGRhdGVkSGFuZGxlclBhcmFtcyk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBjbGVya1VzZXIgPSBkYXRhIGFzIFVzZXJKU09OXG5cbiAgdHJ5IHtcbiAgICBjb25zdCBleGlzdGluZ1VzZXJzID0gYXdhaXQgZmluZFVzZXJGcm9tQ2xlcmtVc2VyKHtcbiAgICAgIHBheWxvYWQsXG4gICAgICB1c2VyU2x1ZyxcbiAgICAgIGNsZXJrVXNlclxuICAgIH0pXG5cbiAgICBpZiAoZXhpc3RpbmdVc2Vycy5kb2NzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nVXNlciA9IGV4aXN0aW5nVXNlcnMuZG9jc1swXVxuXG4gICAgICBsZXQgdXNlckRhdGEgPSB7XG4gICAgICAgIC4uLm1hcHBpbmdGdW5jdGlvbihjbGVya1VzZXIpXG4gICAgICB9XG5cbiAgICAgIGlmICgncm9sZScgaW4gdXNlckRhdGEpIHtcbiAgICAgICAgY29uc3QgeyByb2xlLCAuLi5kYXRhV2l0aG91dFJvbGUgfSA9IHVzZXJEYXRhXG4gICAgICAgIHVzZXJEYXRhID0gZGF0YVdpdGhvdXRSb2xlXG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHBheWxvYWQudXBkYXRlKHtcbiAgICAgICAgY29sbGVjdGlvbjogdXNlclNsdWcsXG4gICAgICAgIGlkOiBleGlzdGluZ1VzZXIuaWQsXG4gICAgICAgIGRhdGE6IHVzZXJEYXRhXG4gICAgICB9KVxuXG4gICAgICBpZiAob3B0aW9ucy5lbmFibGVEZWJ1Z0xvZ3MpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVwZGF0ZWQgdXNlciBmcm9tIENsZXJrOiAke2NsZXJrVXNlci5pZH1gKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5lbmFibGVEZWJ1Z0xvZ3MpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBBdHRlbXB0ZWQgdG8gdXBkYXRlIG5vbi1leGlzdGVudCB1c2VyOiAke2NsZXJrVXNlci5pZH1gKVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyB1c2VyIGZyb20gQ2xlcmsgd2ViaG9vazonLCBlcnJvcilcbiAgfVxufVxuIl0sIm5hbWVzIjpbImZpbmRVc2VyRnJvbUNsZXJrVXNlciIsImhhbmRsZVVzZXJVcGRhdGVkIiwiZGF0YSIsInBheWxvYWQiLCJ1c2VyU2x1ZyIsIm1hcHBpbmdGdW5jdGlvbiIsIm9wdGlvbnMiLCJjbGVya1VzZXIiLCJleGlzdGluZ1VzZXJzIiwiZG9jcyIsImxlbmd0aCIsImV4aXN0aW5nVXNlciIsInVzZXJEYXRhIiwicm9sZSIsImRhdGFXaXRob3V0Um9sZSIsInVwZGF0ZSIsImNvbGxlY3Rpb24iLCJpZCIsImVuYWJsZURlYnVnTG9ncyIsImNvbnNvbGUiLCJsb2ciLCJlcnJvciJdLCJtYXBwaW5ncyI6IkFBRUEsU0FBU0EscUJBQXFCLFFBQVEsK0JBQThCO0FBV3BFLE9BQU8sZUFBZUMsa0JBQWtCLEVBQUVDLElBQUksRUFBRUMsT0FBTyxFQUFFQyxRQUFRLEVBQUVDLGVBQWUsRUFBRUMsT0FBTyxFQUE0QjtJQUNySCxNQUFNQyxZQUFZTDtJQUVsQixJQUFJO1FBQ0YsTUFBTU0sZ0JBQWdCLE1BQU1SLHNCQUFzQjtZQUNoREc7WUFDQUM7WUFDQUc7UUFDRjtRQUVBLElBQUlDLGNBQWNDLElBQUksQ0FBQ0MsTUFBTSxHQUFHLEdBQUc7WUFDakMsTUFBTUMsZUFBZUgsY0FBY0MsSUFBSSxDQUFDLEVBQUU7WUFFMUMsSUFBSUcsV0FBVztnQkFDYixHQUFHUCxnQkFBZ0JFLFVBQVU7WUFDL0I7WUFFQSxJQUFJLFVBQVVLLFVBQVU7Z0JBQ3RCLE1BQU0sRUFBRUMsSUFBSSxFQUFFLEdBQUdDLGlCQUFpQixHQUFHRjtnQkFDckNBLFdBQVdFO1lBQ2I7WUFFQSxNQUFNWCxRQUFRWSxNQUFNLENBQUM7Z0JBQ25CQyxZQUFZWjtnQkFDWmEsSUFBSU4sYUFBYU0sRUFBRTtnQkFDbkJmLE1BQU1VO1lBQ1I7WUFFQSxJQUFJTixRQUFRWSxlQUFlLEVBQUU7Z0JBQzNCQyxRQUFRQyxHQUFHLENBQUMsQ0FBQyx5QkFBeUIsRUFBRWIsVUFBVVUsRUFBRSxFQUFFO1lBQ3hEO1FBQ0YsT0FBTyxJQUFJWCxRQUFRWSxlQUFlLEVBQUU7WUFDbENDLFFBQVFDLEdBQUcsQ0FBQyxDQUFDLHVDQUF1QyxFQUFFYixVQUFVVSxFQUFFLEVBQUU7UUFDdEU7SUFDRixFQUFFLE9BQU9JLE9BQU87UUFDZEYsUUFBUUUsS0FBSyxDQUFDLDJDQUEyQ0E7SUFDM0Q7QUFDRiJ9