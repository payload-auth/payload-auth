'use client'

import { AdminSocialProviderButtons } from '@/better-auth/plugin/payload/components/social-provider-buttons'
import { getSafeRedirect } from '@/better-auth/plugin/payload/utils/get-safe-redirect'
import { useConfig, Link, toast, useTranslation } from '@payloadcms/ui'
import React, { useMemo, useState } from 'react'
import type { LoginMethod } from '@/better-auth/plugin/types'
import type { LoginWithUsernameOptions } from 'payload'
import { adminRoutes } from '@/better-auth/plugin/constants'
import { useAppForm } from '@/shared/form'
import { Form, FormError, FormInputWrap } from '@/shared/form/ui'
import { FormHeader } from '@/shared/form/ui/header'
import { createLoginSchema, isValidEmail } from '@/shared/form/validation'
import { createAuthClient } from 'better-auth/client'
import { usernameClient, twoFactorClient } from 'better-auth/client/plugins'
import { formatAdminURL, getLoginOptions } from 'payload/shared'
import { useRouter } from 'next/navigation'

type AdminLoginClientProps = {
  loginMethods: LoginMethod[]
  hasUsernamePlugin: boolean
  prefillEmail?: string
  prefillPassword?: string
  prefillUsername?: string
  searchParams: { [key: string]: string | string[] | undefined }
  loginWithUsername: false | LoginWithUsernameOptions
}

const baseClass = 'login__form'

const LoginForm: React.FC<{
  hasUsernamePlugin: boolean
  prefillEmail?: string
  prefillPassword?: string
  prefillUsername?: string
  searchParams: { [key: string]: string | string[] | undefined }
  loginWithUsername: false | LoginWithUsernameOptions
}> = ({
  hasUsernamePlugin,
  prefillEmail,
  prefillPassword,
  prefillUsername,
  searchParams,
  loginWithUsername
}) => {
  const { config } = useConfig()
  const router = useRouter()
  const adminRoute = config?.routes?.admin || '/admin'
  const { t } = useTranslation()
  const { canLoginWithEmail, canLoginWithUsername } = getLoginOptions(loginWithUsername)
  const searchParamError = searchParams?.error
  const redirectUrl = getSafeRedirect(searchParams?.redirect as string, adminRoute)
  const forgotPasswordUrl = formatAdminURL({
    adminRoute: adminRoute,
    path: adminRoutes?.forgotPassword as `/${string}`
  })
  const authClient = useMemo(() =>
    createAuthClient({
      plugins: [
        usernameClient(),
        twoFactorClient({
          onTwoFactorRedirect() {
            console.log('redirectUrl', adminRoute, `${adminRoute}/two-factor-verify?redirect=${redirectUrl}`)
            router.push(`${adminRoute}/two-factor-verify?redirect=${redirectUrl}`)
          }
        })
      ]
    }),
    []
  )
  const loginType = useMemo(() => {
    if (canLoginWithEmail && canLoginWithUsername && hasUsernamePlugin) return 'emailOrUsername'
    if (canLoginWithUsername && hasUsernamePlugin) return 'username'
    return 'email'
  }, [canLoginWithEmail, canLoginWithUsername, hasUsernamePlugin])
  const [requireEmailVerification, setRequireEmailVerification] = useState<boolean>(false)

  if (requireEmailVerification) {
    return <FormHeader heading="Please verify your email" description={t('authentication:emailSent')} style={{ textAlign: 'center' }} />
  }

  const loginSchema = createLoginSchema({ t, loginType, canLoginWithUsername })

  const form = useAppForm({
    defaultValues: {
      login: prefillEmail ?? prefillUsername ?? '',
      password: prefillPassword ?? ''
    },
    onSubmit: async ({ value }) => {
      const { login, password } = value
      const isEmail = isValidEmail(login)
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
      {searchParamError && searchParamError === 'signup_disabled' && <FormError errors={['Sign up is disabled.']} />}
      <Form
        className={baseClass}
        onSubmit={e => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <FormInputWrap className={baseClass}>
          <form.AppField
            name="login"
            children={field => <field.TextField type="text" className="email" autoComplete="email" label={getLoginTypeLabel()} />}
          />
          <form.AppField
            name="password"
            children={field => (
              <field.TextField type="password" className="password" autoComplete="password" label={t('general:password')} />
            )}
          />
        </FormInputWrap>
        <Link href={forgotPasswordUrl} prefetch={false}>
          {t('authentication:forgotPasswordQuestion')}
        </Link>
        <form.AppForm children={<form.Submit label={t('authentication:login')} loadingLabel={t('general:loading')} />} />
      </Form>
    </div>
  )
}

export const AdminLoginClient: React.FC<AdminLoginClientProps> = ({
  loginMethods,
  hasUsernamePlugin,
  prefillEmail,
  prefillPassword,
  prefillUsername,
  searchParams,
  loginWithUsername
}) => {
  return (
    <>
      {loginMethods.includes('emailPassword') && (
        <LoginForm
          hasUsernamePlugin={hasUsernamePlugin}
          prefillEmail={prefillEmail}
          prefillPassword={prefillPassword}
          prefillUsername={prefillUsername}
          searchParams={searchParams}
          loginWithUsername={loginWithUsername}
        />
      )}
      <AdminSocialProviderButtons
        isSignup={false}
        loginMethods={loginMethods}
        setLoading={() => {}}
        redirectUrl={getSafeRedirect(searchParams?.redirect as string, useConfig().config.routes.admin)}
      />
    </>
  )
}
