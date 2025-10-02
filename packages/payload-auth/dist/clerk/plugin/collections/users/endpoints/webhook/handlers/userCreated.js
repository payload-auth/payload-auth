import { findUserFromClerkUser } from "../../../../../../utils/user";
export async function handleUserCreated({ data, payload, userSlug, mappingFunction, options }) {
    const clerkUser = data;
    try {
        const existingUsers = await findUserFromClerkUser({
            payload,
            userSlug,
            clerkUser
        });
        if (existingUsers.docs.length === 0) {
            let userData = {
                ...mappingFunction(clerkUser)
            };
            if (!userData.role) {
                userData.role = 'user';
            }
            if (!userData.password) {
                userData.password = Array(3).fill(0).map(()=>Math.random().toString(36).slice(2)).join('');
            }
            await payload.create({
                collection: userSlug,
                data: userData
            });
            if (options.enableDebugLogs) {
                console.log(`Created new user from Clerk: ${clerkUser.id}`);
            }
        }
    } catch (error) {
        console.error('Error creating user from Clerk webhook:', error);
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jbGVyay9wbHVnaW4vY29sbGVjdGlvbnMvdXNlcnMvZW5kcG9pbnRzL3dlYmhvb2svaGFuZGxlcnMvdXNlckNyZWF0ZWQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBVc2VySlNPTiB9IGZyb20gJ0BjbGVyay9iYWNrZW5kJ1xuaW1wb3J0IHR5cGUgeyBCYXNlUGF5bG9hZCwgVXNlciB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBDbGVya1BsdWdpbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi8uLi90eXBlcydcbmltcG9ydCB7IGZpbmRVc2VyRnJvbUNsZXJrVXNlciB9IGZyb20gJy4uLy4uLy4uLy4uLy4uLy4uL3V0aWxzL3VzZXInXG5cbmludGVyZmFjZSBVc2VyQ3JlYXRlZEhhbmRsZXJQYXJhbXMge1xuICBkYXRhOiBhbnlcbiAgcGF5bG9hZDogQmFzZVBheWxvYWRcbiAgdXNlclNsdWc6IHN0cmluZ1xuICBtYXBwaW5nRnVuY3Rpb246IChjbGVya1VzZXI6IFVzZXJKU09OKSA9PiBPbWl0PFVzZXIsICdpZCc+XG4gIG9wdGlvbnM6IENsZXJrUGx1Z2luT3B0aW9uc1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlVXNlckNyZWF0ZWQoeyBkYXRhLCBwYXlsb2FkLCB1c2VyU2x1ZywgbWFwcGluZ0Z1bmN0aW9uLCBvcHRpb25zIH06IFVzZXJDcmVhdGVkSGFuZGxlclBhcmFtcyk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBjbGVya1VzZXIgPSBkYXRhIGFzIFVzZXJKU09OXG5cbiAgdHJ5IHtcbiAgICBjb25zdCBleGlzdGluZ1VzZXJzID0gYXdhaXQgZmluZFVzZXJGcm9tQ2xlcmtVc2VyKHtcbiAgICAgIHBheWxvYWQsXG4gICAgICB1c2VyU2x1ZyxcbiAgICAgIGNsZXJrVXNlclxuICAgIH0pXG5cbiAgICBpZiAoZXhpc3RpbmdVc2Vycy5kb2NzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgbGV0IHVzZXJEYXRhID0ge1xuICAgICAgICAuLi5tYXBwaW5nRnVuY3Rpb24oY2xlcmtVc2VyKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXVzZXJEYXRhLnJvbGUpIHtcbiAgICAgICAgdXNlckRhdGEucm9sZSA9ICd1c2VyJ1xuICAgICAgfVxuXG4gICAgICBpZiAoIXVzZXJEYXRhLnBhc3N3b3JkKSB7XG4gICAgICAgIHVzZXJEYXRhLnBhc3N3b3JkID0gQXJyYXkoMylcbiAgICAgICAgICAuZmlsbCgwKVxuICAgICAgICAgIC5tYXAoKCkgPT4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMikpXG4gICAgICAgICAgLmpvaW4oJycpXG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHBheWxvYWQuY3JlYXRlKHtcbiAgICAgICAgY29sbGVjdGlvbjogdXNlclNsdWcsXG4gICAgICAgIGRhdGE6IHVzZXJEYXRhXG4gICAgICB9KVxuXG4gICAgICBpZiAob3B0aW9ucy5lbmFibGVEZWJ1Z0xvZ3MpIHtcbiAgICAgICAgY29uc29sZS5sb2coYENyZWF0ZWQgbmV3IHVzZXIgZnJvbSBDbGVyazogJHtjbGVya1VzZXIuaWR9YClcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgdXNlciBmcm9tIENsZXJrIHdlYmhvb2s6JywgZXJyb3IpXG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJmaW5kVXNlckZyb21DbGVya1VzZXIiLCJoYW5kbGVVc2VyQ3JlYXRlZCIsImRhdGEiLCJwYXlsb2FkIiwidXNlclNsdWciLCJtYXBwaW5nRnVuY3Rpb24iLCJvcHRpb25zIiwiY2xlcmtVc2VyIiwiZXhpc3RpbmdVc2VycyIsImRvY3MiLCJsZW5ndGgiLCJ1c2VyRGF0YSIsInJvbGUiLCJwYXNzd29yZCIsIkFycmF5IiwiZmlsbCIsIm1hcCIsIk1hdGgiLCJyYW5kb20iLCJ0b1N0cmluZyIsInNsaWNlIiwiam9pbiIsImNyZWF0ZSIsImNvbGxlY3Rpb24iLCJlbmFibGVEZWJ1Z0xvZ3MiLCJjb25zb2xlIiwibG9nIiwiaWQiLCJlcnJvciJdLCJtYXBwaW5ncyI6IkFBR0EsU0FBU0EscUJBQXFCLFFBQVEsK0JBQThCO0FBVXBFLE9BQU8sZUFBZUMsa0JBQWtCLEVBQUVDLElBQUksRUFBRUMsT0FBTyxFQUFFQyxRQUFRLEVBQUVDLGVBQWUsRUFBRUMsT0FBTyxFQUE0QjtJQUNySCxNQUFNQyxZQUFZTDtJQUVsQixJQUFJO1FBQ0YsTUFBTU0sZ0JBQWdCLE1BQU1SLHNCQUFzQjtZQUNoREc7WUFDQUM7WUFDQUc7UUFDRjtRQUVBLElBQUlDLGNBQWNDLElBQUksQ0FBQ0MsTUFBTSxLQUFLLEdBQUc7WUFDbkMsSUFBSUMsV0FBVztnQkFDYixHQUFHTixnQkFBZ0JFLFVBQVU7WUFDL0I7WUFFQSxJQUFJLENBQUNJLFNBQVNDLElBQUksRUFBRTtnQkFDbEJELFNBQVNDLElBQUksR0FBRztZQUNsQjtZQUVBLElBQUksQ0FBQ0QsU0FBU0UsUUFBUSxFQUFFO2dCQUN0QkYsU0FBU0UsUUFBUSxHQUFHQyxNQUFNLEdBQ3ZCQyxJQUFJLENBQUMsR0FDTEMsR0FBRyxDQUFDLElBQU1DLEtBQUtDLE1BQU0sR0FBR0MsUUFBUSxDQUFDLElBQUlDLEtBQUssQ0FBQyxJQUMzQ0MsSUFBSSxDQUFDO1lBQ1Y7WUFFQSxNQUFNbEIsUUFBUW1CLE1BQU0sQ0FBQztnQkFDbkJDLFlBQVluQjtnQkFDWkYsTUFBTVM7WUFDUjtZQUVBLElBQUlMLFFBQVFrQixlQUFlLEVBQUU7Z0JBQzNCQyxRQUFRQyxHQUFHLENBQUMsQ0FBQyw2QkFBNkIsRUFBRW5CLFVBQVVvQixFQUFFLEVBQUU7WUFDNUQ7UUFDRjtJQUNGLEVBQUUsT0FBT0MsT0FBTztRQUNkSCxRQUFRRyxLQUFLLENBQUMsMkNBQTJDQTtJQUMzRDtBQUNGIn0=