import React, { type ComponentPropsWithoutRef } from 'react'
import { FormField, FormLabel, FormErrors, FormInputWrap } from '../ui'
import clsx from 'clsx'

export type EmailFieldProps = ComponentPropsWithoutRef<'input'> & {
  label: string
  errors?: string[]
}

export const EmailField: React.FC<EmailFieldProps> = ({ label, errors, required = false, className, id, name, ...rest }) => {
  const hasError = (errors?.length ?? 0 > 0) ? true : false
  return (
    <FormField hasError={hasError} className={clsx(className, 'email')}>
      <FormLabel label={label} htmlFor={id} required={required} />
      <FormInputWrap>
        <input
          type="email"
          id={id}
          name={name ?? id}
          aria-invalid={!!errors}
          aria-describedby={errors ? `${id}-error` : undefined}
          {...rest}
        />
        <FormErrors errors={errors} />
      </FormInputWrap>
    </FormField>
  )
}
