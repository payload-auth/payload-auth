import type { SanitizedBetterAuthOptions } from '@/better-auth/plugin/types';
/**
 * Sets up a middleware that converts session.user.role from an a single string seperated by commas back to an array only for /admin routes
 */
export declare function adminAfterRoleMiddleware({ sanitizedOptions }: {
    sanitizedOptions: SanitizedBetterAuthOptions;
}): void;
//# sourceMappingURL=admin-after-role-middleware.d.ts.map