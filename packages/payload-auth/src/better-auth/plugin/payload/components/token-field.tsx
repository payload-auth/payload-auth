'use client'

import React from 'react'
import { Button, TextInput, useField, useFormFields } from '@payloadcms/ui'
import { TextFieldClientProps } from 'payload'

const AdminInviteTokenField: React.FC<TextFieldClientProps> = (props) => {
  const { path } = props
  const { setValue } = useField({ path })
  const token = useFormFields(([fields]) => fields.token)
  const value = (token.value as string) ?? ''

  return (
    <div>
      <Button onClick={() => setValue(crypto.randomUUID())}>Generate Token</Button>
      <TextInput path={path} readOnly label="Token" placeholder="Click 'Generate Token' to create a token" value={value} />
    </div>
  )
}

export default AdminInviteTokenField
