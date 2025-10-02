import { Webhook } from "svix";
/**
 * Validates a webhook request using Svix
 */ export async function validateWebhook({ request, secret }) {
    // Verify we have the needed methods on the request
    if (!request.clone || typeof request.clone !== 'function') {
        console.error('Svix validation error: request.clone method not available');
        return false;
    }
    const webhookSecret = secret || process.env.CLERK_WEBHOOK_SECRET || process.env.SVIX_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.warn('Clerk webhook called without Svix validation - not recommended for production');
        return process.env.NODE_ENV !== 'production';
    }
    try {
        const headers = request.headers;
        const svixId = headers.get('svix-id');
        const svixTimestamp = headers.get('svix-timestamp');
        const svixSignature = headers.get('svix-signature');
        if (!svixId || !svixTimestamp || !svixSignature) {
            return false;
        }
        const webhook = new Webhook(webhookSecret);
        const svixHeaders = {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature
        };
        // Clone the request to avoid consuming the body
        const clonedRequest = request.clone();
        const body = await clonedRequest.text();
        await webhook.verify(body, svixHeaders);
        return true;
    } catch (error) {
        console.error('Svix webhook verification failed:', error);
        return false;
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGVyay91dGlscy9zdml4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUGF5bG9hZFJlcXVlc3QgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHsgV2ViaG9vayB9IGZyb20gJ3N2aXgnXG5cbi8qKlxuICogVmFsaWRhdGVzIGEgd2ViaG9vayByZXF1ZXN0IHVzaW5nIFN2aXhcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlV2ViaG9vayh7IHJlcXVlc3QsIHNlY3JldCB9OiB7IHJlcXVlc3Q6IFBheWxvYWRSZXF1ZXN0OyBzZWNyZXQ/OiBzdHJpbmcgfSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAvLyBWZXJpZnkgd2UgaGF2ZSB0aGUgbmVlZGVkIG1ldGhvZHMgb24gdGhlIHJlcXVlc3RcbiAgaWYgKCFyZXF1ZXN0LmNsb25lIHx8IHR5cGVvZiByZXF1ZXN0LmNsb25lICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc29sZS5lcnJvcignU3ZpeCB2YWxpZGF0aW9uIGVycm9yOiByZXF1ZXN0LmNsb25lIG1ldGhvZCBub3QgYXZhaWxhYmxlJylcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGNvbnN0IHdlYmhvb2tTZWNyZXQgPSBzZWNyZXQgfHwgcHJvY2Vzcy5lbnYuQ0xFUktfV0VCSE9PS19TRUNSRVQgfHwgcHJvY2Vzcy5lbnYuU1ZJWF9XRUJIT09LX1NFQ1JFVFxuXG4gIGlmICghd2ViaG9va1NlY3JldCkge1xuICAgIGNvbnNvbGUud2FybignQ2xlcmsgd2ViaG9vayBjYWxsZWQgd2l0aG91dCBTdml4IHZhbGlkYXRpb24gLSBub3QgcmVjb21tZW5kZWQgZm9yIHByb2R1Y3Rpb24nKVxuICAgIHJldHVybiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nXG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IGhlYWRlcnMgPSByZXF1ZXN0LmhlYWRlcnNcblxuICAgIGNvbnN0IHN2aXhJZCA9IGhlYWRlcnMuZ2V0KCdzdml4LWlkJylcbiAgICBjb25zdCBzdml4VGltZXN0YW1wID0gaGVhZGVycy5nZXQoJ3N2aXgtdGltZXN0YW1wJylcbiAgICBjb25zdCBzdml4U2lnbmF0dXJlID0gaGVhZGVycy5nZXQoJ3N2aXgtc2lnbmF0dXJlJylcblxuICAgIGlmICghc3ZpeElkIHx8ICFzdml4VGltZXN0YW1wIHx8ICFzdml4U2lnbmF0dXJlKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBjb25zdCB3ZWJob29rID0gbmV3IFdlYmhvb2sod2ViaG9va1NlY3JldClcblxuICAgIGNvbnN0IHN2aXhIZWFkZXJzID0ge1xuICAgICAgJ3N2aXgtaWQnOiBzdml4SWQsXG4gICAgICAnc3ZpeC10aW1lc3RhbXAnOiBzdml4VGltZXN0YW1wLFxuICAgICAgJ3N2aXgtc2lnbmF0dXJlJzogc3ZpeFNpZ25hdHVyZVxuICAgIH1cblxuICAgIC8vIENsb25lIHRoZSByZXF1ZXN0IHRvIGF2b2lkIGNvbnN1bWluZyB0aGUgYm9keVxuICAgIGNvbnN0IGNsb25lZFJlcXVlc3QgPSByZXF1ZXN0LmNsb25lKClcbiAgICBjb25zdCBib2R5ID0gYXdhaXQgY2xvbmVkUmVxdWVzdC50ZXh0KClcblxuICAgIGF3YWl0IHdlYmhvb2sudmVyaWZ5KGJvZHksIHN2aXhIZWFkZXJzKVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignU3ZpeCB3ZWJob29rIHZlcmlmaWNhdGlvbiBmYWlsZWQ6JywgZXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJXZWJob29rIiwidmFsaWRhdGVXZWJob29rIiwicmVxdWVzdCIsInNlY3JldCIsImNsb25lIiwiY29uc29sZSIsImVycm9yIiwid2ViaG9va1NlY3JldCIsInByb2Nlc3MiLCJlbnYiLCJDTEVSS19XRUJIT09LX1NFQ1JFVCIsIlNWSVhfV0VCSE9PS19TRUNSRVQiLCJ3YXJuIiwiTk9ERV9FTlYiLCJoZWFkZXJzIiwic3ZpeElkIiwiZ2V0Iiwic3ZpeFRpbWVzdGFtcCIsInN2aXhTaWduYXR1cmUiLCJ3ZWJob29rIiwic3ZpeEhlYWRlcnMiLCJjbG9uZWRSZXF1ZXN0IiwiYm9keSIsInRleHQiLCJ2ZXJpZnkiXSwibWFwcGluZ3MiOiJBQUNBLFNBQVNBLE9BQU8sUUFBUSxPQUFNO0FBRTlCOztDQUVDLEdBQ0QsT0FBTyxlQUFlQyxnQkFBZ0IsRUFBRUMsT0FBTyxFQUFFQyxNQUFNLEVBQWdEO0lBQ3JHLG1EQUFtRDtJQUNuRCxJQUFJLENBQUNELFFBQVFFLEtBQUssSUFBSSxPQUFPRixRQUFRRSxLQUFLLEtBQUssWUFBWTtRQUN6REMsUUFBUUMsS0FBSyxDQUFDO1FBQ2QsT0FBTztJQUNUO0lBRUEsTUFBTUMsZ0JBQWdCSixVQUFVSyxRQUFRQyxHQUFHLENBQUNDLG9CQUFvQixJQUFJRixRQUFRQyxHQUFHLENBQUNFLG1CQUFtQjtJQUVuRyxJQUFJLENBQUNKLGVBQWU7UUFDbEJGLFFBQVFPLElBQUksQ0FBQztRQUNiLE9BQU9KLFFBQVFDLEdBQUcsQ0FBQ0ksUUFBUSxLQUFLO0lBQ2xDO0lBRUEsSUFBSTtRQUNGLE1BQU1DLFVBQVVaLFFBQVFZLE9BQU87UUFFL0IsTUFBTUMsU0FBU0QsUUFBUUUsR0FBRyxDQUFDO1FBQzNCLE1BQU1DLGdCQUFnQkgsUUFBUUUsR0FBRyxDQUFDO1FBQ2xDLE1BQU1FLGdCQUFnQkosUUFBUUUsR0FBRyxDQUFDO1FBRWxDLElBQUksQ0FBQ0QsVUFBVSxDQUFDRSxpQkFBaUIsQ0FBQ0MsZUFBZTtZQUMvQyxPQUFPO1FBQ1Q7UUFFQSxNQUFNQyxVQUFVLElBQUluQixRQUFRTztRQUU1QixNQUFNYSxjQUFjO1lBQ2xCLFdBQVdMO1lBQ1gsa0JBQWtCRTtZQUNsQixrQkFBa0JDO1FBQ3BCO1FBRUEsZ0RBQWdEO1FBQ2hELE1BQU1HLGdCQUFnQm5CLFFBQVFFLEtBQUs7UUFDbkMsTUFBTWtCLE9BQU8sTUFBTUQsY0FBY0UsSUFBSTtRQUVyQyxNQUFNSixRQUFRSyxNQUFNLENBQUNGLE1BQU1GO1FBQzNCLE9BQU87SUFDVCxFQUFFLE9BQU9kLE9BQU87UUFDZEQsUUFBUUMsS0FBSyxDQUFDLHFDQUFxQ0E7UUFDbkQsT0FBTztJQUNUO0FBQ0YifQ==