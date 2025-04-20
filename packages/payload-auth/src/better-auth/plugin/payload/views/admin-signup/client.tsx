'use client'

import { useConfig, toast, useTranslation } from '@payloadcms/ui'
import React, { useState } from 'react'
import type { LoginMethod } from '../../../types'
import { AdminSocialProviderButtons } from '../../components/social-provider-buttons'
import { getSafeRedirect } from '../../utils/get-safe-redirect'
import { adminEndpoints } from '@/better-auth/plugin/constants'
import type { LoginWithUsernameOptions } from 'payload'
import { useAppForm } from '@/shared/form'
import { Form, FormInputWrap } from '@/shared/form/ui'
import { FormHeader } from '@/shared/form/ui/header'
import { createSignupSchema } from '@/shared/form/validation'
import { usernameClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { tryCatch } from '@/shared/utils/try-catch'

type AdminSignupClientProps = {
  adminInviteToken: string
  userSlug: string
  loginMethods: LoginMethod[]
  searchParams: { [key: string]: string | string[] | undefined }
  loginWithUsername: false | LoginWithUsernameOptions
}

const baseClass = 'admin-signup'

type SignupFormProps = {
  adminInviteToken: string
  searchParams: { [key: string]: string | string[] | undefined }
  loginWithUsername: false | LoginWithUsernameOptions
  requireEmailVerification: boolean
  setRequireEmailVerification: React.Dispatch<React.SetStateAction<boolean>>
}

const SignupForm: React.FC<SignupFormProps> = ({
  searchParams,
  loginWithUsername,
  requireEmailVerification,
  setRequireEmailVerification,
  adminInviteToken
}) => {
  const {
    config: {
      admin: { user: userSlug },
      routes: { admin: adminRoute, api: apiRoute },
      serverURL
    }
  } = useConfig()
  const { t } = useTranslation()
  const redirectUrl = getSafeRedirect(searchParams?.redirect as string, adminRoute)

  const requireUsername = Boolean(loginWithUsername && typeof loginWithUsername === 'object' && loginWithUsername.requireUsername)

  const signupSchema = createSignupSchema({ t, requireUsername })

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      ...(loginWithUsername ? { username: '' } : {})
    },
    onSubmit: async ({ value }) => {
      const { email, username, password } = value
      const { data, error } = await tryCatch(
        fetch(`${serverURL}${apiRoute}/${userSlug}${adminEndpoints.signup}?token=${adminInviteToken}&redirect=${redirectUrl}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password })
        }).then((res) => res.json())
      )

      if (error) {
        toast.error(error.message)
        return;
      }

      if (data.requireEmailVerification) {
        setRequireEmailVerification(true)
        toast.success(data.message)
        return;
      }
      toast.success(data.message)
      window.location.href = redirectUrl
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
                required={requireUsername}
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
    </Form>
  )
}

export const AdminSignupClient: React.FC<AdminSignupClientProps> = ({
  adminInviteToken,
  userSlug,
  searchParams,
  loginMethods,
  loginWithUsername
}) => {
  const {
    config: {
      routes: { admin: adminRoute, api: apiRoute },
      serverURL
    }
  } = useConfig()
  const [requireEmailVerification, setRequireEmailVerification] = useState<boolean>(false)
  const redirectUrl = getSafeRedirect(searchParams?.redirect as string, adminRoute)
  const setAdminRoleCallbackURL = `${serverURL}${apiRoute}/${userSlug}${adminEndpoints.setAdminRole}?token=${adminInviteToken}&redirect=${redirectUrl}`

  return (
    <>
      {loginMethods.includes('emailPassword') && (
        <SignupForm
          adminInviteToken={adminInviteToken}
          searchParams={searchParams}
          loginWithUsername={loginWithUsername}
          requireEmailVerification={requireEmailVerification}
          setRequireEmailVerification={setRequireEmailVerification}
        />
      )}
      {!requireEmailVerification && (
        <AdminSocialProviderButtons
          isSignup={true}
          loginMethods={loginMethods}
          setLoading={() => {}}
          redirectUrl={redirectUrl}
          newUserCallbackURL={setAdminRoleCallbackURL}
        />
      )}
    </>
  )
}
