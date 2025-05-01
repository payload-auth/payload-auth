'use client'

import './index.scss'

import { useAppForm } from '@/shared/form'
import { Form, FormInputWrap } from '@/shared/form/ui'
import { Button, Modal, toast, useDocumentInfo, useModal } from '@payloadcms/ui'
import { passkeyClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { XIcon, Trash, Fingerprint } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { z } from 'zod'

const baseClass = 'passkeys-modal'

export const Passkeys: React.FC<{ passkeySlug: string }> = ({ passkeySlug }) => {
  const { openModal, closeModal } = useModal()
  const authClient = useMemo(() => createAuthClient({ plugins: [passkeyClient()] }), [])

  const { id } = useDocumentInfo()
  if (!id) return null

  const {
    data: passkeys,
    isRefetching,
    isPending
  } = authClient.useListPasskeys?.() || {
    data: undefined,
    isLoading: false
  }

  const AddPasskeyForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const nameSchema = z.object({
      name: z.string().min(1, 'Name is required')
    })

    const form = useAppForm({
      defaultValues: { name: '' },
      onSubmit: async ({ value }) => {
        setIsLoading(true)
        const res = await authClient.passkey.addPasskey({ name: value.name })
        setIsLoading(false)
        if (res?.error) {
          toast.error(res.error.message)
          return
        }
        toast.success('Passkey added successfully')
        closeModal('passkeys-modal')
      },
      validators: { onSubmit: nameSchema }
    })

    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="passkeys-add-form">
        <FormInputWrap className="passkeys-add-form__inputWrap">
          <form.AppField
            name="name"
            children={(field: any) => <field.TextField type="text" className="text name" label="Passkey Name" required />}
          />
        </FormInputWrap>
        <form.AppForm children={<form.Submit label="Create Passkey" loadingLabel="Creating" />} />
      </Form>
    )
  }

  return (
    <div className="passkeys-field">
      <h3 style={{ marginBottom: '0.7rem' }} className="passkeys-field__title">
        Passkeys
      </h3>
      {isRefetching || isPending ? (
        <p style={{ marginBottom: '0.5rem' }}>Loading passkeys…</p>
      ) : passkeys && passkeys.length ? (
        <ul className="passkeys-field__list">
          {passkeys.map((pk: any) => (
            <li key={pk.id} className="passkeys-field__list-item">
              <Fingerprint size={16} />
              <span>{pk.name || 'My Passkey'}</span>
              <span className="passkeys-field__list-item-date"> - </span>
              <span className="passkeys-field__list-item-date">
                {new Date(pk.createdAt).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
              <Button
                buttonStyle="none"
                size="small"
                className="passkeys-field__delete-button"
                onClick={async () => {
                  const res = await authClient.passkey.deletePasskey({ id: pk.id })
                  if (res?.error) toast.error(res.error.message)
                  else {
                    toast.success('Passkey deleted')
                  }
                }}>
                <Trash size={16} />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ marginBottom: '1rem' }}>No passkeys found.</p>
      )}
      <Button
        onClick={() => {
          openModal('passkeys-modal')
        }}
        size="medium"
        buttonStyle="pill">
        Add Passkey
      </Button>

      <Modal slug="passkeys-modal" className={baseClass} closeOnBlur>
        <div className={`${baseClass}__wrapper`}>
          <Button
            onClick={() => closeModal('passkeys-modal')}
            buttonStyle="icon-label"
            size="small"
            className={`${baseClass}__close-button`}>
            <XIcon size={24} />
          </Button>

          <div className={`${baseClass}__content`} style={{ maxWidth: '30rem' }}>
            <h2>Create New Passkey</h2>
            <p>Securely access your account without a password by creating a new passkey.</p>
            <AddPasskeyForm />
          </div>
        </div>
      </Modal>
    </div>
  )
}
