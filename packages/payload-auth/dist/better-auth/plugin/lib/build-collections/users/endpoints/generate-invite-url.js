import { status as httpStatus } from "http-status";
import { addDataAndFileToRequest } from "payload";
import { generateAdminInviteUrl } from "../../../../payload/utils/generate-admin-invite-url";
import { adminEndpoints, baseSlugs } from "../../../../constants";
export const getGenerateInviteUrlEndpoint = ({ roles, pluginOptions })=>{
    const endpoint = {
        path: adminEndpoints.generateInviteUrl,
        method: 'post',
        handler: async (req)=>{
            await addDataAndFileToRequest(req);
            const body = req.data;
            const generateAdminInviteUrlFn = pluginOptions?.adminInvitations?.generateInviteUrl ?? generateAdminInviteUrl;
            if (!body) {
                return Response.json({
                    message: 'No body provided'
                }, {
                    status: httpStatus.BAD_REQUEST
                });
            }
            if (typeof body !== 'object' || !('role' in body)) {
                return Response.json({
                    message: 'Invalid body'
                }, {
                    status: httpStatus.BAD_REQUEST
                });
            }
            if (!roles.some((role)=>role.value === body.role.value)) {
                return Response.json({
                    message: 'Invalid role'
                }, {
                    status: httpStatus.BAD_REQUEST
                });
            }
            const token = crypto.randomUUID();
            const inviteLink = generateAdminInviteUrlFn({
                payload: req.payload,
                token
            });
            try {
                await req.payload.create({
                    collection: pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations,
                    data: {
                        token,
                        role: body.role.value,
                        url: inviteLink
                    }
                });
                const response = new Response(JSON.stringify({
                    message: 'Invite link generated successfully',
                    inviteLink
                }), {
                    status: 200
                });
                return response;
            } catch (error) {
                console.error(error);
                return Response.json({
                    message: 'Error generating invite link'
                }, {
                    status: httpStatus.INTERNAL_SERVER_ERROR
                });
            }
        }
    };
    return endpoint;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3VzZXJzL2VuZHBvaW50cy9nZW5lcmF0ZS1pbnZpdGUtdXJsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHN0YXR1cyBhcyBodHRwU3RhdHVzIH0gZnJvbSAnaHR0cC1zdGF0dXMnXG5pbXBvcnQgeyBCZXR0ZXJBdXRoUGx1Z2luT3B0aW9ucyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuaW1wb3J0IHsgYWRkRGF0YUFuZEZpbGVUb1JlcXVlc3QgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHsgZ2VuZXJhdGVBZG1pbkludml0ZVVybCB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3BheWxvYWQvdXRpbHMvZ2VuZXJhdGUtYWRtaW4taW52aXRlLXVybCdcblxuaW1wb3J0IHsgdHlwZSBFbmRwb2ludCB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBhZG1pbkVuZHBvaW50cywgYmFzZVNsdWdzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vY29uc3RhbnRzJ1xuXG50eXBlIEludml0ZUVuZHBvaW50UHJvcHMgPSB7XG4gIHJvbGVzOiB7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcgfVtdXG4gIHBsdWdpbk9wdGlvbnM6IEJldHRlckF1dGhQbHVnaW5PcHRpb25zXG59XG5cbmV4cG9ydCBjb25zdCBnZXRHZW5lcmF0ZUludml0ZVVybEVuZHBvaW50ID0gKHsgcm9sZXMsIHBsdWdpbk9wdGlvbnMgfTogSW52aXRlRW5kcG9pbnRQcm9wcyk6IEVuZHBvaW50ID0+IHtcbiAgY29uc3QgZW5kcG9pbnQ6IEVuZHBvaW50ID0ge1xuICAgIHBhdGg6IGFkbWluRW5kcG9pbnRzLmdlbmVyYXRlSW52aXRlVXJsLFxuICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgIGhhbmRsZXI6IGFzeW5jIChyZXEpID0+IHtcbiAgICAgIGF3YWl0IGFkZERhdGFBbmRGaWxlVG9SZXF1ZXN0KHJlcSlcbiAgICAgIGNvbnN0IGJvZHkgPSByZXEuZGF0YSBhcyB7IHJvbGU6IHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IHN0cmluZyB9IH1cbiAgICAgIGNvbnN0IGdlbmVyYXRlQWRtaW5JbnZpdGVVcmxGbiA9IHBsdWdpbk9wdGlvbnM/LmFkbWluSW52aXRhdGlvbnM/LmdlbmVyYXRlSW52aXRlVXJsID8/IGdlbmVyYXRlQWRtaW5JbnZpdGVVcmxcblxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIHJldHVybiBSZXNwb25zZS5qc29uKHsgbWVzc2FnZTogJ05vIGJvZHkgcHJvdmlkZWQnIH0sIHsgc3RhdHVzOiBodHRwU3RhdHVzLkJBRF9SRVFVRVNUIH0pXG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgYm9keSAhPT0gJ29iamVjdCcgfHwgISgncm9sZScgaW4gYm9keSkpIHtcbiAgICAgICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBtZXNzYWdlOiAnSW52YWxpZCBib2R5JyB9LCB7IHN0YXR1czogaHR0cFN0YXR1cy5CQURfUkVRVUVTVCB9KVxuICAgICAgfVxuXG4gICAgICBpZiAoIXJvbGVzLnNvbWUoKHJvbGUpID0+IHJvbGUudmFsdWUgPT09IGJvZHkucm9sZS52YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBtZXNzYWdlOiAnSW52YWxpZCByb2xlJyB9LCB7IHN0YXR1czogaHR0cFN0YXR1cy5CQURfUkVRVUVTVCB9KVxuICAgICAgfVxuICAgICAgY29uc3QgdG9rZW4gPSBjcnlwdG8ucmFuZG9tVVVJRCgpXG4gICAgICBjb25zdCBpbnZpdGVMaW5rID0gZ2VuZXJhdGVBZG1pbkludml0ZVVybEZuKHtcbiAgICAgICAgcGF5bG9hZDogcmVxLnBheWxvYWQsXG4gICAgICAgIHRva2VuXG4gICAgICB9KVxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCByZXEucGF5bG9hZC5jcmVhdGUoe1xuICAgICAgICAgIGNvbGxlY3Rpb246IHBsdWdpbk9wdGlvbnMuYWRtaW5JbnZpdGF0aW9ucz8uc2x1ZyA/PyBiYXNlU2x1Z3MuYWRtaW5JbnZpdGF0aW9ucyxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICB0b2tlbixcbiAgICAgICAgICAgIHJvbGU6IGJvZHkucm9sZS52YWx1ZSxcbiAgICAgICAgICAgIHVybDogaW52aXRlTGlua1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UoXG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgbWVzc2FnZTogJ0ludml0ZSBsaW5rIGdlbmVyYXRlZCBzdWNjZXNzZnVsbHknLFxuICAgICAgICAgICAgaW52aXRlTGlua1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1czogMjAwXG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICAgIHJldHVybiByZXNwb25zZVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcbiAgICAgICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBtZXNzYWdlOiAnRXJyb3IgZ2VuZXJhdGluZyBpbnZpdGUgbGluaycgfSwgeyBzdGF0dXM6IGh0dHBTdGF0dXMuSU5URVJOQUxfU0VSVkVSX0VSUk9SIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVuZHBvaW50XG59XG4iXSwibmFtZXMiOlsic3RhdHVzIiwiaHR0cFN0YXR1cyIsImFkZERhdGFBbmRGaWxlVG9SZXF1ZXN0IiwiZ2VuZXJhdGVBZG1pbkludml0ZVVybCIsImFkbWluRW5kcG9pbnRzIiwiYmFzZVNsdWdzIiwiZ2V0R2VuZXJhdGVJbnZpdGVVcmxFbmRwb2ludCIsInJvbGVzIiwicGx1Z2luT3B0aW9ucyIsImVuZHBvaW50IiwicGF0aCIsImdlbmVyYXRlSW52aXRlVXJsIiwibWV0aG9kIiwiaGFuZGxlciIsInJlcSIsImJvZHkiLCJkYXRhIiwiZ2VuZXJhdGVBZG1pbkludml0ZVVybEZuIiwiYWRtaW5JbnZpdGF0aW9ucyIsIlJlc3BvbnNlIiwianNvbiIsIm1lc3NhZ2UiLCJCQURfUkVRVUVTVCIsInNvbWUiLCJyb2xlIiwidmFsdWUiLCJ0b2tlbiIsImNyeXB0byIsInJhbmRvbVVVSUQiLCJpbnZpdGVMaW5rIiwicGF5bG9hZCIsImNyZWF0ZSIsImNvbGxlY3Rpb24iLCJzbHVnIiwidXJsIiwicmVzcG9uc2UiLCJKU09OIiwic3RyaW5naWZ5IiwiZXJyb3IiLCJjb25zb2xlIiwiSU5URVJOQUxfU0VSVkVSX0VSUk9SIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxVQUFVQyxVQUFVLFFBQVEsY0FBYTtBQUVsRCxTQUFTQyx1QkFBdUIsUUFBUSxVQUFTO0FBQ2pELFNBQVNDLHNCQUFzQixRQUFRLHNEQUE4RDtBQUdyRyxTQUFTQyxjQUFjLEVBQUVDLFNBQVMsUUFBUSx3QkFBZ0M7QUFPMUUsT0FBTyxNQUFNQywrQkFBK0IsQ0FBQyxFQUFFQyxLQUFLLEVBQUVDLGFBQWEsRUFBdUI7SUFDeEYsTUFBTUMsV0FBcUI7UUFDekJDLE1BQU1OLGVBQWVPLGlCQUFpQjtRQUN0Q0MsUUFBUTtRQUNSQyxTQUFTLE9BQU9DO1lBQ2QsTUFBTVosd0JBQXdCWTtZQUM5QixNQUFNQyxPQUFPRCxJQUFJRSxJQUFJO1lBQ3JCLE1BQU1DLDJCQUEyQlQsZUFBZVUsa0JBQWtCUCxxQkFBcUJSO1lBRXZGLElBQUksQ0FBQ1ksTUFBTTtnQkFDVCxPQUFPSSxTQUFTQyxJQUFJLENBQUM7b0JBQUVDLFNBQVM7Z0JBQW1CLEdBQUc7b0JBQUVyQixRQUFRQyxXQUFXcUIsV0FBVztnQkFBQztZQUN6RjtZQUVBLElBQUksT0FBT1AsU0FBUyxZQUFZLENBQUUsQ0FBQSxVQUFVQSxJQUFHLEdBQUk7Z0JBQ2pELE9BQU9JLFNBQVNDLElBQUksQ0FBQztvQkFBRUMsU0FBUztnQkFBZSxHQUFHO29CQUFFckIsUUFBUUMsV0FBV3FCLFdBQVc7Z0JBQUM7WUFDckY7WUFFQSxJQUFJLENBQUNmLE1BQU1nQixJQUFJLENBQUMsQ0FBQ0MsT0FBU0EsS0FBS0MsS0FBSyxLQUFLVixLQUFLUyxJQUFJLENBQUNDLEtBQUssR0FBRztnQkFDekQsT0FBT04sU0FBU0MsSUFBSSxDQUFDO29CQUFFQyxTQUFTO2dCQUFlLEdBQUc7b0JBQUVyQixRQUFRQyxXQUFXcUIsV0FBVztnQkFBQztZQUNyRjtZQUNBLE1BQU1JLFFBQVFDLE9BQU9DLFVBQVU7WUFDL0IsTUFBTUMsYUFBYVoseUJBQXlCO2dCQUMxQ2EsU0FBU2hCLElBQUlnQixPQUFPO2dCQUNwQko7WUFDRjtZQUVBLElBQUk7Z0JBQ0YsTUFBTVosSUFBSWdCLE9BQU8sQ0FBQ0MsTUFBTSxDQUFDO29CQUN2QkMsWUFBWXhCLGNBQWNVLGdCQUFnQixFQUFFZSxRQUFRNUIsVUFBVWEsZ0JBQWdCO29CQUM5RUYsTUFBTTt3QkFDSlU7d0JBQ0FGLE1BQU1ULEtBQUtTLElBQUksQ0FBQ0MsS0FBSzt3QkFDckJTLEtBQUtMO29CQUNQO2dCQUNGO2dCQUNBLE1BQU1NLFdBQVcsSUFBSWhCLFNBQ25CaUIsS0FBS0MsU0FBUyxDQUFDO29CQUNiaEIsU0FBUztvQkFDVFE7Z0JBQ0YsSUFDQTtvQkFDRTdCLFFBQVE7Z0JBQ1Y7Z0JBRUYsT0FBT21DO1lBQ1QsRUFBRSxPQUFPRyxPQUFPO2dCQUNkQyxRQUFRRCxLQUFLLENBQUNBO2dCQUNkLE9BQU9uQixTQUFTQyxJQUFJLENBQUM7b0JBQUVDLFNBQVM7Z0JBQStCLEdBQUc7b0JBQUVyQixRQUFRQyxXQUFXdUMscUJBQXFCO2dCQUFDO1lBQy9HO1FBQ0Y7SUFDRjtJQUVBLE9BQU8vQjtBQUNULEVBQUMifQ==