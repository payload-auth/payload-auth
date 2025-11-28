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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3VzZXJzL2JldHRlci1hdXRoLXN0cmF0ZWd5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQXV0aFN0cmF0ZWd5IH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB7IGdldFBheWxvYWRBdXRoIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2dldC1wYXlsb2FkLWF1dGgnXG5pbXBvcnQgeyBiYXNlU2x1Z3MgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9jb25zdGFudHMnXG5cbi8qKlxuICogQXV0aCBzdHJhdGVneSBmb3IgQmV0dGVyQXV0aFxuICogQHBhcmFtIHVzZXJTbHVnIC0gVXNlciBjb2xsZWN0aW9uIHNsdWdcbiAqIEByZXR1cm5zIEF1dGggc3RyYXRlZ3lcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJldHRlckF1dGhTdHJhdGVneSh1c2VyU2x1Zz86IHN0cmluZyk6IEF1dGhTdHJhdGVneSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2JldHRlci1hdXRoJyxcbiAgICBhdXRoZW50aWNhdGU6IGFzeW5jICh7IHBheWxvYWQsIGhlYWRlcnMgfSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGF5bG9hZEF1dGggPSBhd2FpdCBnZXRQYXlsb2FkQXV0aChwYXlsb2FkLmNvbmZpZylcblxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBwYXlsb2FkQXV0aC5iZXR0ZXJBdXRoLmFwaS5nZXRTZXNzaW9uKHtcbiAgICAgICAgICBoZWFkZXJzXG4gICAgICAgIH0pXG4gICAgICAgIFxuICAgICAgICBpZiAoIXJlcykge1xuICAgICAgICAgIHJldHVybiB7IHVzZXI6IG51bGwgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IHJlcy5zZXNzaW9uLnVzZXJJZCA/PyByZXMudXNlci5pZFxuICAgICAgICBpZiAoIXVzZXJJZCkge1xuICAgICAgICAgIHJldHVybiB7IHVzZXI6IG51bGwgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwYXlsb2FkQXV0aC5maW5kQnlJRCh7XG4gICAgICAgICAgY29sbGVjdGlvbjogdXNlclNsdWcgPz8gYmFzZVNsdWdzLnVzZXJzLFxuICAgICAgICAgIGlkOiB1c2VySWRcbiAgICAgICAgfSlcbiAgICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgICAgcmV0dXJuIHsgdXNlcjogbnVsbCB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgICAuLi51c2VyLFxuICAgICAgICAgICAgY29sbGVjdGlvbjogdXNlclNsdWcgPz8gYmFzZVNsdWdzLnVzZXJzLFxuICAgICAgICAgICAgX3N0cmF0ZWd5OiAnYmV0dGVyLWF1dGgnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyB1c2VyOiBudWxsIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJnZXRQYXlsb2FkQXV0aCIsImJhc2VTbHVncyIsImJldHRlckF1dGhTdHJhdGVneSIsInVzZXJTbHVnIiwibmFtZSIsImF1dGhlbnRpY2F0ZSIsInBheWxvYWQiLCJoZWFkZXJzIiwicGF5bG9hZEF1dGgiLCJjb25maWciLCJyZXMiLCJiZXR0ZXJBdXRoIiwiYXBpIiwiZ2V0U2Vzc2lvbiIsInVzZXIiLCJ1c2VySWQiLCJzZXNzaW9uIiwiaWQiLCJmaW5kQnlJRCIsImNvbGxlY3Rpb24iLCJ1c2VycyIsIl9zdHJhdGVneSIsImVycm9yIl0sIm1hcHBpbmdzIjoiQUFDQSxTQUFTQSxjQUFjLFFBQVEseUJBQTJDO0FBQzFFLFNBQVNDLFNBQVMsUUFBUSxxQkFBZ0M7QUFFMUQ7Ozs7Q0FJQyxHQUNELE9BQU8sU0FBU0MsbUJBQW1CQyxRQUFpQjtJQUNsRCxPQUFPO1FBQ0xDLE1BQU07UUFDTkMsY0FBYyxPQUFPLEVBQUVDLE9BQU8sRUFBRUMsT0FBTyxFQUFFO1lBQ3ZDLElBQUk7Z0JBQ0YsTUFBTUMsY0FBYyxNQUFNUixlQUFlTSxRQUFRRyxNQUFNO2dCQUV2RCxNQUFNQyxNQUFNLE1BQU1GLFlBQVlHLFVBQVUsQ0FBQ0MsR0FBRyxDQUFDQyxVQUFVLENBQUM7b0JBQ3RETjtnQkFDRjtnQkFFQSxJQUFJLENBQUNHLEtBQUs7b0JBQ1IsT0FBTzt3QkFBRUksTUFBTTtvQkFBSztnQkFDdEI7Z0JBQ0EsTUFBTUMsU0FBU0wsSUFBSU0sT0FBTyxDQUFDRCxNQUFNLElBQUlMLElBQUlJLElBQUksQ0FBQ0csRUFBRTtnQkFDaEQsSUFBSSxDQUFDRixRQUFRO29CQUNYLE9BQU87d0JBQUVELE1BQU07b0JBQUs7Z0JBQ3RCO2dCQUNBLE1BQU1BLE9BQU8sTUFBTU4sWUFBWVUsUUFBUSxDQUFDO29CQUN0Q0MsWUFBWWhCLFlBQVlGLFVBQVVtQixLQUFLO29CQUN2Q0gsSUFBSUY7Z0JBQ047Z0JBQ0EsSUFBSSxDQUFDRCxNQUFNO29CQUNULE9BQU87d0JBQUVBLE1BQU07b0JBQUs7Z0JBQ3RCO2dCQUNBLE9BQU87b0JBQ0xBLE1BQU07d0JBQ0osR0FBR0EsSUFBSTt3QkFDUEssWUFBWWhCLFlBQVlGLFVBQVVtQixLQUFLO3dCQUN2Q0MsV0FBVztvQkFDYjtnQkFDRjtZQUNGLEVBQUUsT0FBT0MsT0FBTztnQkFDZCxPQUFPO29CQUFFUixNQUFNO2dCQUFLO1lBQ3RCO1FBQ0Y7SUFDRjtBQUNGIn0=