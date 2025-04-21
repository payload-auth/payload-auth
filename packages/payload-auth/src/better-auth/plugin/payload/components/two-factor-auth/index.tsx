'use client'

import './index.scss'

import React, { useMemo, useState } from 'react'
import { XIcon, Copy } from 'lucide-react'
import { Button, Modal, toast, useModal, useTranslation, useFormFields, useField } from '@payloadcms/ui'
import { createAuthClient } from 'better-auth/react'
import { twoFactorClient } from 'better-auth/client/plugins'
import { Form, FormInputWrap } from '@/shared/form/ui'
import { z } from 'zod'
import { passwordField } from '@/shared/form/validation'
import { QRCodeSVG } from 'qrcode.react'
import { useAppForm } from '@/shared/form'

const baseClass = 'two-factor-auth-modal'

export function TwoFactorAuth() {
  const [totpURI, setTotpURI] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [formState, setFormState] = useState<'enable' | 'verify' | 'backupCodes' | 'disable'>('enable')
  const { openModal, closeModal } = useModal()
  const { t } = useTranslation()
  const twoFactorEnabledField = useFormFields(([fields]) => fields.twoFactorEnabled)
  const twoFactorEnabled = Boolean(twoFactorEnabledField?.value)
  const { setValue: setTwoFactorEnabled } = useField({ path: 'twoFactorEnabled' })

  const authClient = useMemo(() => createAuthClient({ plugins: [twoFactorClient()] }), [])

  const copyURI = async () => {
    if (!totpURI) return
    try {
      await navigator.clipboard.writeText(totpURI)
      toast.success('Copied')
    } catch {
      toast.error('Failed to copy')
    }
  }

  // Form Schemas
  const passwordSchema = z.object({
    password: passwordField({ t })
  })

  const otpSchema = z.object({
    otp: z
      .string()
      .length(6, 'Code must be 6 digits')
      .refine((val) => /^\d{6}$/.test(val), 'Code must be numeric')
  })

  const EnableForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const form = useAppForm({
      defaultValues: { password: '' },
      onSubmit: async ({ value }: { value: { password: string } }) => {
        setIsLoading(true)
        const { data, error } = await authClient.twoFactor.enable({ password: value.password })
        setIsLoading(false)
        if (error) {
          toast.error(error.message)
          return
        }
        setTotpURI(data.totpURI)
        if (data && 'backupCodes' in data && data.backupCodes) {
          setBackupCodes(Array.isArray(data.backupCodes) ? data.backupCodes : String(data.backupCodes).split(/\s+/).filter(Boolean))
        } else {
          setBackupCodes(null)
        }
        setFormState('verify')
      },
      validators: { onSubmit: passwordSchema }
    })

    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="two-factor-enable-form">
        <FormInputWrap className="two-factor-enable-form__inputWrap">
          <form.AppField
            name="password"
            children={(field: any) => <field.TextField type="password" className="password" label="Password" required />}
          />
        </FormInputWrap>
        <form.AppForm children={<form.Submit label="Enable" loadingLabel="Enabling" />} />
      </Form>
    )
  }

  const VerifyForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const form = useAppForm({
      defaultValues: { otp: '' },
      onSubmit: async ({ value }: { value: { otp: string } }) => {
        setIsLoading(true)
        const { data, error } = await authClient.twoFactor.verifyTotp({ code: value.otp })
        setIsLoading(false)
        if (error) {
          toast.error(error.message)
          return
        }
        if (data && 'backupCodes' in data && data.backupCodes) {
          setBackupCodes(Array.isArray(data.backupCodes) ? data.backupCodes : String(data.backupCodes).split(/\s+/).filter(Boolean))
        }
        toast.success('Two‑factor verified & enabled')
        setTwoFactorEnabled(true)
        setFormState('backupCodes')
      },
      validators: { onSubmit: otpSchema }
    })

    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="two-factor-verify-form">
        <FormInputWrap className="tf__inputWrap">
          <form.AppField
            name="otp"
            children={(field: any) => <field.TextField type="text" className="text otp" label="6‑digit Code" required />}
          />
        </FormInputWrap>
        <form.AppForm children={<form.Submit label="Verify" loadingLabel="Verifying" />} />
      </Form>
    )
  }

  const DisableForm = () => {
    const form = useAppForm({
      defaultValues: { password: '' },
      onSubmit: async ({ value }: { value: { password: string } }) => {
        await authClient.twoFactor.disable(
          { password: value.password },
          {
            onSuccess() {
              toast.success('Two‑factor disabled')
              setTwoFactorEnabled(false)
              closeModal('two-factor-auth-modal')
              return undefined
            },
            onError(ctx: any) {
              toast.error(ctx.error.message)
            }
          }
        )
      },
      validators: { onSubmit: passwordSchema }
    })

    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="two-factor-disable-form mt-4">
        <FormInputWrap className="two-factor-disable-form__inputWrap">
          <form.AppField
            name="password"
            children={(field: any) => <field.TextField type="password" className="password" label="Password" required />}
          />
        </FormInputWrap>
        <form.AppForm children={<form.Submit label="Disable Two‑Factor" loadingLabel="Disabling" />} />
      </Form>
    )
  }

  return (
    <div className="two-factor-auth-field">
      {twoFactorEnabled ? (
        <Button
          onClick={() => {
            setFormState('disable')
            openModal('two-factor-auth-modal')
          }}
          size="medium"
          buttonStyle="pill">
          Manage Two‑Factor
        </Button>
      ) : (
        <Button
          onClick={() => {
            setFormState('enable')
            openModal('two-factor-auth-modal')
          }}
          size="medium"
          buttonStyle="pill">
          Enable Two‑Factor
        </Button>
      )}
      <Modal slug="two-factor-auth-modal" className={baseClass} closeOnBlur>
        <div className={`${baseClass}__wrapper`}>
          <Button
            onClick={() => closeModal('two-factor-auth-modal')}
            buttonStyle="icon-label"
            size="small"
            className={`${baseClass}__close-button`}>
            <XIcon size={24} />
          </Button>

          <div className={`${baseClass}__content`} style={{ maxWidth: '38rem' }}>
            {formState === 'enable' && (
              <>
                <h2>Enable Two‑Factor</h2>
                <EnableForm />
              </>
            )}
            {formState === 'verify' && (
              <>
                <h2>Verify Two‑Factor</h2>
                <div className="two-factor-auth-modal__verify-block">
                  <p>Scan the QR code with your authenticator app or copy the URI.</p>
                  <div className="two-factor-auth-modal__qrcode">
                    <QRCodeSVG value={totpURI} size={200} />
                  </div>
                  <Button size="small" buttonStyle="transparent" onClick={copyURI} className="two-factor-auth-modal__copy-btn">
                    <Copy size={18} className="two-factor-auth-modal__copy-icon" /> Copy URI
                  </Button>
                  <VerifyForm />
                </div>
              </>
            )}
            {formState === 'backupCodes' && backupCodes && (
              <>
                <h2>Backup Codes</h2>
                <div className="two-factor-auth-modal__backup-codes">
                  <ul>
                    {backupCodes.map((code, i) => (
                      <li key={i} className="two-factor-auth-modal__backup-code">
                        {code}
                      </li>
                    ))}
                  </ul>
                  <p className="two-factor-auth-modal__backup-desc">
                    Store these codes in a safe place. Each code can be used once if you lose access to your authenticator.
                  </p>
                </div>
                <Button
                  onClick={() => closeModal('two-factor-auth-modal')}
                  buttonStyle="primary"
                  size="large"
                  className="two-factor-auth-modal__backup-codes-close-button">
                  Saved them!
                </Button>
              </>
            )}
            {formState === 'disable' && (
              <>
                <h2>Two‑Factor Authentication</h2>
                <DisableForm />
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
