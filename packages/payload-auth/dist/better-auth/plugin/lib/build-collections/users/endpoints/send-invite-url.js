import { addDataAndFileToRequest, headersWithCors, killTransaction } from "payload";
import { status as httpStatus } from "http-status";
import { z } from "zod";
import { adminEndpoints } from "../../../../constants";
const requestSchema = z.object({
    email: z.string().email(),
    link: z.string()
});
export const getSendInviteUrlEndpoint = (pluginOptions)=>{
    const endpoint = {
        path: adminEndpoints.sendInvite,
        method: 'post',
        handler: async (req)=>{
            await addDataAndFileToRequest(req);
            const { t } = req;
            const body = requestSchema.safeParse(req.data);
            if (!body.success) {
                return Response.json({
                    message: body.error.message
                }, {
                    status: httpStatus.BAD_REQUEST
                });
            }
            const sendInviteEmailFn = pluginOptions.adminInvitations?.sendInviteEmail;
            if (!sendInviteEmailFn) {
                req.payload.logger.error('Send admin invite email function not configured, please add the function to the betterAuthPlugin options.');
                return Response.json({
                    message: 'Send invite email function not found'
                }, {
                    status: httpStatus.INTERNAL_SERVER_ERROR
                });
            }
            try {
                const res = await sendInviteEmailFn({
                    payload: req.payload,
                    email: body.data.email,
                    url: body.data.link
                });
                if (!res.success) {
                    return Response.json({
                        message: res.message
                    }, {
                        status: httpStatus.INTERNAL_SERVER_ERROR
                    });
                }
                return Response.json({
                    message: t('general:success')
                }, {
                    headers: headersWithCors({
                        headers: new Headers(),
                        req
                    }),
                    status: httpStatus.OK
                });
            } catch (error) {
                await killTransaction(req);
                throw error;
            }
        }
    };
    return endpoint;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3VzZXJzL2VuZHBvaW50cy9zZW5kLWludml0ZS11cmwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYWRkRGF0YUFuZEZpbGVUb1JlcXVlc3QsIEVuZHBvaW50LCBoZWFkZXJzV2l0aENvcnMsIGtpbGxUcmFuc2FjdGlvbiB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBzdGF0dXMgYXMgaHR0cFN0YXR1cyB9IGZyb20gJ2h0dHAtc3RhdHVzJ1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCdcbmltcG9ydCB7IGFkbWluRW5kcG9pbnRzIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vY29uc3RhbnRzJ1xuaW1wb3J0IHR5cGUgeyBCZXR0ZXJBdXRoUGx1Z2luT3B0aW9ucyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuXG5jb25zdCByZXF1ZXN0U2NoZW1hID0gei5vYmplY3Qoe1xuICBlbWFpbDogei5zdHJpbmcoKS5lbWFpbCgpLFxuICBsaW5rOiB6LnN0cmluZygpXG59KVxuXG5leHBvcnQgY29uc3QgZ2V0U2VuZEludml0ZVVybEVuZHBvaW50ID0gKHBsdWdpbk9wdGlvbnM6IEJldHRlckF1dGhQbHVnaW5PcHRpb25zKTogRW5kcG9pbnQgPT4ge1xuICBjb25zdCBlbmRwb2ludDogRW5kcG9pbnQgPSB7XG4gICAgcGF0aDogYWRtaW5FbmRwb2ludHMuc2VuZEludml0ZSxcbiAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICBoYW5kbGVyOiBhc3luYyAocmVxKSA9PiB7XG4gICAgICBhd2FpdCBhZGREYXRhQW5kRmlsZVRvUmVxdWVzdChyZXEpXG4gICAgICBjb25zdCB7IHQgfSA9IHJlcVxuICAgICAgY29uc3QgYm9keSA9IHJlcXVlc3RTY2hlbWEuc2FmZVBhcnNlKHJlcS5kYXRhKVxuICAgICAgaWYgKCFib2R5LnN1Y2Nlc3MpIHtcbiAgICAgICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBtZXNzYWdlOiBib2R5LmVycm9yLm1lc3NhZ2UgfSwgeyBzdGF0dXM6IGh0dHBTdGF0dXMuQkFEX1JFUVVFU1QgfSlcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2VuZEludml0ZUVtYWlsRm4gPSBwbHVnaW5PcHRpb25zLmFkbWluSW52aXRhdGlvbnM/LnNlbmRJbnZpdGVFbWFpbFxuXG4gICAgICBpZiAoIXNlbmRJbnZpdGVFbWFpbEZuKSB7XG4gICAgICAgIHJlcS5wYXlsb2FkLmxvZ2dlci5lcnJvcihcbiAgICAgICAgICAnU2VuZCBhZG1pbiBpbnZpdGUgZW1haWwgZnVuY3Rpb24gbm90IGNvbmZpZ3VyZWQsIHBsZWFzZSBhZGQgdGhlIGZ1bmN0aW9uIHRvIHRoZSBiZXR0ZXJBdXRoUGx1Z2luIG9wdGlvbnMuJ1xuICAgICAgICApXG4gICAgICAgIHJldHVybiBSZXNwb25zZS5qc29uKHsgbWVzc2FnZTogJ1NlbmQgaW52aXRlIGVtYWlsIGZ1bmN0aW9uIG5vdCBmb3VuZCcgfSwgeyBzdGF0dXM6IGh0dHBTdGF0dXMuSU5URVJOQUxfU0VSVkVSX0VSUk9SIH0pXG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHNlbmRJbnZpdGVFbWFpbEZuKHtcbiAgICAgICAgICBwYXlsb2FkOiByZXEucGF5bG9hZCxcbiAgICAgICAgICBlbWFpbDogYm9keS5kYXRhLmVtYWlsLFxuICAgICAgICAgIHVybDogYm9keS5kYXRhLmxpbmtcbiAgICAgICAgfSlcblxuICAgICAgICBpZiAoIXJlcy5zdWNjZXNzKSB7XG4gICAgICAgICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBtZXNzYWdlOiByZXMubWVzc2FnZSB9LCB7IHN0YXR1czogaHR0cFN0YXR1cy5JTlRFUk5BTF9TRVJWRVJfRVJST1IgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBSZXNwb25zZS5qc29uKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IHQoJ2dlbmVyYWw6c3VjY2VzcycpXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzV2l0aENvcnMoe1xuICAgICAgICAgICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycygpLFxuICAgICAgICAgICAgICByZXFcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgc3RhdHVzOiBodHRwU3RhdHVzLk9LXG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBhd2FpdCBraWxsVHJhbnNhY3Rpb24ocmVxKVxuICAgICAgICB0aHJvdyBlcnJvclxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gZW5kcG9pbnRcbn1cbiJdLCJuYW1lcyI6WyJhZGREYXRhQW5kRmlsZVRvUmVxdWVzdCIsImhlYWRlcnNXaXRoQ29ycyIsImtpbGxUcmFuc2FjdGlvbiIsInN0YXR1cyIsImh0dHBTdGF0dXMiLCJ6IiwiYWRtaW5FbmRwb2ludHMiLCJyZXF1ZXN0U2NoZW1hIiwib2JqZWN0IiwiZW1haWwiLCJzdHJpbmciLCJsaW5rIiwiZ2V0U2VuZEludml0ZVVybEVuZHBvaW50IiwicGx1Z2luT3B0aW9ucyIsImVuZHBvaW50IiwicGF0aCIsInNlbmRJbnZpdGUiLCJtZXRob2QiLCJoYW5kbGVyIiwicmVxIiwidCIsImJvZHkiLCJzYWZlUGFyc2UiLCJkYXRhIiwic3VjY2VzcyIsIlJlc3BvbnNlIiwianNvbiIsIm1lc3NhZ2UiLCJlcnJvciIsIkJBRF9SRVFVRVNUIiwic2VuZEludml0ZUVtYWlsRm4iLCJhZG1pbkludml0YXRpb25zIiwic2VuZEludml0ZUVtYWlsIiwicGF5bG9hZCIsImxvZ2dlciIsIklOVEVSTkFMX1NFUlZFUl9FUlJPUiIsInJlcyIsInVybCIsImhlYWRlcnMiLCJIZWFkZXJzIiwiT0siXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLHVCQUF1QixFQUFZQyxlQUFlLEVBQUVDLGVBQWUsUUFBUSxVQUFTO0FBQzdGLFNBQVNDLFVBQVVDLFVBQVUsUUFBUSxjQUFhO0FBQ2xELFNBQVNDLENBQUMsUUFBUSxNQUFLO0FBQ3ZCLFNBQVNDLGNBQWMsUUFBUSx3QkFBZ0M7QUFHL0QsTUFBTUMsZ0JBQWdCRixFQUFFRyxNQUFNLENBQUM7SUFDN0JDLE9BQU9KLEVBQUVLLE1BQU0sR0FBR0QsS0FBSztJQUN2QkUsTUFBTU4sRUFBRUssTUFBTTtBQUNoQjtBQUVBLE9BQU8sTUFBTUUsMkJBQTJCLENBQUNDO0lBQ3ZDLE1BQU1DLFdBQXFCO1FBQ3pCQyxNQUFNVCxlQUFlVSxVQUFVO1FBQy9CQyxRQUFRO1FBQ1JDLFNBQVMsT0FBT0M7WUFDZCxNQUFNbkIsd0JBQXdCbUI7WUFDOUIsTUFBTSxFQUFFQyxDQUFDLEVBQUUsR0FBR0Q7WUFDZCxNQUFNRSxPQUFPZCxjQUFjZSxTQUFTLENBQUNILElBQUlJLElBQUk7WUFDN0MsSUFBSSxDQUFDRixLQUFLRyxPQUFPLEVBQUU7Z0JBQ2pCLE9BQU9DLFNBQVNDLElBQUksQ0FBQztvQkFBRUMsU0FBU04sS0FBS08sS0FBSyxDQUFDRCxPQUFPO2dCQUFDLEdBQUc7b0JBQUV4QixRQUFRQyxXQUFXeUIsV0FBVztnQkFBQztZQUN6RjtZQUVBLE1BQU1DLG9CQUFvQmpCLGNBQWNrQixnQkFBZ0IsRUFBRUM7WUFFMUQsSUFBSSxDQUFDRixtQkFBbUI7Z0JBQ3RCWCxJQUFJYyxPQUFPLENBQUNDLE1BQU0sQ0FBQ04sS0FBSyxDQUN0QjtnQkFFRixPQUFPSCxTQUFTQyxJQUFJLENBQUM7b0JBQUVDLFNBQVM7Z0JBQXVDLEdBQUc7b0JBQUV4QixRQUFRQyxXQUFXK0IscUJBQXFCO2dCQUFDO1lBQ3ZIO1lBRUEsSUFBSTtnQkFDRixNQUFNQyxNQUFNLE1BQU1OLGtCQUFrQjtvQkFDbENHLFNBQVNkLElBQUljLE9BQU87b0JBQ3BCeEIsT0FBT1ksS0FBS0UsSUFBSSxDQUFDZCxLQUFLO29CQUN0QjRCLEtBQUtoQixLQUFLRSxJQUFJLENBQUNaLElBQUk7Z0JBQ3JCO2dCQUVBLElBQUksQ0FBQ3lCLElBQUlaLE9BQU8sRUFBRTtvQkFDaEIsT0FBT0MsU0FBU0MsSUFBSSxDQUFDO3dCQUFFQyxTQUFTUyxJQUFJVCxPQUFPO29CQUFDLEdBQUc7d0JBQUV4QixRQUFRQyxXQUFXK0IscUJBQXFCO29CQUFDO2dCQUM1RjtnQkFFQSxPQUFPVixTQUFTQyxJQUFJLENBQ2xCO29CQUNFQyxTQUFTUCxFQUFFO2dCQUNiLEdBQ0E7b0JBQ0VrQixTQUFTckMsZ0JBQWdCO3dCQUN2QnFDLFNBQVMsSUFBSUM7d0JBQ2JwQjtvQkFDRjtvQkFDQWhCLFFBQVFDLFdBQVdvQyxFQUFFO2dCQUN2QjtZQUVKLEVBQUUsT0FBT1osT0FBTztnQkFDZCxNQUFNMUIsZ0JBQWdCaUI7Z0JBQ3RCLE1BQU1TO1lBQ1I7UUFDRjtJQUNGO0lBQ0EsT0FBT2Q7QUFDVCxFQUFDIn0=