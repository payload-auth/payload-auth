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
            try {
                const updatedUser = await req.payload.update({
                    collection: userSlug,
                    id: session.user.id,
                    data: {
                        role: [
                            role
                        ]
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
            } catch (error) {
                return Response.json({
                    message: 'Error updating user role'
                }, {
                    status: httpStatus.INTERNAL_SERVER_ERROR
                });
            }
        }
    };
    return endpoint;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3VzZXJzL2VuZHBvaW50cy9zZXQtYWRtaW4tcm9sZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJ1xuaW1wb3J0IHsgdHlwZSBFbmRwb2ludCB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBzdGF0dXMgYXMgaHR0cFN0YXR1cyB9IGZyb20gJ2h0dHAtc3RhdHVzJ1xuaW1wb3J0IHsgQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi90eXBlcydcbmltcG9ydCB7IGdldFBheWxvYWRBdXRoIH0gZnJvbSAnLi4vLi4vLi4vZ2V0LXBheWxvYWQtYXV0aCdcbmltcG9ydCB7IGFkbWluRW5kcG9pbnRzLCBiYXNlU2x1Z3MgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9jb25zdGFudHMnXG5cbmNvbnN0IHNldEFkbWluUm9sZVNjaGVtYSA9IHoub2JqZWN0KHtcbiAgdG9rZW46IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgcmVkaXJlY3Q6IHouc3RyaW5nKCkub3B0aW9uYWwoKVxufSlcblxuZXhwb3J0IGNvbnN0IGdldFNldEFkbWluUm9sZUVuZHBvaW50ID0gKHBsdWdpbk9wdGlvbnM6IEJldHRlckF1dGhQbHVnaW5PcHRpb25zLCB1c2VyU2x1Zzogc3RyaW5nKTogRW5kcG9pbnQgPT4ge1xuICBjb25zdCBlbmRwb2ludDogRW5kcG9pbnQgPSB7XG4gICAgcGF0aDogYWRtaW5FbmRwb2ludHMuc2V0QWRtaW5Sb2xlLFxuICAgIG1ldGhvZDogJ2dldCcsXG4gICAgaGFuZGxlcjogYXN5bmMgKHJlcSkgPT4ge1xuICAgICAgY29uc3QgeyBjb25maWcgfSA9IHJlcS5wYXlsb2FkXG4gICAgICBjb25zdCBzY2hlbWEgPSBzZXRBZG1pblJvbGVTY2hlbWEuc2FmZVBhcnNlKHJlcS5xdWVyeSlcbiAgICAgIGlmICghc2NoZW1hLnN1Y2Nlc3MpIHtcbiAgICAgICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBtZXNzYWdlOiBzY2hlbWEuZXJyb3IubWVzc2FnZSB9LCB7IHN0YXR1czogaHR0cFN0YXR1cy5CQURfUkVRVUVTVCB9KVxuICAgICAgfVxuICAgICAgY29uc3QgcGF5bG9hZEF1dGggPSBhd2FpdCBnZXRQYXlsb2FkQXV0aChjb25maWcpXG4gICAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgcGF5bG9hZEF1dGguYmV0dGVyQXV0aC5hcGkuZ2V0U2Vzc2lvbih7XG4gICAgICAgIGhlYWRlcnM6IHJlcS5oZWFkZXJzXG4gICAgICB9KVxuICAgICAgaWYgKCFzZXNzaW9uKSB7XG4gICAgICAgIHJldHVybiBSZXNwb25zZS5qc29uKHsgbWVzc2FnZTogJ05vIHNlc3Npb24gZm91bmQnIH0sIHsgc3RhdHVzOiBodHRwU3RhdHVzLlVOQVVUSE9SSVpFRCB9KVxuICAgICAgfVxuICAgICAgY29uc3QgeyB0b2tlbiwgcmVkaXJlY3QgfSA9IHNjaGVtYS5kYXRhXG4gICAgICBjb25zdCBpbnZpdGUgPSBhd2FpdCByZXEucGF5bG9hZC5maW5kKHtcbiAgICAgICAgY29sbGVjdGlvbjogcGx1Z2luT3B0aW9ucy5hZG1pbkludml0YXRpb25zPy5zbHVnID8/IGJhc2VTbHVncy5hZG1pbkludml0YXRpb25zLFxuICAgICAgICB3aGVyZToge1xuICAgICAgICAgIHRva2VuOiB7IGVxdWFsczogdG9rZW4gfVxuICAgICAgICB9LFxuICAgICAgICBsaW1pdDogMVxuICAgICAgfSlcbiAgICAgIGlmIChpbnZpdGUuZG9jcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBtZXNzYWdlOiAnSW52YWxpZCB0b2tlbicgfSwgeyBzdGF0dXM6IGh0dHBTdGF0dXMuVU5BVVRIT1JJWkVEIH0pXG4gICAgICB9XG4gICAgICBjb25zdCByb2xlID0gaW52aXRlLmRvY3NbMF0ucm9sZSBhcyBzdHJpbmdcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHVwZGF0ZWRVc2VyID0gYXdhaXQgcmVxLnBheWxvYWQudXBkYXRlKHtcbiAgICAgICAgICBjb2xsZWN0aW9uOiB1c2VyU2x1ZyxcbiAgICAgICAgICBpZDogc2Vzc2lvbi51c2VyLmlkLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJvbGU6IFtyb2xlXVxuICAgICAgICAgIH0sXG4gICAgICAgICAgb3ZlcnJpZGVBY2Nlc3M6IHRydWVcbiAgICAgICAgfSlcbiAgICAgICAgYXdhaXQgcmVxLnBheWxvYWQuZGVsZXRlKHtcbiAgICAgICAgICBjb2xsZWN0aW9uOiBwbHVnaW5PcHRpb25zLmFkbWluSW52aXRhdGlvbnM/LnNsdWcgPz8gYmFzZVNsdWdzLmFkbWluSW52aXRhdGlvbnMsXG4gICAgICAgICAgd2hlcmU6IHtcbiAgICAgICAgICAgIHRva2VuOiB7XG4gICAgICAgICAgICAgIGVxdWFsczogdG9rZW5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtcbiAgICAgICAgICBzdGF0dXM6IDMwNyxcbiAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBMb2NhdGlvbjogcmVkaXJlY3QgPz8gY29uZmlnLnJvdXRlcy5hZG1pblxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gUmVzcG9uc2UuanNvbih7IG1lc3NhZ2U6ICdFcnJvciB1cGRhdGluZyB1c2VyIHJvbGUnIH0sIHsgc3RhdHVzOiBodHRwU3RhdHVzLklOVEVSTkFMX1NFUlZFUl9FUlJPUiB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBlbmRwb2ludFxufVxuIl0sIm5hbWVzIjpbInoiLCJzdGF0dXMiLCJodHRwU3RhdHVzIiwiZ2V0UGF5bG9hZEF1dGgiLCJhZG1pbkVuZHBvaW50cyIsImJhc2VTbHVncyIsInNldEFkbWluUm9sZVNjaGVtYSIsIm9iamVjdCIsInRva2VuIiwic3RyaW5nIiwib3B0aW9uYWwiLCJyZWRpcmVjdCIsImdldFNldEFkbWluUm9sZUVuZHBvaW50IiwicGx1Z2luT3B0aW9ucyIsInVzZXJTbHVnIiwiZW5kcG9pbnQiLCJwYXRoIiwic2V0QWRtaW5Sb2xlIiwibWV0aG9kIiwiaGFuZGxlciIsInJlcSIsImNvbmZpZyIsInBheWxvYWQiLCJzY2hlbWEiLCJzYWZlUGFyc2UiLCJxdWVyeSIsInN1Y2Nlc3MiLCJSZXNwb25zZSIsImpzb24iLCJtZXNzYWdlIiwiZXJyb3IiLCJCQURfUkVRVUVTVCIsInBheWxvYWRBdXRoIiwic2Vzc2lvbiIsImJldHRlckF1dGgiLCJhcGkiLCJnZXRTZXNzaW9uIiwiaGVhZGVycyIsIlVOQVVUSE9SSVpFRCIsImRhdGEiLCJpbnZpdGUiLCJmaW5kIiwiY29sbGVjdGlvbiIsImFkbWluSW52aXRhdGlvbnMiLCJzbHVnIiwid2hlcmUiLCJlcXVhbHMiLCJsaW1pdCIsImRvY3MiLCJsZW5ndGgiLCJyb2xlIiwidXBkYXRlZFVzZXIiLCJ1cGRhdGUiLCJpZCIsInVzZXIiLCJvdmVycmlkZUFjY2VzcyIsImRlbGV0ZSIsInJlc3BvbnNlIiwiTG9jYXRpb24iLCJyb3V0ZXMiLCJhZG1pbiIsIklOVEVSTkFMX1NFUlZFUl9FUlJPUiJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsQ0FBQyxRQUFRLE1BQUs7QUFFdkIsU0FBU0MsVUFBVUMsVUFBVSxRQUFRLGNBQWE7QUFFbEQsU0FBU0MsY0FBYyxRQUFRLDRCQUEyQjtBQUMxRCxTQUFTQyxjQUFjLEVBQUVDLFNBQVMsUUFBUSx3QkFBZ0M7QUFFMUUsTUFBTUMscUJBQXFCTixFQUFFTyxNQUFNLENBQUM7SUFDbENDLE9BQU9SLEVBQUVTLE1BQU0sR0FBR0MsUUFBUTtJQUMxQkMsVUFBVVgsRUFBRVMs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