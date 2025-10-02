import { APIError } from "payload";
import { createClerkClient } from "@clerk/backend";
import { getPrimaryEmail } from "../../../../utils";
export const syncClerkUsersEndpoint = ({ userCollectionSlug })=>{
    return {
        path: '/sync-from-clerk',
        method: 'post',
        handler: async (req)=>{
            try {
                const { payload } = req;
                const mappingFunction = payload.config.custom.clerkPlugin.clerkToPayloadMapping;
                if (!process.env.CLERK_SECRET_KEY) {
                    throw new APIError('CLERK_SECRET_KEY is not defined', 400);
                }
                const clerkClient = createClerkClient({
                    secretKey: process.env.CLERK_SECRET_KEY
                });
                const totalUsers = await clerkClient.users.getCount();
                const limit = 100;
                const totalPages = Math.ceil(totalUsers / limit);
                let allUsers = [];
                for(let page = 0; page < totalPages; page++){
                    const offset = page * limit;
                    const pageUsers = await fetch(`https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`, {
                        headers: {
                            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
                        }
                    });
                    const pageUsersData = await pageUsers.json();
                    allUsers = [
                        ...allUsers,
                        ...pageUsersData
                    ];
                    console.log(`Fetched page ${page + 1}/${totalPages}, users: ${pageUsersData.length}`);
                }
                let created = 0;
                let updated = 0;
                for (const clerkUser of allUsers){
                    const payloadUserData = mappingFunction(clerkUser);
                    const randomPassword = Array(3).fill(0).map(()=>Math.random().toString(36).slice(2)).join('');
                    let existingUser = await payload.find({
                        collection: userCollectionSlug,
                        where: {
                            clerkId: {
                                equals: clerkUser.id
                            }
                        }
                    });
                    if (!existingUser.docs.length && clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
                        const primaryEmail = getPrimaryEmail(clerkUser);
                        if (primaryEmail) {
                            existingUser = await payload.find({
                                collection: userCollectionSlug,
                                where: {
                                    email: {
                                        equals: primaryEmail
                                    }
                                }
                            });
                        }
                    }
                    if (existingUser.docs.length > 0) {
                        await payload.update({
                            collection: userCollectionSlug,
                            id: existingUser.docs[0].id,
                            data: payloadUserData
                        });
                        updated++;
                    } else {
                        await payload.create({
                            collection: userCollectionSlug,
                            data: {
                                ...payloadUserData,
                                password: randomPassword
                            }
                        });
                        created++;
                    }
                }
                console.log(`Synced ${allUsers.length} users from Clerk. Created: ${created}, Updated: ${updated}`);
                const response = {
                    syncedUsers: allUsers.length,
                    success: true,
                    message: `Successfully synced ${allUsers.length} users from Clerk. Created: ${created}, Updated: ${updated}`,
                    count: allUsers.length,
                    created,
                    updated
                };
                return new Response(JSON.stringify(response), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.error('Error syncing users from Clerk:', error);
                const errorResponse = {
                    syncedUsers: 0,
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to sync users from Clerk'
                };
                throw new APIError(errorResponse.error || 'Unknown error', 500);
            }
        }
    };
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jbGVyay9wbHVnaW4vY29sbGVjdGlvbnMvdXNlcnMvZW5kcG9pbnRzL3N5bmMtZnJvbS1jbGVyay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElFcnJvciwgRW5kcG9pbnQgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHsgY3JlYXRlQ2xlcmtDbGllbnQgfSBmcm9tICdAY2xlcmsvYmFja2VuZCdcbmltcG9ydCB0eXBlIHsgVXNlciB9IGZyb20gJ0BjbGVyay9iYWNrZW5kJ1xuaW1wb3J0IHsgZ2V0UHJpbWFyeUVtYWlsIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgU3luY0NsZXJrVXNlcnNSZXNwb25zZSB7XG4gIHN5bmNlZFVzZXJzOiBudW1iZXJcbiAgc3VjY2VzczogYm9vbGVhblxuICBtZXNzYWdlPzogc3RyaW5nXG4gIGVycm9yPzogc3RyaW5nXG4gIGNvdW50PzogbnVtYmVyXG4gIGNyZWF0ZWQ/OiBudW1iZXJcbiAgdXBkYXRlZD86IG51bWJlclxufVxuXG5leHBvcnQgY29uc3Qgc3luY0NsZXJrVXNlcnNFbmRwb2ludCA9ICh7IHVzZXJDb2xsZWN0aW9uU2x1ZyB9OiB7IHVzZXJDb2xsZWN0aW9uU2x1Zzogc3RyaW5nIH0pOiBFbmRwb2ludCA9PiB7XG4gIHJldHVybiB7XG4gICAgcGF0aDogJy9zeW5jLWZyb20tY2xlcmsnLFxuICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgIGhhbmRsZXI6IGFzeW5jIChyZXEpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgcGF5bG9hZCB9ID0gcmVxXG4gICAgICAgIGNvbnN0IG1hcHBpbmdGdW5jdGlvbiA9IHBheWxvYWQuY29uZmlnLmN1c3RvbS5jbGVya1BsdWdpbi5jbGVya1RvUGF5bG9hZE1hcHBpbmdcblxuICAgICAgICBpZiAoIXByb2Nlc3MuZW52LkNMRVJLX1NFQ1JFVF9LRVkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgQVBJRXJyb3IoJ0NMRVJLX1NFQ1JFVF9LRVkgaXMgbm90IGRlZmluZWQnLCA0MDApXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGVya0NsaWVudCA9IGNyZWF0ZUNsZXJrQ2xpZW50KHtcbiAgICAgICAgICBzZWNyZXRLZXk6IHByb2Nlc3MuZW52LkNMRVJLX1NFQ1JFVF9LRVlcbiAgICAgICAgfSlcblxuICAgICAgICBjb25zdCB0b3RhbFVzZXJzID0gYXdhaXQgY2xlcmtDbGllbnQudXNlcnMuZ2V0Q291bnQoKVxuXG4gICAgICAgIGNvbnN0IGxpbWl0ID0gMTAwXG4gICAgICAgIGNvbnN0IHRvdGFsUGFnZXMgPSBNYXRoLmNlaWwodG90YWxVc2VycyAvIGxpbWl0KVxuICAgICAgICBsZXQgYWxsVXNlcnM6IFVzZXJbXSA9IFtdXG5cbiAgICAgICAgZm9yIChsZXQgcGFnZSA9IDA7IHBhZ2UgPCB0b3RhbFBhZ2VzOyBwYWdlKyspIHtcbiAgICAgICAgICBjb25zdCBvZmZzZXQgPSBwYWdlICogbGltaXRcbiAgICAgICAgICBjb25zdCBwYWdlVXNlcnMgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkuY2xlcmsuY29tL3YxL3VzZXJzP2xpbWl0PSR7bGltaXR9Jm9mZnNldD0ke29mZnNldH1gLCB7XG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHtwcm9jZXNzLmVudi5DTEVSS19TRUNSRVRfS0VZfWBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgY29uc3QgcGFnZVVzZXJzRGF0YSA9IGF3YWl0IHBhZ2VVc2Vycy5qc29uKClcblxuICAgICAgICAgIGFsbFVzZXJzID0gWy4uLmFsbFVzZXJzLCAuLi5wYWdlVXNlcnNEYXRhXVxuXG4gICAgICAgICAgY29uc29sZS5sb2coYEZldGNoZWQgcGFnZSAke3BhZ2UgKyAxfS8ke3RvdGFsUGFnZXN9LCB1c2VyczogJHtwYWdlVXNlcnNEYXRhLmxlbmd0aH1gKVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNyZWF0ZWQgPSAwXG4gICAgICAgIGxldCB1cGRhdGVkID0gMFxuXG4gICAgICAgIGZvciAoY29uc3QgY2xlcmtVc2VyIG9mIGFsbFVzZXJzKSB7XG4gICAgICAgICAgY29uc3QgcGF5bG9hZFVzZXJEYXRhID0gbWFwcGluZ0Z1bmN0aW9uKGNsZXJrVXNlcilcblxuICAgICAgICAgIGNvbnN0IHJhbmRvbVBhc3N3b3JkID0gQXJyYXkoMylcbiAgICAgICAgICAgIC5maWxsKDApXG4gICAgICAgICAgICAubWFwKCgpID0+IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpKVxuICAgICAgICAgICAgLmpvaW4oJycpXG5cbiAgICAgICAgICBsZXQgZXhpc3RpbmdVc2VyID0gYXdhaXQgcGF5bG9hZC5maW5kKHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IHVzZXJDb2xsZWN0aW9uU2x1ZyxcbiAgICAgICAgICAgIHdoZXJlOiB7IGNsZXJrSWQ6IHsgZXF1YWxzOiBjbGVya1VzZXIuaWQgfSB9XG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGlmICghZXhpc3RpbmdVc2VyLmRvY3MubGVuZ3RoICYmIGNsZXJrVXNlci5lbWFpbEFkZHJlc3NlcyAmJiBjbGVya1VzZXIuZW1haWxBZGRyZXNzZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgcHJpbWFyeUVtYWlsID0gZ2V0UHJpbWFyeUVtYWlsKGNsZXJrVXNlcilcblxuICAgICAgICAgICAgaWYgKHByaW1hcnlFbWFpbCkge1xuICAgICAgICAgICAgICBleGlzdGluZ1VzZXIgPSBhd2FpdCBwYXlsb2FkLmZpbmQoe1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHVzZXJDb2xsZWN0aW9uU2x1ZyxcbiAgICAgICAgICAgICAgICB3aGVyZTogeyBlbWFpbDogeyBlcXVhbHM6IHByaW1hcnlFbWFpbCB9IH1cbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZXhpc3RpbmdVc2VyLmRvY3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYXdhaXQgcGF5bG9hZC51cGRhdGUoe1xuICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB1c2VyQ29sbGVjdGlvblNsdWcsXG4gICAgICAgICAgICAgIGlkOiBleGlzdGluZ1VzZXIuZG9jc1swXS5pZCxcbiAgICAgICAgICAgICAgZGF0YTogcGF5bG9hZFVzZXJEYXRhXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgdXBkYXRlZCsrXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IHBheWxvYWQuY3JlYXRlKHtcbiAgICAgICAgICAgICAgY29sbGVjdGlvbjogdXNlckNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgLi4ucGF5bG9hZFVzZXJEYXRhLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiByYW5kb21QYXNzd29yZFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgY3JlYXRlZCsrXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coYFN5bmNlZCAke2FsbFVzZXJzLmxlbmd0aH0gdXNlcnMgZnJvbSBDbGVyay4gQ3JlYXRlZDogJHtjcmVhdGVkfSwgVXBkYXRlZDogJHt1cGRhdGVkfWApXG5cbiAgICAgICAgY29uc3QgcmVzcG9uc2U6IFN5bmNDbGVya1VzZXJzUmVzcG9uc2UgPSB7XG4gICAgICAgICAgc3luY2VkVXNlcnM6IGFsbFVzZXJzLmxlbmd0aCxcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIG1lc3NhZ2U6IGBTdWNjZXNzZnVsbHkgc3luY2VkICR7YWxsVXNlcnMubGVuZ3RofSB1c2VycyBmcm9tIENsZXJrLiBDcmVhdGVkOiAke2NyZWF0ZWR9LCBVcGRhdGVkOiAke3VwZGF0ZWR9YCxcbiAgICAgICAgICBjb3VudDogYWxsVXNlcnMubGVuZ3RoLFxuICAgICAgICAgIGNyZWF0ZWQsXG4gICAgICAgICAgdXBkYXRlZFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeShyZXNwb25zZSksIHtcbiAgICAgICAgICBzdGF0dXM6IDIwMCxcbiAgICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfVxuICAgICAgICB9KVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc3luY2luZyB1c2VycyBmcm9tIENsZXJrOicsIGVycm9yKVxuXG4gICAgICAgIGNvbnN0IGVycm9yUmVzcG9uc2U6IFN5bmNDbGVya1VzZXJzUmVzcG9uc2UgPSB7XG4gICAgICAgICAgc3luY2VkVXNlcnM6IDAsXG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ0ZhaWxlZCB0byBzeW5jIHVzZXJzIGZyb20gQ2xlcmsnXG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgQVBJRXJyb3IoZXJyb3JSZXNwb25zZS5lcnJvciB8fCAnVW5rbm93biBlcnJvcicsIDUwMClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJBUElFcnJvciIsImNyZWF0ZUNsZXJrQ2xpZW50IiwiZ2V0UHJpbWFyeUVtYWlsIiwic3luY0NsZXJrVXNlcnNFbmRwb2ludCIsInVzZXJDb2xsZWN0aW9uU2x1ZyIsInBhdGgiLCJtZXRob2QiLCJoYW5kbGVyIiwicmVxIiwicGF5bG9hZCIsIm1hcHBpbmdGdW5jdGlvbiIsImNvbmZpZyIsImN1c3RvbSIsImNsZXJrUGx1Z2luIiwiY2xlcmtUb1BheWxvYWRNYXBwaW5nIiwicHJvY2VzcyIsImVudiIsIkNMRVJLX1NFQ1JFVF9LRVkiLCJjbGVya0NsaWVudCIsInNlY3JldEtleSIsInRvdGFsVXNlcnMiLCJ1c2VycyIsImdldENvdW50IiwibGltaXQiLCJ0b3RhbFBhZ2VzIiwiTWF0aCIsImNlaWwiLCJhbGxVc2VycyIsInBhZ2UiLCJvZmZzZXQiLCJwYWdlVXNlcnMiLCJmZXRjaCIsImhlYWRlcnMiLCJBdXRob3JpemF0aW9uIiwicGFnZVVzZXJzRGF0YSIsImpzb24iLCJjb25zb2xlIiwibG9nIiwibGVuZ3RoIiwiY3JlYXRlZCIsInVwZGF0ZWQiLCJjbGVya1VzZXIiLCJwYXlsb2FkVXNlckRhdGEiLCJyYW5kb21QYXNzd29yZCIsIkFycmF5IiwiZmlsbCIsIm1hcCIsInJhbmRvbSIsInRvU3RyaW5nIiwic2xpY2UiLCJqb2luIiwiZXhpc3RpbmdVc2VyIiwiZmluZCIsImNvbGxlY3Rpb24iLCJ3aGVyZSIsImNsZXJrSWQiLCJlcXVhbHMiLCJpZCIsImRvY3MiLCJlbWFpbEFkZHJlc3NlcyIsInByaW1hcnlFbWFpbCIsImVtYWlsIiwidXBkYXRlIiwiZGF0YSIsImNyZWF0ZSIsInBhc3N3b3JkIiwicmVzcG9uc2UiLCJzeW5jZWRVc2VycyIsInN1Y2Nlc3MiLCJtZXNzYWdlIiwiY291bnQiLCJSZXNwb25zZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJzdGF0dXMiLCJlcnJvciIsImVycm9yUmVzcG9uc2UiLCJFcnJvciJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsUUFBUSxRQUFrQixVQUFTO0FBQzVDLFNBQVNDLGlCQUFpQixRQUFRLGlCQUFnQjtBQUVsRCxTQUFTQyxlQUFlLFFBQVEsb0JBQW1CO0FBWW5ELE9BQU8sTUFBTUMseUJBQXlCLENBQUMsRUFBRUMsa0JBQWtCLEVBQWtDO0lBQzNGLE9BQU87UUFDTEMsTUFBTTtRQUNOQyxRQUFRO1FBQ1JDLFNBQVMsT0FBT0M7WUFDZCxJQUFJO2dCQUNGLE1BQU0sRUFBRUMsT0FBTyxFQUFFLEdBQUdEO2dCQUNwQixNQUFNRSxrQkFBa0JE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