import { Endpoint } from 'payload';
import { ClerkPluginOptions } from '../../../../../types';
interface ClerkWebhookEndpointOptions {
    userSlug: string;
    options: ClerkPluginOptions;
}
/**
 * Creates a webhook endpoint for handling Clerk events
 */
export declare const clerkWebhookEndpoint: ({ userSlug, options }: ClerkWebhookEndpointOptions) => Endpoint;
export {};
//# sourceMappingURL=index.d.ts.map