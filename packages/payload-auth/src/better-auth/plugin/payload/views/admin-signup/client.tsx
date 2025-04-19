'use client'

import React, { useState } from 'react'
import { z } from 'zod'
import { useConfig, useTranslation } from '@payloadcms/ui'
import AdminSocialProviderButtons from '../../components/admin-social-provider-buttons'
import { SocialProviders } from '../../../types'
import { getSafeRedirect } from '../../utils/get-safe-redirect'
import { toast } from '@payloadcms/ui'
import { useAppForm } from '@/shared/form'
import { emailRegex, usernameRegex } from '@/shared/utils/regex'
import { FormHeader } from '@/shared/form/ui/header'
import { Form, FormInputWrap } from '@/shared/form/ui'

import type { LoginWithUsernameOptions } from 'payload'
import { createAuthClient } from 'better-auth/react'
import { usernameClient } from 'better-auth/client/plugins'

const baseClass = 'admin-signup'

type AdminSignupClientProps = {
  adminInviteToken: string
  socialProviders: SocialProviders
  searchParams: { [key: string]: string | string[] | undefined }
  loginWithUsername: false | LoginWithUsernameOptions
}

export const AdminSignupClient: React.FC<AdminSignupClientProps> = ({
  adminInviteToken,
  searchParams,
  socialProviders,
  loginWithUsername
}) => {
  const {
    config: {
      routes: { admin: adminRoute }
    }
  } = useConfig()
  const { t } = useTranslation()
  const authClient = createAuthClient({ plugins: [usernameClient()] })
  const redirectUrl = getSafeRedirect(searchParams?.redirect as string, adminRoute)
  const [requireEmailVerification, setRequireEmailVerification] = useState<boolean>(false)

  const validationMap = {
    email: {
      isValid: (val: string) => emailRegex.test(val),
      errorMessage: t('authentication:emailNotValid') || 'Invalid email'
    },
    username: {
      isValid: (val: string) => usernameRegex.test(val),
      errorMessage: t('authentication:usernameNotValid') || 'Username invalid'
    }
  }

  const signupSchema = z
    .object({
      email: z.string().refine(
        (val) => validationMap.email.isValid(val),
        (val) => ({ message: val ? validationMap.email.errorMessage : t('validation:required') })
      ),
      username: loginWithUsername
        ? z.string().refine(
            (val) => !val || validationMap.username.isValid(val),
            (val) => ({ message: val ? validationMap.username.errorMessage : t('validation:required') })
          )
        : z.string().optional(),
      password: z.string().min(1, t('validation:required') || 'Password is required'),
      confirmPassword: z.string().min(1, t('validation:required') || 'Confirm password is required'),
      adminInviteToken: z.string().nullable()
    })
    .refine(
      (data) => {
        if (data.password && data.confirmPassword) {
          return data.password === data.confirmPassword
        }
        return true
      },
      {
        message: t('fields:passwordsDoNotMatch') || 'Passwords do not match',
        path: ['confirmPassword']
      }
    )

  const form = useAppForm({
    defaultValues: {
      email: '',
      ...(loginWithUsername ? { username: '' } : {}),
      password: '',
      confirmPassword: '',
      adminInviteToken: adminInviteToken || null
    },
    onSubmit: async ({ value }) => {
      const { email, username, password, adminInviteToken } = value
      const { data, error } = await authClient.signUp.email({
        name: '',
        email,
        password,
        callbackURL: redirectUrl,
        ...(loginWithUsername && username ? { username } : {}),
        ...(adminInviteToken ? { adminInviteToken } : {})
      })

      if((error && error.code === 'EMAIL_NOT_VERIFIED') || (!error && !data.token && !data?.user.emailVerified)) {
        setRequireEmailVerification(true)
        toast.success('Check your email for a verification link')
        return
      }

      if (error) {
        toast.error(error.message)
        return
      }
    },
    validators: {
      onSubmit: signupSchema
    }
  })

  if (requireEmailVerification) {
    return (
      <FormHeader
        heading="Please verify your email"
        description={'Check your email for a verification link.'}
        style={{ textAlign: 'center' }}
      />
    )
  }

  return (
    <Form
      className={baseClass}
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}>
      <FormInputWrap className="login__form">
        <form.AppField
          name="email"
          children={(field) => <field.TextField type="email" className="email" autoComplete="email" label={t('general:email')} required />}
        />
        {loginWithUsername && (
          <form.AppField
            name="username"
            children={(field) => (
              <field.TextField
                type="name"
                className="text"
                autoComplete="username"
                label={t('authentication:username')}
                required={loginWithUsername.requireUsername ?? false}
              />
            )}
          />
        )}
        <form.AppField
          name="password"
          children={(field) => <field.TextField type="password" className="password" label={t('authentication:newPassword')} required />}
        />
        <form.AppField
          name="confirmPassword"
          children={(field) => (
            <field.TextField type="password" className="password" label={t('authentication:confirmPassword')} required />
          )}
        />
        <form.AppField name="adminInviteToken" children={(field) => <field.HiddenField />} />
      </FormInputWrap>
      <form.AppForm children={<form.Submit label={t('general:create')} loadingLabel={t('general:loading')} />} />
      {Object.keys(socialProviders || {}).length > 0 && (
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            marginTop: '-.5rem',
            color: 'var(--theme-elevation-450)',
            marginBottom: '1.5rem'
          }}>
          <span>Or sign up with</span>
        </div>
      )}
      <AdminSocialProviderButtons
        allowSignup={true}
        socialProviders={socialProviders}
        setLoading={() => {}}
        redirectUrl={redirectUrl}
        adminInviteToken={adminInviteToken}
      />
    </Form>
  )
}
