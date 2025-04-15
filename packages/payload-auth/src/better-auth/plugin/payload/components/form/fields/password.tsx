import React, { type ComponentPropsWithoutRef } from 'react'
import { FormField, FormLabel, FormError, FormInputWrap } from '../index'
import clsx from 'clsx'

export type PasswordFieldProps = ComponentPropsWithoutRef<'input'> & {
  label: string
  error?: string
}

export const PasswordField = React.memo(({
  label, error, required = false, className, id, name, ...rest
}: PasswordFieldProps) => (
  <FormField error={error} className={clsx(className, 'password')}>
    <FormLabel label={label} htmlFor={id} required={required} />
    <FormInputWrap>
      <input
        type="password"
        id={id}
        name={name ?? id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      <FormError error={error} />
    </FormInputWrap>
  </FormField>
)) as React.FC<PasswordFieldProps>;
