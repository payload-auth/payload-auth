import type { SanitizedBetterAuthOptions } from '@/better-auth/plugin/types';
/**
 * Sets up a middleware that converts session.user.role from an array to a single string seperated by commas. only for /admin routes
 */
export declare function adminBeforeRoleMiddleware({ sanitizedOptions }: {
    sanitizedOptions: SanitizedBetterAuthOptions;
}): void;
//# sourceMappingURL=admin-before-role-middleware.d.ts.map