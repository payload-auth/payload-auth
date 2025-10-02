import { z } from "zod";
import { status as httpStatus } from "http-status";
import { getPayloadAuth } from "../../../get-payload-auth";
import { adminEndpoints, baseSlugs } from "../../../../constants";
const setAdminRoleSchema = z.object({
    token: z.string().optional(),
    redirect: z.string().optional()
});
export const getSetAdminRoleEndpoint = (pluginOptions, userSlug)=>{
    const endpoint = {
        path: adminEndpoints.setAdminRole,
        method: 'get',
        handler: async (req)=>{
            const { config } = req.payload;
            const schema = setAdminRoleSchema.safeParse(req.query);
            if (!schema.success) {
                return Response.json({
                    message: schema.error.message
                }, {
                    status: httpStatus.BAD_REQUEST
                });
            }
            const payloadAuth = await getPayloadAuth(config);
            const session = await payloadAuth.betterAuth.api.getSession({
                headers: req.headers
            });
            if (!session) {
                return Response.json({
                    message: 'No session found'
                }, {
                    status: httpStatus.UNAUTHORIZED
                });
            }
            const { token, redirect } = schema.data;
            const invite = await req.payload.find({
                collection: pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations,
                where: {
                    token: {
                        equals: token
                    }
                },
                limit: 1
            });
            if (invite.docs.length === 0) {
                return Response.json({
                    message: 'Invalid token'
                }, {
                    status: httpStatus.UNAUTHORIZED
                });
            }
            const role = invite.docs[0].role;
            const updatedUser = await req.payload.update({
                collection: userSlug,
                id: session.user.id,
                data: {
                    role: role
                },
                overrideAccess: true
            });
            await req.payload.delete({
                collection: pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations,
                where: {
                    token: {
                        equals: token
                    }
                }
            });
            const response = new Response(null, {
                status: 307,
                headers: {
                    Location: redirect ?? config.routes.admin
                }
            });
            return response;
        }
    };
    return endpoint;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3VzZXJzL2VuZHBvaW50cy9zZXQtYWRtaW4tcm9sZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJ1xuaW1wb3J0IHsgdHlwZSBFbmRwb2ludCB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBzdGF0dXMgYXMgaHR0cFN0YXR1cyB9IGZyb20gJ2h0dHAtc3RhdHVzJ1xuaW1wb3J0IHsgQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi90eXBlcydcbmltcG9ydCB7IGdldFBheWxvYWRBdXRoIH0gZnJvbSAnLi4vLi4vLi4vZ2V0LXBheWxvYWQtYXV0aCdcbmltcG9ydCB7IGFkbWluRW5kcG9pbnRzLCBiYXNlU2x1Z3MgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9jb25zdGFudHMnXG5cbmNvbnN0IHNldEFkbWluUm9sZVNjaGVtYSA9IHoub2JqZWN0KHtcbiAgdG9rZW46IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgcmVkaXJlY3Q6IHouc3RyaW5nKCkub3B0aW9uYWwoKVxufSlcblxuZXhwb3J0IGNvbnN0IGdldFNldEFkbWluUm9sZUVuZHBvaW50ID0gKHBsdWdpbk9wdGlvbnM6IEJldHRlckF1dGhQbHVnaW5PcHRpb25zLCB1c2VyU2x1Zzogc3RyaW5nKTogRW5kcG9pbnQgPT4ge1xuICBjb25zdCBlbmRwb2ludDogRW5kcG9pbnQgPSB7XG4gICAgcGF0aDogYWRtaW5FbmRwb2ludHMuc2V0QWRtaW5Sb2xlLFxuICAgIG1ldGhvZDogJ2dldCcsXG4gICAgaGFuZGxlcjogYXN5bmMgKHJlcSkgPT4ge1xuICAgICAgY29uc3QgeyBjb25maWcgfSA9IHJlcS5wYXlsb2FkXG4gICAgICBjb25zdCBzY2hlbWEgPSBzZXRBZG1pblJvbGVTY2hlbWEuc2FmZVBhcnNlKHJlcS5xdWVyeSlcbiAgICAgIGlmICghc2NoZW1hLnN1Y2Nlc3MpIHtcbiAgICAgICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBtZXNzYWdlOiBzY2hlbWEuZXJyb3IubWVzc2FnZSB9LCB7IHN0YXR1czogaHR0cFN0YXR1cy5CQURfUkVRVUVTVCB9KVxuICAgICAgfVxuICAgICAgY29uc3QgcGF5bG9hZEF1dGggPSBhd2FpdCBnZXRQYXlsb2FkQXV0aChjb25maWcpXG4gICAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgcGF5bG9hZEF1dGguYmV0dGVyQXV0aC5hcGkuZ2V0U2Vzc2lvbih7XG4gICAgICAgIGhlYWRlcnM6IHJlcS5oZWFkZXJzXG4gICAgICB9KVxuICAgICAgaWYgKCFzZXNzaW9uKSB7XG4gICAgICAgIHJldHVybiBSZXNwb25zZS5qc29uKHsgbWVzc2FnZTogJ05vIHNlc3Npb24gZm91bmQnIH0sIHsgc3RhdHVzOiBodHRwU3RhdHVzLlVOQVVUSE9SSVpFRCB9KVxuICAgICAgfVxuICAgICAgY29uc3QgeyB0b2tlbiwgcmVkaXJlY3QgfSA9IHNjaGVtYS5kYXRhXG4gICAgICBjb25zdCBpbnZpdGUgPSBhd2FpdCByZXEucGF5bG9hZC5maW5kKHtcbiAgICAgICAgY29sbGVjdGlvbjogcGx1Z2luT3B0aW9ucy5hZG1pbkludml0YXRpb25zPy5zbHVnID8/IGJhc2VTbHVncy5hZG1pbkludml0YXRpb25zLFxuICAgICAgICB3aGVyZToge1xuICAgICAgICAgIHRva2VuOiB7IGVxdWFsczogdG9rZW4gfVxuICAgICAgICB9LFxuICAgICAgICBsaW1pdDogMVxuICAgICAgfSlcbiAgICAgIGlmIChpbnZpdGUuZG9jcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBtZXNzYWdlOiAnSW52YWxpZCB0b2tlbicgfSwgeyBzdGF0dXM6IGh0dHBTdGF0dXMuVU5BVVRIT1JJWkVEIH0pXG4gICAgICB9XG4gICAgICBjb25zdCByb2xlID0gaW52aXRlLmRvY3NbMF0ucm9sZSBhcyBzdHJpbmdcbiAgICAgIGNvbnN0IHVwZGF0ZWRVc2VyID0gYXdhaXQgcmVxLnBheWxvYWQudXBkYXRlKHtcbiAgICAgICAgY29sbGVjdGlvbjogdXNlclNsdWcsXG4gICAgICAgIGlkOiBzZXNzaW9uLnVzZXIuaWQsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICByb2xlOiByb2xlXG4gICAgICAgIH0sXG4gICAgICAgIG92ZXJyaWRlQWNjZXNzOiB0cnVlXG4gICAgICB9KVxuICAgICAgYXdhaXQgcmVxLnBheWxvYWQuZGVsZXRlKHtcbiAgICAgICAgY29sbGVjdGlvbjogcGx1Z2luT3B0aW9ucy5hZG1pbkludml0YXRpb25zPy5zbHVnID8/IGJhc2VTbHVncy5hZG1pbkludml0YXRpb25zLFxuICAgICAgICB3aGVyZToge1xuICAgICAgICAgIHRva2VuOiB7XG4gICAgICAgICAgICBlcXVhbHM6IHRva2VuXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwge1xuICAgICAgICBzdGF0dXM6IDMwNyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIExvY2F0aW9uOiByZWRpcmVjdCA/PyBjb25maWcucm91dGVzLmFkbWluXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICByZXR1cm4gcmVzcG9uc2VcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZW5kcG9pbnRcbn1cbiJdLCJuYW1lcyI6WyJ6Iiwic3RhdHVzIiwiaHR0cFN0YXR1cyIsImdldFBheWxvYWRBdXRoIiwiYWRtaW5FbmRwb2ludHMiLCJiYXNlU2x1Z3MiLCJzZXRBZG1pblJvbGVTY2hlbWEiLCJvYmplY3QiLCJ0b2tlbiIsInN0cmluZyIsIm9wdGlvbmFsIiwicmVkaXJlY3QiLCJnZXRTZXRBZG1pblJvbGVFbmRwb2ludCIsInBsdWdpbk9wdGlvbnMiLCJ1c2VyU2x1ZyIsImVuZHBvaW50IiwicGF0aCIsInNldEFkbWluUm9sZSIsIm1ldGhvZCIsImhhbmRsZXIiLCJyZXEiLCJjb25maWciLCJwYXlsb2FkIiwic2NoZW1hIiwic2FmZVBhcnNlIiwicXVlcnkiLCJzdWNjZXNzIiwiUmVzcG9uc2UiLCJqc29uIiwibWVzc2FnZSIsImVycm9yIiwiQkFEX1JFUVVFU1QiLCJwYXlsb2FkQXV0aCIsInNlc3Npb24iLCJiZXR0ZXJBdXRoIiwiYXBpIiwiZ2V0U2Vzc2lvbiIsImhlYWRlcnMiLCJVTkFVVEhPUklaRUQiLCJkYXRhIiwiaW52aXRlIiwiZmluZCIsImNvbGxlY3Rpb24iLCJhZG1pbkludml0YXRpb25zIiwic2x1ZyIsIndoZXJlIiwiZXF1YWxzIiwibGltaXQiLCJkb2NzIiwibGVuZ3RoIiwicm9sZSIsInVwZGF0ZWRVc2VyIiwidXBkYXRlIiwiaWQiLCJ1c2VyIiwib3ZlcnJpZGVBY2Nlc3MiLCJkZWxldGUiLCJyZXNwb25zZSIsIkxvY2F0aW9uIiwicm91dGVzIiwiYWRtaW4iXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLENBQUMsUUFBUSxNQUFLO0FBRXZCLFNBQVNDLFVBQVVDLFVBQVUsUUFBUSxjQUFhO0FBRWxELFNBQVNDLGNBQWMsUUFBUSw0QkFBMkI7QUFDMUQsU0FBU0MsY0FBYyxFQUFFQyxTQUFTLFFBQVEsd0JBQWdDO0FBRTFFLE1BQU1DLHFCQUFxQk4sRUFBRU8sTUFBTSxDQUFDO0lBQ2xDQyxPQUFPUixFQUFFUyxNQUFNLEdBQUdDLFFBQVE7SUFDMUJDLFVBQVVYLEVBQUVTLE1BQU0sR0FBR0MsUUFBUTtBQUMvQjtBQUVBLE9BQU8sTUFBTUUsMEJBQTBCLENBQUNDLGVBQXdDQztJQUM5RSxNQUFNQyxXQUFxQjtRQUN6QkMsTUFBTVosZUFBZWEsWUFBWTtRQUNqQ0MsUUFBUTtRQUNSQyxTQUFTLE9BQU9DO1lBQ2QsTUFBTSxFQUFFQyxNQUFNLEVBQUUsR0FBR0QsSUFBSUUsT0FBTztZQUM5QixNQUFNQyxTQUFTakIsbUJBQW1Ca0IsU0FBUyxDQUFDSixJQUFJSyxLQUFLO1lBQ3JELElBQUksQ0FBQ0YsT0FBT0csT0FBTyxFQUFFO2dCQUNuQixPQUFPQyxTQUFTQyxJQUFJLENBQUM7b0JBQUVDLFNBQVNOLE9BQU9PLEtBQUssQ0FBQ0QsT0FBTztnQkFBQyxHQUFHO29CQUFFNUIsUUFBUUMsV0FBVzZCLFdBQVc7Z0JBQUM7WUFDM0Y7WUFDQSxNQUFNQyxjQUFjLE1BQU03QixlQUFla0I7WUFDekMsTUFBTVksVUFBVSxNQUFNRCxZQUFZRSxVQUFVLENBQUNDLEdBQUcsQ0FBQ0MsVUFBVSxDQUFDO2dCQUMxREMsU0FBU2pCLElBQUlpQixPQUFPO1lBQ3RCO1lBQ0EsSUFBSSxDQUFDSixTQUFTO2dCQUNaLE9BQU9OLFNBQVNDLElBQUksQ0FBQztvQkFBRUMsU0FBUztnQkFBbUIsR0FBRztvQkFBRTVCLFFBQVFDLFdBQVdvQyxZQUFZO2dCQUFDO1lBQzFGO1lBQ0EsTUFBTSxFQUFFOUIsS0FBSyxFQUFFRyxRQUFRLEVBQUUsR0FBR1ksT0FBT2dCLElBQUk7WUFDdkMsTUFBTUMsU0FBUyxNQUFNcEIsSUFBSUUsT0FBTyxDQUFDbUIsSUFBSSxDQUFDO2dCQUNwQ0MsWUFBWTdCLGNBQWM4QixnQkFBZ0IsRUFBRUMsUUFBUXZDLFVBQVVzQyxnQkFBZ0I7Z0JBQzlFRSxPQUFPO29CQUNMckMsT0FBTzt3QkFBRXNDLFFBQVF0QztvQkFBTTtnQkFDekI7Z0JBQ0F1QyxPQUFPO1lBQ1Q7WUFDQSxJQUFJUCxPQUFPUSxJQUFJLENBQUNDLE1BQU0sS0FBSyxHQUFHO2dCQUM1QixPQUFPdEIsU0FBU0MsSUFBSSxDQUFDO29CQUFFQyxTQUFTO2dCQUFnQixHQUFHO29CQUFFNUIsUUFBUUMsV0FBV29DLFlBQVk7Z0JBQUM7WUFDdkY7WUFDQSxNQUFNWSxPQUFPVixPQUFPUSxJQUFJLENBQUMsRUFBRSxDQUFDRSxJQUFJO1lBQ2hDLE1BQU1DLGNBQWMsTUFBTS9CLElBQUlFLE9BQU8sQ0FBQzhCLE1BQU0sQ0FBQztnQkFDM0NWLFlBQVk1QjtnQkFDWnVDLElBQUlwQixRQUFRcUIsSUFBSSxDQUFDRCxFQUFFO2dCQUNuQmQsTUFBTTtvQkFDSlcsTUFBTUE7Z0JBQ1I7Z0JBQ0FLLGdCQUFnQjtZQUNsQjtZQUNBLE1BQU1uQyxJQUFJRSxPQUFPLENBQUNrQyxNQUFNLENBQUM7Z0JBQ3ZCZCxZQUFZN0IsY0FBYzhCLGdCQUFnQixFQUFFQyxRQUFRdkMsVUFBVXNDLGdCQUFnQjtnQkFDOUVFLE9BQU87b0JBQ0xyQyxPQUFPO3dCQUNMc0MsUUFBUXRDO29CQUNWO2dCQUNGO1lBQ0Y7WUFDQSxNQUFNaUQsV0FBVyxJQUFJOUIsU0FBUyxNQUFNO2dCQUNsQzFCLFFBQVE7Z0JBQ1JvQyxTQUFTO29CQUNQcUIsVUFBVS9DLFlBQVlVLE9BQU9zQyxNQUFNLENBQUNDLEtBQUs7Z0JBQzNDO1lBQ0Y7WUFDQSxPQUFPSDtRQUNUO0lBQ0Y7SUFFQSxPQUFPMUM7QUFDVCxFQUFDIn0=