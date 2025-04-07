'use client'
import type { Validate, ValidateOptions } from 'payload'

import { EmailField, TextField } from '@payloadcms/ui'
import { email, username } from 'payload/shared'
import React from 'react'

export type LoginFieldProps = {
  readonly required?: boolean
  readonly type: 'email' | 'emailOrUsername' | 'username'
  readonly validate?: Validate
}

export const LoginField: React.FC<LoginFieldProps> = ({ type, required = true }) => {
  if (type === 'email') {
    return (
      <EmailField
        field={{
          name: 'email',
          admin: {
            autoComplete: 'email',
            placeholder: 'Email',
          },
          label: 'Email',
          required,
        }}
        path="email"
        validate={email}
      />
    )
  }

  if (type === 'username') {
    return (
      <TextField
        field={{
          name: 'username',
          label: 'Username',
          required,
        }}
        path="username"
        validate={username}
      />
    )
  }

  if (type === 'emailOrUsername') {
    return (
      <TextField
        field={{
          name: 'username',
          label: 'Email or Username',
          required,
        }}
        path="username"
        validate={(value, options) => {
          const passesUsername = username(value, options)
          const passesEmail = email(
            value,
            options as ValidateOptions<any, { username?: string }, any, any>,
          )

          if (!passesEmail && !passesUsername) {
            return `Email: ${passesEmail} Username: ${passesUsername}`
          }

          return true
        }}
      />
    )
  }

  return null
}
