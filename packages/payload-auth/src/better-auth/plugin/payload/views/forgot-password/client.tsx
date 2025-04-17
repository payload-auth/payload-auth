'use client'

import React, { useMemo, useState, useTransition } from 'react'
import { createAuthClient } from 'better-auth/react'
import { Form } from '@/shared/form/ui'
import { EmailField } from '@/shared/form/components/email'
import { FormSubmit, toast, useConfig, useTranslation } from '@payloadcms/ui'
import { FormHeader } from '@/shared/form/ui/header'
import type { FC, FormEvent, ChangeEvent, FocusEvent } from 'react'
import { adminRoutes } from '@/better-auth/plugin/constants'

type ForgotPasswordFormProps = {}

export const ForgotPasswordForm: FC<ForgotPasswordFormProps> = () => {
  const authClient = useMemo(() => createAuthClient(), [])
  const [email, setEmail] = useState<string>('')
  const [emailError, setEmailError] = useState<string | undefined>(undefined)
  const [isPending, startTransition] = useTransition()
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false)
  const { t } = useTranslation()
  const { config } = useConfig()
  const adminRoute = config.routes.admin

  const handleFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setEmailError(undefined)
  }

  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError(t('authentication:emailNotValid') || 'Email is required')
      return false
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setEmailError(t('authentication:emailNotValid') || 'Invalid email')
      return false
    }
    setEmailError(undefined)
    return true
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (e.target.value) {
      validateEmail(e.target.value)
    } else {
      setEmailError(undefined)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const valid = validateEmail(email)
    if (!valid) return
    startTransition(async () => {
      try {
        const { data, error } = await authClient.forgetPassword({
          email,
          redirectTo: `${adminRoute}${adminRoutes.resetPassword}`
        })
        if (error) {
          toast.error(error.message || t('authentication:emailNotValid') || 'Error')
          return
        }
        if (data?.status) {
          setHasSubmitted(true)
          toast.success('Successfully sent reset email.')
        } else {
          toast.error(t('general:error') || 'Server Error')
        }
      } catch (e) {
        toast.error(t('general:error') || 'An unexpected error occurred')
      }
    })
  }

  if (hasSubmitted) {
    return <FormHeader description={t('authentication:checkYourEmailForPasswordReset')} heading={t('authentication:emailSent')} />
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormHeader heading={t('authentication:forgotPassword')} description={t('authentication:forgotPasswordEmailInstructions')} />
      <EmailField
        id="email"
        label={t('general:email')}
        value={email}
        errors={emailError ? [emailError] : undefined}
        onChange={handleFieldChange}
        onBlur={handleBlur}
        required
      />
      <FormSubmit disabled={isPending} size="large">
        {isPending ? t('general:loading') : t('general:submit')}
      </FormSubmit>
    </Form>
  )
}
