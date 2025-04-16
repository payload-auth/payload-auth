'use client'

import React from 'react'
import { Form } from '@/shared/form/ui'
import { FormHeader } from '@/shared/form/ui/header'
import { PasswordField } from '@/shared/form/components/password'
import { EmailOrUsernameField } from '@/shared/form/components/email-or-username'
import { createAuthClient } from 'better-auth/client'
import { usernameClient } from 'better-auth/client/plugins'
import { formatAdminURL, getLoginOptions } from 'payload/shared'
import { getSafeRedirect } from '@/better-auth/plugin/payload/utils/get-safe-redirect'
import { FormSubmit, Link, toast, useConfig, useTranslation } from '@payloadcms/ui'
import AdminSocialProviderButtons from '@/better-auth/plugin/payload/components/admin-social-provider-buttons'
import { useCallback, useMemo, useState, useTransition, type ChangeEvent, type FocusEvent, type FormEvent } from 'react'
import type { SocialProviders } from '@/better-auth/plugin/types'
import { adminRoutes } from '@/better-auth/plugin/constants'
import type { LoginWithUsernameOptions } from 'payload'

const baseClass = 'login__form'
const emailRegex = /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i

type FieldState = { value: string; error?: string }
type LoginFormState = {
  [key: string]: { value: string; error?: string }
}

type AdminLoginClientProps = {
  socialProviders: SocialProviders
  hasUsernamePlugin: boolean
  hasPasskeySupport: boolean
  prefillEmail?: string
  prefillPassword?: string
  prefillUsername?: string
  searchParams: { [key: string]: string | string[] | undefined }
  loginWithUsername: false | LoginWithUsernameOptions
}

export const AdminLoginClient: React.FC<AdminLoginClientProps> = ({
  socialProviders,
  hasUsernamePlugin,
  hasPasskeySupport,
  prefillEmail,
  prefillPassword,
  prefillUsername,
  searchParams,
  loginWithUsername
}) => {
  const authClient = useMemo(() => createAuthClient({ plugins: [usernameClient()] }), [])

  const [login, setLogin] = useState(prefillEmail ?? prefillUsername ?? '')
  const [loginError, setLoginError] = useState<string | undefined>(undefined)
  const [password, setPassword] = useState(prefillPassword ?? '')
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined)
  const [isPending, startTransition] = useTransition()

  const [requireEmailVerification, setRequireEmailVerification] = useState<boolean>(false)
  const { t } = useTranslation()
  const { config } = useConfig()

  const adminRoute = config.routes.admin

  const { canLoginWithEmail, canLoginWithUsername } = getLoginOptions(loginWithUsername)
  const redirectUrl = getSafeRedirect(searchParams?.redirect as string, adminRoute)

  let loginType: 'email' | 'username' | 'emailOrUsername' = 'email'
  if (canLoginWithEmail && canLoginWithUsername && hasUsernamePlugin) {
    loginType = 'emailOrUsername'
  } else if (canLoginWithUsername && hasUsernamePlugin) {
    loginType = 'username'
  }

  // Validation helpers
  const validateLogin = (value: string): boolean => {
    if (!value) {
      setLoginError(t('authentication:emailOrUsername') || 'Email or username is required')
      return false
    }
    if (loginType === 'email' && !emailRegex.test(value)) {
      setLoginError(t('authentication:emailNotValid') || 'Invalid email')
      return false
    }
    setLoginError(undefined)
    return true
  }

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError(t('general:password') || 'Password is required')
      return false
    }
    setPasswordError(undefined)
    return true
  }

  // Handlers
  const handleLoginChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLogin(e.target.value)
    setLoginError(undefined)
  }, [])

  const handlePasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setPasswordError(undefined)
  }, [])

  const handleLoginBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setLoginError(undefined)
      return
    }
    validateLogin(e.target.value)
  }, [])

  const handlePasswordBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setPasswordError(undefined)
      return
    }
    validatePassword(e.target.value)
  }, [])

  const handleSignInError = (error: any) => {
    if (error?.code === 'EMAIL_NOT_VERIFIED') {
      setRequireEmailVerification(true)
      return true
    }
    if (error?.message) {
      toast.error(error.message.charAt(0).toUpperCase() + error.message.slice(1))
      return false
    }
    return false
  }

  const handleSignInSuccess = (data: any) => {
    if (data && data.token) {
      toast.success(t('authentication:loggedIn'))
      window.location.href = redirectUrl
      return true
    }
    return false
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: redirectUrl
    })
    if (error && handleSignInError(error)) return
    if (handleSignInSuccess(data)) return
  }

  const signInWithUsername = async (username: string, password: string) => {
    const { data, error } = await authClient.signIn.username({
      username,
      password
    })
    if (error && handleSignInError(error)) return
    if (handleSignInSuccess(data)) return
  }

  const signInWithEmailOrUsername = async (login: string, password: string) => {
    if (emailRegex.test(login)) {
      await signInWithEmail(login, password)
      return
    }
    await signInWithUsername(login, password)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    let valid = validatePassword(password)
    valid = validateLogin(login) && valid
    if (!valid) return
    startTransition(async () => {
      try {
        if (loginType === 'emailOrUsername') {
          await signInWithEmailOrUsername(login, password)
          return
        }
        if (loginType === 'username') {
          await signInWithUsername(login, password)
          return
        }
        await signInWithEmail(login, password)
      } catch (e) {
        return
      }
    })
  }

  if (requireEmailVerification) {
    return (
      <FormHeader heading={'Verify your email'} description={'Check your email for a verification link.'} style={{ textAlign: 'center' }} />
    )
  }

  return (
    <div className={`${baseClass}__wrapper`}>
      <Form className={baseClass} onSubmit={handleSubmit}>
        <div className={`${baseClass}__inputWrap`}>
          <EmailOrUsernameField
            id={loginType}
            label={
              loginType === 'email'
                ? t('general:email')
                : loginType === 'username'
                  ? t('authentication:username') || 'Username'
                  : t('authentication:emailOrUsername') || 'Email or Username'
            }
            name={loginType}
            value={login}
            error={loginError}
            onChange={handleLoginChange}
            onBlur={handleLoginBlur}
            required
          />
          <PasswordField
            id="password"
            label={t('general:password')}
            value={password}
            error={passwordError}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            required
          />
        </div>
        <Link
          href={formatAdminURL({
            adminRoute: adminRoute,
            path: adminRoutes?.forgotPassword as `/${string}`
          })}
          prefetch={false}>
          {t('authentication:forgotPasswordQuestion')}
        </Link>
        <FormSubmit disabled={isPending} size="large">
          {isPending ? t('general:loading') : t('authentication:login')}
        </FormSubmit>
      </Form>
      <AdminSocialProviderButtons
        allowSignup={false}
        socialProviders={socialProviders}
        setLoading={() => {}}
        hasPasskeySupport={hasPasskeySupport}
        redirectUrl={redirectUrl}
      />
    </div>
  )
}
