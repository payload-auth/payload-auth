import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "../utils/user";
const CLERK_AUTH_STRATEGY_NAME = 'clerk';
/**
 * Authentication strategy for Clerk
 * Integrates Payload with Clerk using the official Clerk auth method
 *
 * @param adminRoles - Admin roles
 * @param userSlug - User collection slug
 * @returns Auth strategy
 */ export function clerkAuthStrategy(userSlug = 'users') {
    return {
        name: CLERK_AUTH_STRATEGY_NAME,
        authenticate: async ({ payload, strategyName = CLERK_AUTH_STRATEGY_NAME })=>{
            try {
                const { userId } = await auth();
                if (!userId) {
                    return {
                        user: null
                    };
                }
                const user = await getUserByClerkId(payload, userSlug, userId);
                if (!user) {
                    return {
                        user: null
                    };
                }
                return {
                    user: {
                        ...user,
                        collection: userSlug,
                        _strategy: strategyName
                    }
                };
            } catch (error) {
                console.error('Error in Clerk auth strategy:', error);
                return {
                    user: null
                };
            }
        }
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGVyay9wbHVnaW4vYXV0aC1zdHJhdGVneS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEF1dGhTdHJhdGVneSB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBhdXRoIH0gZnJvbSAnQGNsZXJrL25leHRqcy9zZXJ2ZXInXG5pbXBvcnQgeyBnZXRVc2VyQnlDbGVya0lkIH0gZnJvbSAnLi4vdXRpbHMvdXNlcidcblxuY29uc3QgQ0xFUktfQVVUSF9TVFJBVEVHWV9OQU1FID0gJ2NsZXJrJ1xuXG4vKipcbiAqIEF1dGhlbnRpY2F0aW9uIHN0cmF0ZWd5IGZvciBDbGVya1xuICogSW50ZWdyYXRlcyBQYXlsb2FkIHdpdGggQ2xlcmsgdXNpbmcgdGhlIG9mZmljaWFsIENsZXJrIGF1dGggbWV0aG9kXG4gKlxuICogQHBhcmFtIGFkbWluUm9sZXMgLSBBZG1pbiByb2xlc1xuICogQHBhcmFtIHVzZXJTbHVnIC0gVXNlciBjb2xsZWN0aW9uIHNsdWdcbiAqIEByZXR1cm5zIEF1dGggc3RyYXRlZ3lcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZXJrQXV0aFN0cmF0ZWd5KHVzZXJTbHVnOiBzdHJpbmcgPSAndXNlcnMnKTogQXV0aFN0cmF0ZWd5IHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBDTEVSS19BVVRIX1NUUkFURUdZX05BTUUsXG4gICAgYXV0aGVudGljYXRlOiBhc3luYyAoeyBwYXlsb2FkLCBzdHJhdGVneU5hbWUgPSBDTEVSS19BVVRIX1NUUkFURUdZX05BTUUgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyB1c2VySWQgfSA9IGF3YWl0IGF1dGgoKVxuXG4gICAgICAgIGlmICghdXNlcklkKSB7XG4gICAgICAgICAgcmV0dXJuIHsgdXNlcjogbnVsbCB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0VXNlckJ5Q2xlcmtJZChwYXlsb2FkLCB1c2VyU2x1ZywgdXNlcklkKVxuXG4gICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgIHJldHVybiB7IHVzZXI6IG51bGwgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgICAuLi51c2VyLFxuICAgICAgICAgICAgY29sbGVjdGlvbjogdXNlclNsdWcsXG4gICAgICAgICAgICBfc3RyYXRlZ3k6IHN0cmF0ZWd5TmFtZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gQ2xlcmsgYXV0aCBzdHJhdGVneTonLCBlcnJvcilcbiAgICAgICAgcmV0dXJuIHsgdXNlcjogbnVsbCB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOlsiYXV0aCIsImdldFVzZXJCeUNsZXJrSWQiLCJDTEVSS19BVVRIX1NUUkFURUdZX05BTUUiLCJjbGVya0F1dGhTdHJhdGVneSIsInVzZXJTbHVnIiwibmFtZSIsImF1dGhlbnRpY2F0ZSIsInBheWxvYWQiLCJzdHJhdGVneU5hbWUiLCJ1c2VySWQiLCJ1c2VyIiwiY29sbGVjdGlvbiIsIl9zdHJhdGVneSIsImVycm9yIiwiY29uc29sZSJdLCJtYXBwaW5ncyI6IkFBQ0EsU0FBU0EsSUFBSSxRQUFRLHVCQUFzQjtBQUMzQyxTQUFTQyxnQkFBZ0IsUUFBUSxnQkFBZTtBQUVoRCxNQUFNQywyQkFBMkI7QUFFakM7Ozs7Ozs7Q0FPQyxHQUNELE9BQU8sU0FBU0Msa0JBQWtCQyxXQUFtQixPQUFPO0lBQzFELE9BQU87UUFDTEMsTUFBTUg7UUFDTkksY0FBYyxPQUFPLEVBQUVDLE9BQU8sRUFBRUMsZUFBZU4sd0JBQXdCLEVBQUU7WUFDdkUsSUFBSTtnQkFDRixNQUFNLEVBQUVPLE1BQU0sRUFBRSxHQUFHLE1BQU1UO2dCQUV6QixJQUFJLENBQUNTLFFBQVE7b0JBQ1gsT0FBTzt3QkFBRUMsTUFBTTtvQkFBSztnQkFDdEI7Z0JBRUEsTUFBTUEsT0FBTyxNQUFNVCxpQkFBaUJNLFNBQVNILFVBQVVLO2dCQUV2RCxJQUFJLENBQUNDLE1BQU07b0JBQ1QsT0FBTzt3QkFBRUEsTUFBTTtvQkFBSztnQkFDdEI7Z0JBRUEsT0FBTztvQkFDTEEsTUFBTTt3QkFDSixHQUFHQSxJQUFJO3dCQUNQQyxZQUFZUDt3QkFDWlEsV0FBV0o7b0JBQ2I7Z0JBQ0Y7WUFDRixFQUFFLE9BQU9LLE9BQU87Z0JBQ2RDLFFBQVFELEtBQUssQ0FBQyxpQ0FBaUNBO2dCQUMvQyxPQUFPO29CQUFFSCxNQUFNO2dCQUFLO1lBQ3RCO1FBQ0Y7SUFDRjtBQUNGIn0=