import type { PayloadRequest } from 'payload';
/**
 * Validates a webhook request using Svix
 */
export declare function validateWebhook({ request, secret }: {
    request: PayloadRequest;
    secret?: string;
}): Promise<boolean>;
//# sourceMappingURL=svix.d.ts.map