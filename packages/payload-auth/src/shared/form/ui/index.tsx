import { Tooltip } from "@payloadcms/ui/elements/Tooltip";
import type { AnyFieldMeta } from "@tanstack/react-form";
import clsx from "clsx";
import React, { type ReactNode } from "react";

import "./index.scss";

interface FormFieldProps extends React.ComponentProps<"div"> {
  hasError?: boolean;
}

function FormField({ children, hasError, className, ...rest }: FormFieldProps) {
  return (
    <div
      className={clsx("field-type", className, { error: hasError })}
      {...rest}
    >
      {children}
    </div>
  );
}

interface FormLabelProps extends React.ComponentProps<"label"> {
  label: ReactNode;
  required?: boolean;
}

function FormLabel({
  label,
  required = false,
  className,
  ...rest
}: FormLabelProps) {
  return (
    <label className={clsx("field-label", className)} {...rest}>
      {label}
      {required && <span className="required">*</span>}
    </label>
  );
}

interface FieldErrorsProps {
  meta: AnyFieldMeta;
  className?: string;
}

function FieldErrors({ meta, className }: FieldErrorsProps) {
  if (!meta.isTouched) return null;
  const error = meta.errors.at(0)?.message || null;

  return (
    <Tooltip
      alignCaret="right"
      className={clsx("field-error", className)}
      show={!!error}
      delay={0}
      staticPositioning
    >
      {error}
    </Tooltip>
  );
}

interface FormErrorProps {
  errors?: string[];
  className?: string;
}

function FormError({ errors, className }: FormErrorProps) {
  if (!errors) return null;
  return (
    <div className={clsx("form-error", className)}>{errors.join(", ")}</div>
  );
}

interface FormProps extends React.ComponentProps<"form"> {}

function Form({ children, className, ...rest }: FormProps) {
  return (
    <form className={clsx("form", className)} {...rest}>
      {children}
    </form>
  );
}

interface FormInputWrapProps extends React.ComponentProps<"div"> {}

function FormInputWrap({ children, className, ...rest }: FormInputWrapProps) {
  return (
    <div className={`${className}__inputWrap`} {...rest}>
      {children}
    </div>
  );
}

interface FieldInputWrapProps extends React.ComponentProps<"div"> {}

function FieldInputWrap({ children, className, ...rest }: FieldInputWrapProps) {
  return (
    <div className={clsx("field-type__wrap", className)} {...rest}>
      {children}
    </div>
  );
}

export {
  FieldErrors,
  FieldInputWrap,
  Form,
  FormError,
  FormField,
  FormInputWrap,
  FormLabel
};

export type {
  FormErrorProps,
  FormFieldProps,
  FormInputWrapProps,
  FormLabelProps,
  FormProps
};
