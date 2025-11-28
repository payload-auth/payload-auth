import type { SanitizedBetterAuthOptions } from '@/better-auth/plugin/types';
/**
 * Adds a before hook to the user create operation to ensure the password is set.
 * This is necessary because the password is not set in the user create operation
 * and is instead set in the sync password accounts hook.
 */
export declare function ensurePasswordSetBeforeUserCreate(options: SanitizedBetterAuthOptions): void;
//# sourceMappingURL=ensure-password-set-before-create.d.ts.map