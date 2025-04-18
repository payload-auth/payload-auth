import React, { type ComponentPropsWithoutRef, type ReactNode } from 'react'
import clsx from 'clsx'
import type { AnyFieldMeta } from '@tanstack/react-form'
import { Tooltip } from '@payloadcms/ui/elements/Tooltip'

import './index.scss'

type FormFieldProps = ComponentPropsWithoutRef<'div'> & {
  hasError?: boolean
}

const FormField: React.FC<FormFieldProps> = ({ children, hasError, className, ...rest }) => (
  <div className={clsx('field-type', className, { error: hasError })} {...rest}>
    {children}
  </div>
)

type FormLabelProps = ComponentPropsWithoutRef<'label'> & {
  label: ReactNode
  required?: boolean
}

const FormLabel: React.FC<FormLabelProps> = ({ label, required = false, className, ...rest }) => (
  <label className={clsx('field-label', className)} {...rest}>
    {label}
    {required && <span className="required">*</span>}
  </label>
)

type FieldErrorsProps = {
  meta: AnyFieldMeta
  className?: string
}

export const FieldErrors = ({ meta, className }: FieldErrorsProps) => {
  if (!meta.isTouched) return null
  const error = meta.errors.at(0)?.message || null

  return (
    <Tooltip alignCaret="right" className={clsx('field-error', className)} show={!!error} delay={0} staticPositioning>
      {error}
    </Tooltip>
  )
}

type FormErrorProps = {
  errors?: string[]
  className?: string
}

const FormErrors: React.FC<FormErrorProps> = ({ errors, className }) =>
  errors ? (
    <Tooltip alignCaret="right" className={clsx('field-error', className)} delay={0} staticPositioning>
      {errors.join(', ')}
    </Tooltip>
  ) : null

type FormProps = ComponentPropsWithoutRef<'form'>

const Form: React.FC<FormProps> = ({ children, className, ...rest }) => (
  <form className={clsx('form', className)} {...rest}>
    {children}
  </form>
)

type FormInputWrapProps = ComponentPropsWithoutRef<'div'>

const FormInputWrap: React.FC<FormInputWrapProps> = ({ children, className, ...rest }) => (
  <div className={`${className}__inputWrap`} {...rest}>
    {children}
  </div>
)

type FieldInputWrapProps = ComponentPropsWithoutRef<'div'>

const FieldInputWrap: React.FC<FieldInputWrapProps> = ({ children, className, ...rest }) => (
  <div className={clsx('field-type__wrap', className)} {...rest}>
    {children}
  </div>
)

export type { FormFieldProps, FormLabelProps, FormErrorProps, FormProps, FormInputWrapProps }
export { FormField, FormLabel, FormErrors, Form, FormInputWrap, FieldInputWrap }
