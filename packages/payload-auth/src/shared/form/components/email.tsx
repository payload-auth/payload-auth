import React, { type ComponentPropsWithoutRef } from 'react'
import { FormField, FormLabel, FormError, FormInputWrap } from '../ui'
import clsx from 'clsx'

export type EmailFieldProps = ComponentPropsWithoutRef<'input'> & {
  label: string
  error?: string
}

export const EmailField: React.FC<EmailFieldProps> = ({ label, error, required = false, className, id, name, ...rest }) => (
  <FormField error={error} className={clsx(className, 'email')}>
    <FormLabel label={label} htmlFor={id} required={required} />
    <FormInputWrap>
      <input type="email" id={id} name={name ?? id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...rest} />
      <FormError error={error} />
    </FormInputWrap>
  </FormField>
)
