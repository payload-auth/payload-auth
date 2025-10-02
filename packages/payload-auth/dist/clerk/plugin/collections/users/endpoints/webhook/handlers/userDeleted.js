import { findUserFromClerkUser } from "../../../../../../utils/user";
export async function handleUserDeleted({ data, payload, userSlug, options }) {
    const clerkId = data.id;
    try {
        const existingUsers = await findUserFromClerkUser({
            payload,
            userSlug,
            clerkUser: {
                id: clerkId
            }
        });
        if (existingUsers.docs.length > 0) {
            const existingUser = existingUsers.docs[0];
            await payload.delete({
                collection: userSlug,
                id: existingUser.id
            });
            if (options.enableDebugLogs) {
                console.log(`Deleted user from Clerk: ${clerkId}`);
            }
        }
    } catch (error) {
        console.error('Error deleting user from Clerk webhook:', error);
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jbGVyay9wbHVnaW4vY29sbGVjdGlvbnMvdXNlcnMvZW5kcG9pbnRzL3dlYmhvb2svaGFuZGxlcnMvdXNlckRlbGV0ZWQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGF5bG9hZCB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBDbGVya1BsdWdpbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi8uLi90eXBlcydcbmltcG9ydCB7IGZpbmRVc2VyRnJvbUNsZXJrVXNlciB9IGZyb20gJy4uLy4uLy4uLy4uLy4uLy4uL3V0aWxzL3VzZXInXG5cbmludGVyZmFjZSBVc2VyRGVsZXRlZEhhbmRsZXJQYXJhbXMge1xuICBkYXRhOiBhbnlcbiAgcGF5bG9hZDogUGF5bG9hZFxuICB1c2VyU2x1Zzogc3RyaW5nXG4gIG9wdGlvbnM6IENsZXJrUGx1Z2luT3B0aW9uc1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlVXNlckRlbGV0ZWQoeyBkYXRhLCBwYXlsb2FkLCB1c2VyU2x1Zywgb3B0aW9ucyB9OiBVc2VyRGVsZXRlZEhhbmRsZXJQYXJhbXMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgY2xlcmtJZCA9IGRhdGEuaWRcblxuICB0cnkge1xuICAgIGNvbnN0IGV4aXN0aW5nVXNlcnMgPSBhd2FpdCBmaW5kVXNlckZyb21DbGVya1VzZXIoe1xuICAgICAgcGF5bG9hZCxcbiAgICAgIHVzZXJTbHVnLFxuICAgICAgY2xlcmtVc2VyOiB7IGlkOiBjbGVya0lkIH1cbiAgICB9KVxuXG4gICAgaWYgKGV4aXN0aW5nVXNlcnMuZG9jcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBleGlzdGluZ1VzZXIgPSBleGlzdGluZ1VzZXJzLmRvY3NbMF1cblxuICAgICAgYXdhaXQgcGF5bG9hZC5kZWxldGUoe1xuICAgICAgICBjb2xsZWN0aW9uOiB1c2VyU2x1ZyxcbiAgICAgICAgaWQ6IGV4aXN0aW5nVXNlci5pZFxuICAgICAgfSlcblxuICAgICAgaWYgKG9wdGlvbnMuZW5hYmxlRGVidWdMb2dzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBEZWxldGVkIHVzZXIgZnJvbSBDbGVyazogJHtjbGVya0lkfWApXG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIHVzZXIgZnJvbSBDbGVyayB3ZWJob29rOicsIGVycm9yKVxuICB9XG59XG4iXSwibmFtZXMiOlsiZmluZFVzZXJGcm9tQ2xlcmtVc2VyIiwiaGFuZGxlVXNlckRlbGV0ZWQiLCJkYXRhIiwicGF5bG9hZCIsInVzZXJTbHVnIiwib3B0aW9ucyIsImNsZXJrSWQiLCJpZCIsImV4aXN0aW5nVXNlcnMiLCJjbGVya1VzZXIiLCJkb2NzIiwibGVuZ3RoIiwiZXhpc3RpbmdVc2VyIiwiZGVsZXRlIiwiY29sbGVjdGlvbiIsImVuYWJsZURlYnVnTG9ncyIsImNvbnNvbGUiLCJsb2ciLCJlcnJvciJdLCJtYXBwaW5ncyI6IkFBRUEsU0FBU0EscUJBQXFCLFFBQVEsK0JBQThCO0FBU3BFLE9BQU8sZUFBZUMsa0JBQWtCLEVBQUVDLElBQUksRUFBRUMsT0FBTyxFQUFFQyxRQUFRLEVBQUVDLE9BQU8sRUFBNEI7SUFDcEcsTUFBTUMsVUFBVUosS0FBS0ssRUFBRTtJQUV2QixJQUFJO1FBQ0YsTUFBTUMsZ0JBQWdCLE1BQU1SLHNCQUFzQjtZQUNoREc7WUFDQUM7WUFDQUssV0FBVztnQkFBRUYsSUFBSUQ7WUFBUTtRQUMzQjtRQUVBLElBQUlFLGNBQWNFLElBQUksQ0FBQ0MsTUFBTSxHQUFHLEdBQUc7WUFDakMsTUFBTUMsZUFBZUosY0FBY0UsSUFBSSxDQUFDLEVBQUU7WUFFMUMsTUFBTVAsUUFBUVUsTUFBTSxDQUFDO2dCQUNuQkMsWUFBWVY7Z0JBQ1pHLElBQUlLLGFBQWFMLEVBQUU7WUFDckI7WUFFQSxJQUFJRixRQUFRVSxlQUFlLEVBQUU7Z0JBQzNCQyxRQUFRQyxHQUFHLENBQUMsQ0FBQyx5QkFBeUIsRUFBRVgsU0FBUztZQUNuRDtRQUNGO0lBQ0YsRUFBRSxPQUFPWSxPQUFPO1FBQ2RGLFFBQVFFLEtBQUssQ0FBQywyQ0FBMkNBO0lBQzNEO0FBQ0YifQ==