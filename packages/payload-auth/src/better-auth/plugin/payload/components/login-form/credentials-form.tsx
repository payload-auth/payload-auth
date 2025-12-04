'use client'

import { adminRoutes } from '@/better-auth/plugin/constants'
import { useAppForm } from '@/shared/form'
import { Form, FormError, FormInputWrap } from '@/shared/form/ui'
import { FormHeader } from '@/shared/form/ui/header'
import { createLoginSchema, isValidEmail } from '@/shared/form/validation'
import { valueOrDefaultString } from '@/shared/utils/value-or-default'
import { useConfig, Link, toast, useTranslation } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import React, { useState } from 'react'
import { useLoginForm } from './context'
import './index.scss'

const baseClass = 'login__form'

export const CredentialsForm: React.FC = () => {
  const { config } = useConfig()
  const { t } = useTranslation()
  const { authClient, loginType, hasMethod, setEmail, redirectUrl, prefill } = useLoginForm()
  const adminRoute = valueOrDefaultString(config?.routes?.admin, '/admin')

  const hasEmailPassword = hasMethod('emailPassword')
  const hasMagicLink = hasMethod('magicLink')
  const showEmailField = hasEmailPassword || hasMagicLink
  const showPasswordField = hasEmailPassword

  const [requireEmailVerification, setRequireEmailVerification] = useState(false)
  const [searchParamError] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('error')
    }
    return null
  })

  const forgotPasswordUrl = formatAdminURL({
    adminRoute,
    path: adminRoutes?.forgotPassword as `/${string}`
  })

  const loginSchema = createLoginSchema({ t, loginType, canLoginWithUsername: loginType !== 'email' })

  const form = useAppForm({
    defaultValues: {
      login: prefill.email ?? prefill.username ?? '',
      password: prefill.password ?? ''
    },
    onSubmit: async ({ value }) => {
      if (!showPasswordField) return

      const { login, password } = value
      const isEmail = isValidEmail(login)
      console.log(value)
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
      } catch {
        toast.error(t('error:unknown') || 'An unexpected error occurred')
      }
    },
    validators: showPasswordField ? { onSubmit: loginSchema } : undefined
  })

  if (!showEmailField) return null

  if (requireEmailVerification) {
    return <FormHeader heading="Please verify your email" description={t('authentication:emailSent')} style={{ textAlign: 'center' }} />
  }

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
      {searchParamError === 'signup_disabled' && <FormError errors={['Sign up is disabled.']} />}
      <Form
        className={baseClass}
        onSubmit={(e) => {
          e.preventDefault()
          if (showPasswordField) {
            void form.handleSubmit()
          }
        }}>
        <FormInputWrap className={baseClass}>
          <form.AppField
            name="login"
            children={(field) => (
              <field.TextField
                type="text"
                className="email"
                autoComplete="email"
                label={getLoginTypeLabel()}
                onValueChange={setEmail}
              />
            )}
          />
          {showPasswordField && (
            <form.AppField
              name="password"
              children={(field) => (
                <field.TextField type="password" className="password" autoComplete="password" label={t('general:password')} />
              )}
            />
          )}
        </FormInputWrap>
        {showPasswordField && (
          <>
            <Link href={forgotPasswordUrl} prefetch={false}>
              {t('authentication:forgotPasswordQuestion')}
            </Link>
            <button type="submit" style={{ display: 'none' }} tabIndex={-1} />
            <form.AppForm children={<form.Submit label={t('authentication:login')} loadingLabel={t('general:loading')} />} />
          </>
        )}
      </Form>
    </div>
  )
}

