import type { SanitizedBetterAuthOptions } from '@/better-auth/plugin/types';
/**
 * Modifies options object and adds a middleware to check for admin invite for sign up
 */
export declare const useAdminInviteAfterEmailSignUpMiddleware: ({ options, adminInvitationCollectionSlug, userCollectionSlug }: {
    options: SanitizedBetterAuthOptions;
    adminInvitationCollectionSlug: string;
    userCollectionSlug: string;
}) => Promise<void>;
//# sourceMappingURL=use-admin-invite-after-email-sign-up-middleware.d.ts.map