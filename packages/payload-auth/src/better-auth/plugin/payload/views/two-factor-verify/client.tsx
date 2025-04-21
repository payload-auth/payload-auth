'use client'

import { useMemo, useState } from 'react'
import { createAuthClient } from 'better-auth/react'
import { twoFactorClient } from 'better-auth/client/plugins'
import { useAppForm } from '@/shared/form'
import { Form, FormInputWrap } from '@/shared/form/ui'
import { FormHeader } from '@/shared/form/ui/header'
import { toast, useTranslation } from '@payloadcms/ui'
import { z } from 'zod'
import { getSafeRedirect } from '../../utils/get-safe-redirect'
import { useRouter, useSearchParams } from 'next/navigation'

export const TwoFactorVerifyForm = ({ redirect }: { redirect: string }) => {
  const router = useRouter()
  const authClient = useMemo(() => createAuthClient({ plugins: [twoFactorClient()] }), [])

  const otpSchema = z.object({
    code: z
      .string()
      .length(6, 'Code must be 6 digits')
      .refine((val) => /^\d{6}$/.test(val), 'Code must be numeric')
  })

  const form = useAppForm({
    defaultValues: { code: '' },
    onSubmit: async ({ value }) => {
      const { code } = value
      const { data, error } = await authClient.twoFactor.verifyTotp({ code })
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
      <form.AppForm children={<form.Submit label={'Verify'} loadingLabel={'Loading'} />} />
    </Form>
  )
}
