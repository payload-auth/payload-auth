'use client'

import { createAuthClient } from 'better-auth/react'
import { useMemo, useState } from 'react'
import { adminRoutes } from '@/better-auth/plugin/constants'
import { useAppForm } from '@/shared/form'
import { Form, FormInputWrap } from '@/shared/form/ui'
import { FormHeader } from '@/shared/form/ui/header'
import { emailRegex } from '@/shared/utils/regex'
import { toast, useConfig, useTranslation } from '@payloadcms/ui'
import type { FC } from 'react'
import { z } from 'zod'

type ForgotPasswordFormProps = {
  baseURL?: string
  basePath?: string
}

export const ForgotPasswordForm: FC<ForgotPasswordFormProps> = ({ baseURL, basePath }) => {
  const { t } = useTranslation()
  const { config } = useConfig()
  const adminRoute = config.routes.admin
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false)
  const authClient = useMemo(() => createAuthClient({ baseURL, basePath }), [])

  const forgotSchema = z.object({
    email: z.string().refine(
      (val) => emailRegex.test(val),
      (val) => ({ message: val ? t('authentication:emailNotValid') || 'Invalid email' : t('validation:required') })
    )
  })

  const form = useAppForm({
    defaultValues: {
      email: ''
    },
    onSubmit: async ({ value }) => {
      const { email } = value
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
    },
    validators: {
      onSubmit: forgotSchema
    }
  })

  if (hasSubmitted) {
    return <FormHeader description={t('authentication:checkYourEmailForPasswordReset')} heading={t('authentication:emailSent')} />
  }

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}>
      <FormHeader heading={t('authentication:forgotPassword')} description={t('authentication:forgotPasswordEmailInstructions')} />
      <FormInputWrap>
        <form.AppField
          name="email"
          children={(field) => <field.TextField type="text" className="email" autoComplete="email" label={t('general:email')} />}
        />
      </FormInputWrap>
      <form.AppForm children={<form.Submit label={t('general:submit')} loadingLabel={t('general:loading')} />} />
    </Form>
  )
}
