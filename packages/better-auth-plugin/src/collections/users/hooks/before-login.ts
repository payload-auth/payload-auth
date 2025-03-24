import { APIError, CollectionBeforeLoginHook } from 'payload'
import { getPayloadWithAuth } from '../../../index'

/**
 * This hook blocks login attempts if email verification is required and the user's email is not verified
 */
export const getBeforeLoginHook = (): CollectionBeforeLoginHook => {
  const hook: CollectionBeforeLoginHook = async ({ req, user }) => {
    const config = req.payload.config
    const payload = await getPayloadWithAuth(config)

    const requireEmailVerification = payload.betterAuth.options.emailAndPassword?.requireEmailVerification ?? false
    
    if (requireEmailVerification && !user.emailVerified) {
      throw new APIError('Email verification required. Please verify your email before logging in.', 403)
    }

    return user
  }

  return hook
}