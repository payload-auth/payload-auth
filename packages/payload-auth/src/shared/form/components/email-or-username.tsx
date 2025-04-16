import React, { type ComponentPropsWithRef } from 'react'
import { FormField, FormInputWrap, FormLabel } from '../ui'

export type EmailOrUsernameFieldProps = ComponentPropsWithRef<'input'> & {
  label: string
  error?: string
}

export const EmailOrUsernameField = React.memo(({ id, label, error, required, ...props }: EmailOrUsernameFieldProps) => {
  let autoComplete = 'username email'
  if (id === 'email') {
    autoComplete = 'email'
  } else if (id === 'username') {
    autoComplete = 'username'
  }
  return (
    <FormField error={error} className="email">
      <FormLabel label={label} htmlFor={id} required={required} />
      <FormInputWrap>
        <input
          type="text"
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete={autoComplete}
          required={false}
          {...props}
        />
      </FormInputWrap>
      {error && <div className="field-error">{error}</div>}
    </FormField>
  )
}) as React.FC<EmailOrUsernameFieldProps>
