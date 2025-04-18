'use client'

import React, { useState } from 'react'
import { z } from 'zod'
import { useConfig, useTranslation } from '@payloadcms/ui'
import AdminSocialProviderButtons from '../../components/admin-social-provider-buttons'
import { SocialProviders } from '../../../types'
import { getSafeRedirect } from '../../utils/get-safe-redirect'
import { toast } from '@payloadcms/ui'
import { adminEndpoints } from '@/better-auth/plugin/constants'
import { useAppForm } from '@/shared/form'
import { emailRegex, usernameRegex } from '@/shared/utils/regex'
import { FormHeader } from '@/shared/form/ui/header'
import { Form, FormInputWrap } from '@/shared/form/ui'

import type { LoginWithUsernameOptions } from 'payload'
import { tryCatch } from '@/shared/utils/try-catch'

const baseClass = 'admin-signup'

type AdminSignupClientProps = {
  token: string
  role: string
  userSlug: string
  socialProviders: SocialProviders
  searchParams: { [key: string]: string | string[] | undefined }
  loginWithUsername: false | LoginWithUsernameOptions
}

export const AdminSignupClient: React.FC<AdminSignupClientProps> = ({
  token,
  userSlug,
  role,
  searchParams,
  socialProviders,
  loginWithUsername
}) => {
  const {
    config: {
      routes: { admin: adminRoute, api: apiRoute },
      serverURL
    }
  } = useConfig()
  const { t } = useTranslation()
  const redirectUrl = getSafeRedirect(searchParams?.redirect as string, adminRoute)
  const newUserCallbackURL = `${serverURL}${apiRoute}/${userSlug}${adminEndpoints.setAdminRole}?role=${role}&token=${token}&redirect=${redirectUrl}`
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
      confirmPassword: z.string().min(1, t('validation:required') || 'Confirm password is required')
    })
    .refine(
      (data) => {
        // Only validate matching passwords if both fields have values
        if (data.password && data.confirmPassword) {
          return data.password === data.confirmPassword
        }
        // If one or both fields are empty, validation will be handled by the min(1) validators
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
      confirmPassword: ''
    },
    onSubmit: async ({ value }) => {
      const { email, username, password } = value
      const { data, error } = await tryCatch(
        fetch(`${serverURL}${apiRoute}/${userSlug}${adminEndpoints.signup}?token=${token}&redirect=${redirectUrl}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password })
        })
      )

      if (error) {
        toast.error(error.message)
      }

      if (data) {
        data.json().then((json: any) => {
          if (json.requireEmailVerification) {
            setRequireEmailVerification(true)
            toast.message(json.message)
          } else {
            toast.success(json.message)
            window.location.href = redirectUrl
          }
        })
      }
    },
    validators: {
      onSubmit: signupSchema
    }
  })

  if (requireEmailVerification) {
    return <FormHeader heading="Please verify your email" description={t('authentication:emailSent')} style={{ textAlign: 'center' }} />
  }

  return (
    <Form
      className={baseClass}
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}>
      <FormHeader heading={t('general:welcome')} style={{ textAlign: 'center' }} />
      <FormInputWrap className={baseClass}>
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
        newUserCallbackURL={newUserCallbackURL}
      />
    </Form>
  )
}
