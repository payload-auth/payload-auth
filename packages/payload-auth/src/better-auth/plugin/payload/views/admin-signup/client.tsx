'use client'

import { useConfig, toast, useTranslation } from '@payloadcms/ui'
import React, { useState } from 'react'
import type { LoginMethod } from '@/better-auth/plugin/types'
import { AdminSocialProviderButtons } from '@/better-auth/plugin/payload/components/social-provider-buttons'
import { getSafeRedirect } from '@/better-auth/plugin/payload/utils/get-safe-redirect'
import { adminEndpoints } from '@/better-auth/plugin/constants'
import type { LoginWithUsernameOptions } from 'payload'
import { useAppForm } from '@/shared/form'
import { Form, FormInputWrap } from '@/shared/form/ui'
import { FormHeader } from '@/shared/form/ui/header'
import { createSignupSchema } from '@/shared/form/validation'
import { tryCatch } from '@/shared/utils/try-catch'
import { createAuthClient } from 'better-auth/react'
import { usernameClient } from 'better-auth/client/plugins'

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
  const authClient = createAuthClient({ plugins: [usernameClient()] })

  const requireUsername = Boolean(loginWithUsername && typeof loginWithUsername === 'object' && loginWithUsername.requireUsername)

  const requireConfirmPassword = true
  const signupSchema = createSignupSchema({ t, requireUsername, requireConfirmPassword })

  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      ...(requireConfirmPassword ? { confirmPassword: '' } : {}),
      ...(loginWithUsername ? { username: '' } : {})
    },
    onSubmit: async ({ value }) => {
      const { name, email, username, password } = value
      
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: redirectUrl,
        ...(loginWithUsername && username ? { username } : {}),
        fetchOptions: {
          query: {
            adminInviteToken
          }
        }
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
          name="name"
          children={(field) => <field.TextField type="name" className="text" autoComplete="name" label="Name" required />}
        />
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
          adminInviteToken={adminInviteToken}
          setLoading={() => {}}
          redirectUrl={redirectUrl}
          newUserCallbackURL={setAdminRoleCallbackURL}
        />
      )}
    </>
  )
}
