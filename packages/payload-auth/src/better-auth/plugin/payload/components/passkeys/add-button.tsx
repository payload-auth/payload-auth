'use client'

import { passkeyClient } from '@better-auth/passkey/client'
import { Button, Modal, toast, useModal } from '@payloadcms/ui'
import { createAuthClient } from 'better-auth/react'
import { XIcon } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { z } from 'zod'
import { useAppForm } from '@/shared/form'
import { Form, FormInputWrap } from '@/shared/form/ui'

const baseClass = 'passkeys-modal'

interface PassKeyAddButtonProps {
  onAdd?: () => void
  baseURL?: string
  basePath?: string
}

export const PassKeyAddButton: React.FC<PassKeyAddButtonProps> = ({ onAdd, baseURL, basePath }) => {
  const { openModal, closeModal } = useModal()
  const authClient = useMemo(() => createAuthClient({ baseURL, basePath, plugins: [passkeyClient()] }), [])

  const AddPasskeyForm: React.FC = () => {
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
        if (typeof onAdd === 'function') onAdd()
      },
      validators: {
        onSubmit: nameSchema
      }
    })

    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="passkeys-add-form">
        <FormInputWrap className="passkeys-add-form__inputWrap">
          <form.AppField name="name">
            {(field: any) => <field.TextField type="text" className="text name" label="Passkey Name" required />}
          </form.AppField>
        </FormInputWrap>
        <form.AppForm>
          <form.Submit label="Create Passkey" loadingLabel="Creating" />
        </form.AppForm>
      </Form>
    )
  }

  return (
    <>
      <Button onClick={() => openModal('passkeys-modal')} size="medium" buttonStyle="pill">
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
    </>
  )
}
