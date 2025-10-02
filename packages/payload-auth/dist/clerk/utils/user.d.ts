/**
 * User-related utility functions for the Clerk plugin
 */
/**
 * Find a user in Payload by their Clerk ID or primary email
 */
export declare function findUserFromClerkUser({ payload, userSlug, clerkUser }: {
    payload: any;
    userSlug: string;
    clerkUser: any;
}): Promise<any>;
/**
 * Get a user by their Clerk ID
 * Returns the first user found or null if not found
 */
export declare function getUserByClerkId(payload: any, userSlug: string, clerkId: string): Promise<any>;
//# sourceMappingURL=user.d.ts.map