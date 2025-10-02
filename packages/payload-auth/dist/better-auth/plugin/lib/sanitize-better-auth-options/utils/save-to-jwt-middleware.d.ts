import type { BetterAuthSchemas, SanitizedBetterAuthOptions } from '@/better-auth/plugin/types';
import type { Config, Payload } from 'payload';
/**
 * Sets up a middleware that enforces the saveToJwt configuration when setting session data.
 * This ensures that only fields specified in saveToJwt are included in the cookie cache
 * for both user and session objects.
 *
 * The middleware runs after authentication and filters the session data based on
 * the collection configurations before storing it in the cookie cache.
 */
export declare function saveToJwtMiddleware({ sanitizedOptions, config, resolvedSchemas }: {
    sanitizedOptions: SanitizedBetterAuthOptions;
    config: Payload['config'] | Config | Promise<Payload['config'] | Config>;
    resolvedSchemas: BetterAuthSchemas;
}): void;
//# sourceMappingURL=save-to-jwt-middleware.d.ts.map