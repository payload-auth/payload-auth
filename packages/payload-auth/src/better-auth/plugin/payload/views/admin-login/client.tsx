'use client'

import React, { useMemo, useState } from 'react'
import { z } from 'zod'
import { useAppForm } from '@/shared/form'
import { Form, FormInputWrap } from '@/shared/form/ui'
import { FormHeader } from '@/shared/form/ui/header'
import { createAuthClient } from 'better-auth/client'
import { usernameClient } from 'better-auth/client/plugins'
import { adminRoutes } from '@/better-auth/plugin/constants'
import { formatAdminURL, getLoginOptions } from 'payload/shared'
import { getSafeRedirect } from '@/better-auth/plugin/payload/utils/get-safe-redirect'
import { Link, toast, useConfig, useTranslation } from '@payloadcms/ui'
import AdminSocialProviderButtons from '@/better-auth/plugin/payload/components/admin-social-provider-buttons'
import { emailRegex, usernameRegex } from '@/shared/utils/regex'

import type { SocialProviders } from '@/better-auth/plugin/types'
import type { LoginWithUsernameOptions } from 'payload'

const baseClass = 'login__form'

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
  const { config } = useConfig()
  const { t } = useTranslation()
  const { canLoginWithEmail, canLoginWithUsername } = getLoginOptions(loginWithUsername)
  const usernameSettings = { minLength: 5, maxLength: 128 }
  const redirectUrl = getSafeRedirect(searchParams?.redirect as string, config.routes.admin)
  const forgotPasswordUrl = formatAdminURL({
    adminRoute: config.routes.admin,
    path: adminRoutes?.forgotPassword as `/${string}`
  })
  const authClient = useMemo(() => createAuthClient({ plugins: [usernameClient()] }), [])
  const loginType = useMemo(() => {
    if (canLoginWithEmail && canLoginWithUsername && hasUsernamePlugin) return 'emailOrUsername'
    if (canLoginWithUsername && hasUsernamePlugin) return 'username'
    return 'email'
  }, [canLoginWithEmail, canLoginWithUsername, hasUsernamePlugin])
  const [requireEmailVerification, setRequireEmailVerification] = useState<boolean>(false)

  if (requireEmailVerification) {
    return <FormHeader heading="Please verify your email" description={t('authentication:emailSent')} style={{ textAlign: 'center' }} />
  }

  const validationMap = {
    email: {
      isValid: (val: string) => emailRegex.test(val),
      getErrorMessage: () => t('authentication:emailNotValid') || 'Email is not valid'
    },
    username: {
      isValid: (val: string) =>
        usernameRegex.test(val) && val.length >= usernameSettings.minLength && val.length <= usernameSettings.maxLength,
      getErrorMessage: () => t('authentication:usernameNotValid') || 'Username is not valid'
    },
    emailOrUsername: {
      isValid: (val: string) =>
        val.includes('@')
          ? emailRegex.test(val)
          : usernameRegex.test(val) && val.length >= usernameSettings.minLength && val.length <= usernameSettings.maxLength,
      getErrorMessage: (val: string) => {
        const isProbablyEmail = val.includes('@') || !canLoginWithUsername
        return isProbablyEmail
          ? t('authentication:emailNotValid') || 'Email is not valid'
          : t('authentication:usernameNotValid') || 'Username is not valid'
      }
    }
  }

  const loginSchema = z.object({
    login: z.string().refine(
      (val) => (val ? validationMap[loginType].isValid(val) : false),
      (val) => ({
        message: !val ? t('validation:required') : validationMap[loginType].getErrorMessage(val)
      })
    ),
    password: z.string().min(1, 'Password is required')
  })

  const form = useAppForm({
    defaultValues: {
      login: prefillEmail ?? prefillUsername ?? '',
      password: prefillPassword ?? ''
    },
    onSubmit: async ({ value }) => {
      const { login, password } = value
      const isEmail = emailRegex.test(login)
      try {
        const { data, error } = await (loginType === 'email' || (loginType === 'emailOrUsername' && isEmail)
          ? authClient.signIn.email({ email: login, password, callbackURL: redirectUrl })
          : authClient.signIn.username({ username: login, password }))
        if (error) {
          if (error.code === 'EMAIL_NOT_VERIFIED') {
            setRequireEmailVerification(true)
          }
          if (error.message) {
            toast.error(error.message.charAt(0).toUpperCase() + error.message.slice(1))
          }
        }
        if (data?.token) {
          toast.success(t('general:success'))
          window.location.href = redirectUrl
        }
      } catch (err) {
        toast.error(t('error:unknown') || 'An unexpected error occurred')
      }
    },
    validators: {
      onSubmit: loginSchema
    }
  })

  const getLoginTypeLabel = () => {
    const labels = {
      email: t('general:email') || 'Email',
      username: t('authentication:username') || 'Username',
      emailOrUsername: t('authentication:emailOrUsername') || 'Email or Username'
    }

    return labels[loginType]
  }

  return (
    <div className={`${baseClass}__wrapper`}>
      <Form
        className={baseClass}
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}>
        <FormInputWrap className={baseClass}>
          <form.AppField
            name="login"
            children={(field) => <field.TextField type="text" className="email" autoComplete="email" label={getLoginTypeLabel()} />}
          />
          <form.AppField
            name="password"
            children={(field) => (
              <field.TextField type="password" className="password" autoComplete="password" label={t('general:password')} />
            )}
          />
        </FormInputWrap>
        <Link href={forgotPasswordUrl} prefetch={false}>
          {t('authentication:forgotPasswordQuestion')}
        </Link>
        <form.AppForm children={<form.Submit label={t('authentication:login')} loadingLabel={t('general:loading')} />} />
      </Form>
      {(Object.keys(socialProviders || {}).length > 0 || hasPasskeySupport) && (
        <div style={{ textAlign: 'center', fontSize: '0.875rem', textTransform: 'uppercase', marginTop: '-.5rem', color: 'var(--theme-elevation-450)', marginBottom: '1.5rem' }}>
          <span>Or login with</span>
        </div>
      )}
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
