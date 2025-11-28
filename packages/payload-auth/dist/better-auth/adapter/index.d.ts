import { generateSchema } from './generate-schema';
import type { PayloadAdapter } from './types';
export declare const BETTER_AUTH_CONTEXT_KEY = "payload-db-adapter";
/**
 * Payload adapter for Better Auth
 *
 * This adapter connects Better Auth to Payload CMS, allowing authentication
 * operations to be performed against Payload collections.
 *
 * @param payloadClient - The Payload CMS client instance or a function that returns it
 * @param config - Configuration options for the adapter
 * @returns A function that creates a Better Auth adapter
 */
declare const payloadAdapter: PayloadAdapter;
export { generateSchema, payloadAdapter };
//# sourceMappingURL=index.d.ts.map