import { BetterAuthPluginOptions } from '@/better-auth/types';
import type { SanitizedBetterAuthOptions } from '@/better-auth/plugin/types';
/**
 * Mofies options object and adds a middleware to check for admin invite for sign up
 */
export declare const requireAdminInviteForSignUpMiddleware: ({ options, pluginOptions }: {
    options: SanitizedBetterAuthOptions;
    pluginOptions: BetterAuthPluginOptions;
}) => Promise<void>;
//# sourceMappingURL=require-admin-invite-for-sign-up-middleware.d.ts.map