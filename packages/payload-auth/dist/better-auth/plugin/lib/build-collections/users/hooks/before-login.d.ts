import { CollectionBeforeLoginHook } from 'payload';
import type { BetterAuthOptions } from '@/better-auth/plugin/types';
/**
 * This hook blocks login attempts if email verification is required and the user's email is not verified
 */
export declare function getBeforeLoginHook(betterAuthOptions: BetterAuthOptions): CollectionBeforeLoginHook;
//# sourceMappingURL=before-login.d.ts.map