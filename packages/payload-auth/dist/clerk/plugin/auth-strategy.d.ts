import type { AuthStrategy } from 'payload';
/**
 * Authentication strategy for Clerk
 * Integrates Payload with Clerk using the official Clerk auth method
 *
 * @param adminRoles - Admin roles
 * @param userSlug - User collection slug
 * @returns Auth strategy
 */
export declare function clerkAuthStrategy(userSlug?: string): AuthStrategy;
//# sourceMappingURL=auth-strategy.d.ts.map