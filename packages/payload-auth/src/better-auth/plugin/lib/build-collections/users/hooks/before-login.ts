import { APIError, CollectionBeforeLoginHook } from 'payload'
import type { BetterAuthOptions } from '@/better-auth/plugin/types'
/**
 * This hook blocks login attempts if email verification is required and the user's email is not verified
 */
export function getBeforeLoginHook(betterAuthOptions: BetterAuthOptions) {
  const hook: CollectionBeforeLoginHook = async ({ user }) => {
    const requireEmailVerification = betterAuthOptions.emailAndPassword?.requireEmailVerification ?? false

    if (requireEmailVerification && !user.emailVerified) {
      throw new APIError('Email verification required. Please verify your email before logging in.', 403)
    }

    return user
  }

  return hook
}
