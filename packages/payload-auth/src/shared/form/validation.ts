import { z } from 'zod'

import { emailRegex, usernameRegex } from '@/shared/utils/regex'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Minimal translation function type extracted from `i18next`.
 * Accepts a key and returns the translated string.
 */
export type Translate = (...args: any[]) => string

// ---------------------------------------------------------------------------
// Field builders
// ---------------------------------------------------------------------------

export const emailField = ({ t, required = true }: { t: Translate; required?: boolean }) => {
  let schema = z.string()
  if (required) schema = schema.min(1, t('validation:required'))
  return schema.refine((val) => emailRegex.test(val), {
    message: t('authentication:emailNotValid') || 'Email is not valid'
  })
}

export const usernameField = ({ t, required = true }: { t: Translate; required?: boolean }) => {
  let schema = z.string()
  if (required) schema = schema.min(1, t('validation:required'))
  return schema.refine((val) => usernameRegex.test(val), {
    message: t('authentication:usernameNotValid') || 'Username is not valid'
  })
}

export const passwordField = ({ t, required = true, minLength = 1 }: { t: Translate; required?: boolean; minLength?: number }) => {
  let schema = z.string()
  if (required) schema = schema.min(minLength, t('validation:required') || 'Password is required')
  return schema
}

export const confirmPasswordField = ({ t, required = true }: { t: Translate; required?: boolean }) => {
  let schema = z.string()
  if (required) schema = schema.min(1, t('validation:required') || 'Confirm password is required')
  return schema
}

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------

/**
 * Returns a Zod object schema with `password` and `confirmPassword` fields
 * and a refinement that ensures they match.
 */
export const passwordWithConfirmation = ({ t, minLength = 1 }: { t: Translate; minLength?: number }) =>
  z
    .object({
      password: passwordField({ t, minLength }),
      confirmPassword: confirmPasswordField({ t })
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: t('fields:passwordsDoNotMatch') || 'Passwords do not match'
    })

// ---------------------------------------------------------------------------
// Utility validators (non‑Zod) — handy for dynamic login field checks
// ---------------------------------------------------------------------------

export const isValidEmail = (val: string) => emailRegex.test(val)
export const isValidUsername = (val: string, { minLength = 5, maxLength = 128 }: { minLength?: number; maxLength?: number } = {}) =>
  usernameRegex.test(val) && val.length >= minLength && val.length <= maxLength

// ---------------------------------------------------------------------------
// Schema builders
// ---------------------------------------------------------------------------

type UsernameSettings = { minLength: number; maxLength: number }

export const createLoginSchema = ({
  t,
  loginType,
  canLoginWithUsername = false,
  usernameSettings = { minLength: 5, maxLength: 128 }
}: {
  t: Translate
  loginType: 'email' | 'username' | 'emailOrUsername'
  canLoginWithUsername?: boolean
  usernameSettings?: UsernameSettings
}) =>
  z.object({
    login: z.string().refine(
      (val) => {
        if (!val) return false
        if (loginType === 'email') return isValidEmail(val)
        if (loginType === 'username') return isValidUsername(val, usernameSettings)
        return isValidEmail(val) || isValidUsername(val, usernameSettings)
      },
      (val) => {
        if (!val) return { message: t('validation:required') }

        const isProbablyEmail = val.includes('@') || !canLoginWithUsername

        if (loginType === 'email') {
          return { message: t('authentication:emailNotValid') || 'Email is not valid' }
        }

        if (loginType === 'username') {
          return { message: t('authentication:usernameNotValid') || 'Username is not valid' }
        }

        return {
          message: isProbablyEmail
            ? t('authentication:emailNotValid') || 'Email is not valid'
            : t('authentication:usernameNotValid') || 'Username is not valid'
        }
      }
    ),
    password: passwordField({ t })
  })

export const createSignupSchema = ({ t, requireUsername = false, requireConfirmPassword = false }: { t: Translate; requireUsername?: boolean; requireConfirmPassword?: boolean }) => {
  const schema = z.object({
    name: z.string({ message: 'Name is required' }).min(1),
    email: emailField({ t }),
    username: usernameField({ t, required: requireUsername }).optional(),
    password: passwordField({ t }),
    confirmPassword: confirmPasswordField({ t, required: requireConfirmPassword }).optional()
  })

  if (!requireConfirmPassword) return schema

  return schema.refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: t('fields:passwordsDoNotMatch') || 'Passwords do not match'
  })
}
