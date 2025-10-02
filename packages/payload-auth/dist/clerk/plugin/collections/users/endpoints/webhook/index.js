import { APIError } from "payload";
import { validateWebhook } from "../../../../../utils/svix";
import { handleUserCreated, handleUserDeleted, handleUserUpdated } from "./handlers";
/**
 * Creates a webhook endpoint for handling Clerk events
 */ export const clerkWebhookEndpoint = ({ userSlug, options })=>{
    const mappingFunction = options.users?.clerkToPayloadMapping // This is forced to be set by the plugin.ts
    ;
    if (!mappingFunction) {
        // This should never happen. Just to make TS happy.
        throw new Error('Clerk to Payload mapping function is not set');
    }
    return {
        path: '/clerk-webhook',
        method: 'post',
        handler: async (req)=>{
            try {
                const { payload } = req;
                if (!req.text) {
                    throw new APIError('Invalid request body', 400);
                }
                // Validate the webhook before reading the body
                if (!await validateWebhook({
                    request: req,
                    secret: options.webhook?.svixSecret
                })) {
                    throw new APIError('Invalid webhook signature', 401);
                }
                // Now we can read the body safely
                const rawBody = await req.text();
                const webhookData = parseWebhookData(rawBody);
                const { type, data } = webhookData;
                if (options.enableDebugLogs) {
                    console.log(`Processing Clerk webhook: ${type}`);
                }
                switch(type){
                    case 'user.created':
                        await handleUserCreated({
                            data,
                            payload,
                            userSlug,
                            mappingFunction,
                            options
                        });
                        break;
                    case 'user.updated':
                        await handleUserUpdated({
                            data,
                            payload,
                            userSlug,
                            mappingFunction: mappingFunction,
                            options
                        });
                        break;
                    case 'user.deleted':
                        await handleUserDeleted({
                            data,
                            payload,
                            userSlug,
                            options
                        });
                        break;
                    default:
                        if (options.enableDebugLogs) {
                            console.log(`Unhandled Clerk webhook type: ${type}`);
                        }
                }
                return new Response(JSON.stringify({
                    success: true
                }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.error('Error processing Clerk webhook:', error);
                throw new APIError('Internal server error', 500);
            }
        }
    };
};
function parseWebhookData(rawBody) {
    return typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jbGVyay9wbHVnaW4vY29sbGVjdGlvbnMvdXNlcnMvZW5kcG9pbnRzL3dlYmhvb2svaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJRXJyb3IsIEVuZHBvaW50IH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB7IENsZXJrUGx1Z2luT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzJ1xuaW1wb3J0IHsgdmFsaWRhdGVXZWJob29rIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdXRpbHMvc3ZpeCdcbmltcG9ydCB7IGhhbmRsZVVzZXJDcmVhdGVkLCBoYW5kbGVVc2VyRGVsZXRlZCwgaGFuZGxlVXNlclVwZGF0ZWQgfSBmcm9tICcuL2hhbmRsZXJzJ1xuXG5pbnRlcmZhY2UgQ2xlcmtXZWJob29rRW5kcG9pbnRPcHRpb25zIHtcbiAgdXNlclNsdWc6IHN0cmluZ1xuICBvcHRpb25zOiBDbGVya1BsdWdpbk9wdGlvbnNcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgd2ViaG9vayBlbmRwb2ludCBmb3IgaGFuZGxpbmcgQ2xlcmsgZXZlbnRzXG4gKi9cbmV4cG9ydCBjb25zdCBjbGVya1dlYmhvb2tFbmRwb2ludCA9ICh7IHVzZXJTbHVnLCBvcHRpb25zIH06IENsZXJrV2ViaG9va0VuZHBvaW50T3B0aW9ucyk6IEVuZHBvaW50ID0+IHtcbiAgY29uc3QgbWFwcGluZ0Z1bmN0aW9uID0gb3B0aW9ucy51c2Vycz8uY2xlcmtUb1BheWxvYWRNYXBwaW5nIC8vIFRoaXMgaXMgZm9yY2VkIHRvIGJlIHNldCBieSB0aGUgcGx1Z2luLnRzXG5cbiAgaWYgKCFtYXBwaW5nRnVuY3Rpb24pIHtcbiAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4uIEp1c3QgdG8gbWFrZSBUUyBoYXBweS5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NsZXJrIHRvIFBheWxvYWQgbWFwcGluZyBmdW5jdGlvbiBpcyBub3Qgc2V0JylcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGF0aDogJy9jbGVyay13ZWJob29rJyxcbiAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICBoYW5kbGVyOiBhc3luYyAocmVxKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHBheWxvYWQgfSA9IHJlcVxuXG4gICAgICAgIGlmICghcmVxLnRleHQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgQVBJRXJyb3IoJ0ludmFsaWQgcmVxdWVzdCBib2R5JywgNDAwKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVmFsaWRhdGUgdGhlIHdlYmhvb2sgYmVmb3JlIHJlYWRpbmcgdGhlIGJvZHlcbiAgICAgICAgaWYgKFxuICAgICAgICAgICEoYXdhaXQgdmFsaWRhdGVXZWJob29rKHtcbiAgICAgICAgICAgIHJlcXVlc3Q6IHJlcSxcbiAgICAgICAgICAgIHNlY3JldDogb3B0aW9ucy53ZWJob29rPy5zdml4U2VjcmV0XG4gICAgICAgICAgfSkpXG4gICAgICAgICkge1xuICAgICAgICAgIHRocm93IG5ldyBBUElFcnJvcignSW52YWxpZCB3ZWJob29rIHNpZ25hdHVyZScsIDQwMSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdyB3ZSBjYW4gcmVhZCB0aGUgYm9keSBzYWZlbHlcbiAgICAgICAgY29uc3QgcmF3Qm9keSA9IGF3YWl0IHJlcS50ZXh0KClcblxuICAgICAgICBjb25zdCB3ZWJob29rRGF0YSA9IHBhcnNlV2ViaG9va0RhdGEocmF3Qm9keSlcbiAgICAgICAgY29uc3QgeyB0eXBlLCBkYXRhIH0gPSB3ZWJob29rRGF0YVxuXG4gICAgICAgIGlmIChvcHRpb25zLmVuYWJsZURlYnVnTG9ncykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBQcm9jZXNzaW5nIENsZXJrIHdlYmhvb2s6ICR7dHlwZX1gKVxuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgY2FzZSAndXNlci5jcmVhdGVkJzpcbiAgICAgICAgICAgIGF3YWl0IGhhbmRsZVVzZXJDcmVhdGVkKHtcbiAgICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgICAgICAgdXNlclNsdWcsXG4gICAgICAgICAgICAgIG1hcHBpbmdGdW5jdGlvbixcbiAgICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICBjYXNlICd1c2VyLnVwZGF0ZWQnOlxuICAgICAgICAgICAgYXdhaXQgaGFuZGxlVXNlclVwZGF0ZWQoe1xuICAgICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgICBwYXlsb2FkLFxuICAgICAgICAgICAgICB1c2VyU2x1ZyxcbiAgICAgICAgICAgICAgbWFwcGluZ0Z1bmN0aW9uOiBtYXBwaW5nRnVuY3Rpb24gYXMgYW55LCAvLyBAVE9ETzogVHlwZSB0aGlzIHByb3Blcmx5XG4gICAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgY2FzZSAndXNlci5kZWxldGVkJzpcbiAgICAgICAgICAgIGF3YWl0IGhhbmRsZVVzZXJEZWxldGVkKHtcbiAgICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgICAgICAgdXNlclNsdWcsXG4gICAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmVuYWJsZURlYnVnTG9ncykge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5oYW5kbGVkIENsZXJrIHdlYmhvb2sgdHlwZTogJHt0eXBlfWApXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogdHJ1ZSB9KSwgeyBzdGF0dXM6IDIwMCwgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHByb2Nlc3NpbmcgQ2xlcmsgd2ViaG9vazonLCBlcnJvcilcbiAgICAgICAgdGhyb3cgbmV3IEFQSUVycm9yKCdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InLCA1MDApXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2ViaG9va0RhdGEocmF3Qm9keTogYW55KTogeyB0eXBlOiBzdHJpbmc7IGRhdGE6IGFueSB9IHtcbiAgcmV0dXJuIHR5cGVvZiByYXdCb2R5ID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UocmF3Qm9keSkgOiByYXdCb2R5XG59XG4iXSwibmFtZXMiOlsiQVBJRXJyb3IiLCJ2YWxpZGF0ZVdlYmhvb2siLCJoYW5kbGVVc2VyQ3JlYXRlZCIsImhhbmRsZVVzZXJEZWxldGVkIiwiaGFuZGxlVXNlclVwZGF0ZWQiLCJjbGVya1dlYmhvb2tFbmRwb2ludCIsInVzZXJTbHVnIiwib3B0aW9ucyIsIm1hcHBpbmdGdW5jdGlvbiIsInVzZXJzIiwiY2xlcmtUb1BheWxvYWRNYXBwaW5nIiwiRXJyb3IiLCJwYXRoIiwibWV0aG9kIiwiaGFuZGxlciIsInJlcSIsInBheWxvYWQiLCJ0ZXh0IiwicmVxdWVzdCIsInNlY3JldCIsIndlYmhvb2siLCJzdml4U2VjcmV0IiwicmF3Qm9keSIsIndlYmhvb2tEYXRhIiwicGFyc2VXZWJob29rRGF0YSIsInR5cGUiLCJkYXRhIiwiZW5hYmxlRGVidWdMb2dzIiwiY29uc29sZSIsImxvZyIsIlJlc3BvbnNlIiwiSlNPTiIsInN0cmluZ2lmeSIsInN1Y2Nlc3MiLCJzdGF0dXMiLCJoZWFkZXJzIiwiZXJyb3IiLCJwYXJzZSJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsUUFBUSxRQUFrQixVQUFTO0FBRTVDLFNBQVNDLGVBQWUsUUFBUSw0QkFBMkI7QUFDM0QsU0FBU0MsaUJBQWlCLEVBQUVDLGlCQUFpQixFQUFFQyxpQkFBaUIsUUFBUSxhQUFZO0FBT3BGOztDQUVDLEdBQ0QsT0FBTyxNQUFNQyx1QkFBdUIsQ0FBQyxFQUFFQyxRQUFRLEVBQUVDLE9BQU8sRUFBK0I7SUFDckYsTUFBTUMsa0JBQWtCRCxRQUFRRSxLQUFLLEVBQUVDLHNCQUFzQiw0Q0FBNEM7O0lBRXpHLElBQUksQ0FBQ0YsaUJBQWlCO1FBQ3BCLG1EQUFtRDtRQUNuRCxNQUFNLElBQUlHLE1BQU07SUFDbEI7SUFFQSxPQUFPO1FBQ0xDLE1BQU07UUFDTkMsUUFBUTtRQUNSQyxTQUFTLE9BQU9DO1lBQ2QsSUFBSTtnQkFDRixNQUFNLEVBQUVDLE9BQU8sRUFBRSxHQUFHRDtnQkFFcEIsSUFBSSxDQUFDQSxJQUFJRSxJQUFJLEVBQUU7b0JBQ2IsTUFBTSxJQUFJakIsU0FBUyx3QkFBd0I7Z0JBQzdDO2dCQUVBLCtDQUErQztnQkFDL0MsSUFDRSxDQUFFLE1BQU1DLGdCQUFnQjtvQkFDdEJpQixTQUFTSDtvQkFDVEksUUFBUVosUUFBUWEsT0FBTyxFQUFFQztnQkFDM0IsSUFDQTtvQkFDQSxNQUFNLElBQUlyQixTQUFTLDZCQUE2QjtnQkFDbEQ7Z0JBRUEsa0NBQWtDO2dCQUNsQyxNQUFNc0IsVUFBVSxNQUFNUCxJQUFJRSxJQUFJO2dCQUU5QixNQUFNTSxjQUFjQyxpQkFBaUJGO2dCQUNyQyxNQUFNLEVBQUVHLElBQUksRUFBRUMsSUFBSSxFQUFFLEdBQUdIO2dCQUV2QixJQUFJaEIsUUFBUW9CLGVBQWUsRUFBRTtvQkFDM0JDLFFBQVFDLEdBQUcsQ0FBQyxDQUFDLDBCQUEwQixFQUFFSixNQUFNO2dCQUNqRDtnQkFFQSxPQUFRQTtvQkFDTixLQUFLO3dCQUNILE1BQU12QixrQkFBa0I7NEJBQ3RCd0I7NEJBQ0FWOzRCQUNBVjs0QkFDQUU7NEJBQ0FEO3dCQUNGO3dCQUNBO29CQUVGLEtBQUs7d0JBQ0gsTUFBTUgsa0JBQWtCOzRCQUN0QnNCOzRCQUNBVjs0QkFDQVY7NEJBQ0FFLGlCQUFpQkE7NEJBQ2pCRDt3QkFDRjt3QkFDQTtvQkFFRixLQUFLO3dCQUNILE1BQU1KLGtCQUFrQjs0QkFDdEJ1Qjs0QkFDQVY7NEJBQ0FWOzRCQUNBQzt3QkFDRjt3QkFDQTtvQkFFRjt3QkFDRSxJQUFJQSxRQUFRb0IsZUFBZSxFQUFFOzRCQUMzQkMsUUFBUUMsR0FBRyxDQUFDLENBQUMsOEJBQThCLEVBQUVKLE1BQU07d0JBQ3JEO2dCQUNKO2dCQUVBLE9BQU8sSUFBSUssU0FBU0MsS0FBS0MsU0FBUyxDQUFDO29CQUFFQyxTQUFTO2dCQUFLLElBQUk7b0JBQUVDLFFBQVE7b0JBQUtDLFNBQVM7d0JBQUUsZ0JBQWdCO29CQUFtQjtnQkFBRTtZQUN4SCxFQUFFLE9BQU9DLE9BQU87Z0JBQ2RSLFFBQVFRLEtBQUssQ0FBQyxtQ0FBbUNBO2dCQUNqRCxNQUFNLElBQUlwQyxTQUFTLHlCQUF5QjtZQUM5QztRQUNGO0lBQ0Y7QUFDRixFQUFDO0FBRUQsU0FBU3dCLGlCQUFpQkYsT0FBWTtJQUNwQyxPQUFPLE9BQU9BLFlBQVksV0FBV1MsS0FBS00sS0FBSyxDQUFDZixXQUFXQTtBQUM3RCJ9