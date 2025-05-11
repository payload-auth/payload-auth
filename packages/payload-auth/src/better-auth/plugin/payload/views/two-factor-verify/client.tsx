'use client'

import { useMemo } from 'react'
import { createAuthClient } from 'better-auth/react'
import { twoFactorClient } from 'better-auth/client/plugins'
import { useAppForm } from '@/shared/form'
import { Form, FormInputWrap } from '@/shared/form/ui'
import { FormHeader } from '@/shared/form/ui/header'
import { toast, useTranslation } from '@payloadcms/ui'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

export const TwoFactorVerifyForm = ({
  redirect,
  twoFactorDigits = 6,
  baseURL,
  basePath
}: {
  redirect: string
  twoFactorDigits?: number
  baseURL?: string
  basePath?: string
}) => {
  const { t } = useTranslation()
  const router = useRouter()
  const authClient = useMemo(() => createAuthClient({ baseURL, basePath, plugins: [twoFactorClient()] }), [])

  const otpSchema = z.object({
    code: z
      .string()
      .length(twoFactorDigits, `Code must be ${twoFactorDigits} digits`)
      .refine((val) => /^\d{6}$/.test(val), 'Code must be numeric')
  })

  const form = useAppForm({
    defaultValues: { code: '' },
    onSubmit: async ({ value }) => {
      const { code } = value
      const { error } = await authClient.twoFactor.verifyTotp({ code })
      if (error) {
        toast.error(error.message)
        return
      }
      router.push(redirect)
      toast.success('Two-factor verified!')
    },
    validators: { onSubmit: otpSchema }
  })

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}>
      <FormHeader style={{ textAlign: 'center' }} heading={'Verify Two-Factor'} />
      <FormInputWrap>
        <form.AppField
          name="code"
          children={(field) => (
            <field.TextField type="text" className="text otp" label={'6-digit Code'} required autoComplete="one-time-password" />
          )}
        />
      </FormInputWrap>
      <form.AppForm
        children={<form.Submit label={t('authentication:verify') || 'Verify'} loadingLabel={t('general:loading') || 'Loading'} />}
      />
    </Form>
  )
}
