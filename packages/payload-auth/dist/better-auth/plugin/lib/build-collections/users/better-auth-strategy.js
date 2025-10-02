import { getPayloadAuth } from "../../get-payload-auth";
import { baseSlugs } from "../../../constants";
/**
 * Auth strategy for BetterAuth
 * @param userSlug - User collection slug
 * @returns Auth strategy
 */ export function betterAuthStrategy(userSlug) {
    return {
        name: 'better-auth',
        authenticate: async ({ payload, headers })=>{
            try {
                const payloadAuth = await getPayloadAuth(payload.config);
                const res = await payloadAuth.betterAuth.api.getSession({
                    headers
                });
                if (!res) {
                    return {
                        user: null
                    };
                }
                const userId = res.session.userId ?? res.user.id;
                if (!userId) {
                    return {
                        user: null
                    };
                }
                const user = await payloadAuth.findByID({
                    collection: userSlug ?? baseSlugs.users,
                    id: userId
                });
                if (!user) {
                    return {
                        user: null
                    };
                }
                return {
                    user: {
                        ...user,
                        collection: userSlug ?? baseSlugs.users,
                        _strategy: 'better-auth'
                    }
                };
            } catch (error) {
                return {
                    user: null
                };
            }
        }
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3VzZXJzL2JldHRlci1hdXRoLXN0cmF0ZWd5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQXV0aFN0cmF0ZWd5IH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB7IGdldFBheWxvYWRBdXRoIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2dldC1wYXlsb2FkLWF1dGgnXG5pbXBvcnQgeyBiYXNlU2x1Z3MgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9jb25zdGFudHMnXG5cbi8qKlxuICogQXV0aCBzdHJhdGVneSBmb3IgQmV0dGVyQXV0aFxuICogQHBhcmFtIHVzZXJTbHVnIC0gVXNlciBjb2xsZWN0aW9uIHNsdWdcbiAqIEByZXR1cm5zIEF1dGggc3RyYXRlZ3lcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJldHRlckF1dGhTdHJhdGVneSh1c2VyU2x1Zz86IHN0cmluZyk6IEF1dGhTdHJhdGVneSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2JldHRlci1hdXRoJyxcbiAgICBhdXRoZW50aWNhdGU6IGFzeW5jICh7IHBheWxvYWQsIGhlYWRlcnMgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGF5bG9hZEF1dGggPSBhd2FpdCBnZXRQYXlsb2FkQXV0aChwYXlsb2FkLmNvbmZpZylcblxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBwYXlsb2FkQXV0aC5iZXR0ZXJBdXRoLmFwaS5nZXRTZXNzaW9uKHtcbiAgICAgICAgICBoZWFkZXJzXG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYgKCFyZXMpIHtcbiAgICAgICAgICByZXR1cm4geyB1c2VyOiBudWxsIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1c2VySWQgPSByZXMuc2Vzc2lvbi51c2VySWQgPz8gcmVzLnVzZXIuaWRcbiAgICAgICAgaWYgKCF1c2VySWQpIHtcbiAgICAgICAgICByZXR1cm4geyB1c2VyOiBudWxsIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgcGF5bG9hZEF1dGguZmluZEJ5SUQoe1xuICAgICAgICAgIGNvbGxlY3Rpb246IHVzZXJTbHVnID8/IGJhc2VTbHVncy51c2VycyxcbiAgICAgICAgICBpZDogdXNlcklkXG4gICAgICAgIH0pXG4gICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgIHJldHVybiB7IHVzZXI6IG51bGwgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdXNlcjoge1xuICAgICAgICAgICAgLi4udXNlcixcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IHVzZXJTbHVnID8/IGJhc2VTbHVncy51c2VycyxcbiAgICAgICAgICAgIF9zdHJhdGVneTogJ2JldHRlci1hdXRoJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgdXNlcjogbnVsbCB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOlsiZ2V0UGF5bG9hZEF1dGgiLCJiYXNlU2x1Z3MiLCJiZXR0ZXJBdXRoU3RyYXRlZ3kiLCJ1c2VyU2x1ZyIsIm5hbWUiLCJhdXRoZW50aWNhdGUiLCJwYXlsb2FkIiwiaGVhZGVycyIsInBheWxvYWRBdXRoIiwiY29uZmlnIiwicmVzIiwiYmV0dGVyQXV0aCIsImFwaSIsImdldFNlc3Npb24iLCJ1c2VyIiwidXNlcklkIiwic2Vzc2lvbiIsImlkIiwiZmluZEJ5SUQiLCJjb2xsZWN0aW9uIiwidXNlcnMiLCJfc3RyYXRlZ3kiLCJlcnJvciJdLCJtYXBwaW5ncyI6IkFBQ0EsU0FBU0EsY0FBYyxRQUFRLHlCQUEyQztBQUMxRSxTQUFTQyxTQUFTLFFBQVEscUJBQWdDO0FBRTFEOzs7O0NBSUMsR0FDRCxPQUFPLFNBQVNDLG1CQUFtQkMsUUFBaUI7SUFDbEQsT0FBTztRQUNMQyxNQUFNO1FBQ05DLGNBQWMsT0FBTyxFQUFFQyxPQUFPLEVBQUVDLE9BQU8sRUFBRTtZQUN2QyxJQUFJO2dCQUNGLE1BQU1DLGNBQWMsTUFBTVIsZUFBZU0sUUFBUUcsTUFBTTtnQkFFdkQsTUFBTUMsTUFBTSxNQUFNRixZQUFZRyxVQUFVLENBQUNDLEdBQUcsQ0FBQ0MsVUFBVSxDQUFDO29CQUN0RE47Z0JBQ0Y7Z0JBRUEsSUFBSSxDQUFDRyxLQUFLO29CQUNSLE9BQU87d0JBQUVJLE1BQU07b0JBQUs7Z0JBQ3RCO2dCQUNBLE1BQU1DLFNBQVNMLElBQUlNLE9BQU8sQ0FBQ0QsTUFBTSxJQUFJTCxJQUFJSSxJQUFJLENBQUNHLEVBQUU7Z0JBQ2hELElBQUksQ0FBQ0YsUUFBUTtvQkFDWCxPQUFPO3dCQUFFRCxNQUFNO29CQUFLO2dCQUN0QjtnQkFDQSxNQUFNQSxPQUFPLE1BQU1OLFlBQVlVLFFBQVEsQ0FBQztvQkFDdENDLFlBQVloQixZQUFZRixVQUFVbUIsS0FBSztvQkFDdkNILElBQUlGO2dCQUNOO2dCQUNBLElBQUksQ0FBQ0QsTUFBTTtvQkFDVCxPQUFPO3dCQUFFQSxNQUFNO29CQUFLO2dCQUN0QjtnQkFDQSxPQUFPO29CQUNMQSxNQUFNO3dCQUNKLEdBQUdBLElBQUk7d0JBQ1BLLFlBQVloQixZQUFZRixVQUFVbUIsS0FBSzt3QkFDdkNDLFdBQVc7b0JBQ2I7Z0JBQ0Y7WUFDRixFQUFFLE9BQU9DLE9BQU87Z0JBQ2QsT0FBTztvQkFBRVIsTUFBTTtnQkFBSztZQUN0QjtRQUNGO0lBQ0Y7QUFDRiJ9