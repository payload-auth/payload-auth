import { Tooltip } from "@payloadcms/ui/elements/Tooltip";
import React, { type ComponentPropsWithoutRef, type ReactNode } from "react";
import clsx from "clsx";

type FormFieldProps = ComponentPropsWithoutRef<"div"> & {
  error?: string;
};

const FormField: React.FC<FormFieldProps> = ({ children, error, className, ...rest }) => (
  <div className={clsx("field-type", { error }, className)} {...rest}>
    {children}
  </div>
);

type FormLabelProps = ComponentPropsWithoutRef<"label"> & {
  label: ReactNode;
  required?: boolean;
};

const FormLabel: React.FC<FormLabelProps> = ({ label, required = false, className, ...rest }) => (
  <label className={clsx("field-label", className)} {...rest}>
    {label}
    {required && <span className="required">*</span>}
  </label>
);

type FormErrorProps = {
  error?: string;
  className?: string;
};

const FormError: React.FC<FormErrorProps> = ({ error, className }) => (
  error ? (
    <Tooltip
      alignCaret="right"
      className={clsx("field-error", className)}
      delay={0}
      staticPositioning
    >
      {error}
    </Tooltip>
  ) : null
);

type FormProps = ComponentPropsWithoutRef<"form">;

const Form: React.FC<FormProps> = ({ children, className, ...rest }) => (
  <form className={clsx("form", className)} {...rest}>
    {children}
  </form>
);

type FormInputWrapProps = ComponentPropsWithoutRef<"div">;

const FormInputWrap: React.FC<FormInputWrapProps> = ({ children, className, ...rest }) => (
  <div className={clsx("field-type__wrap", className)} {...rest}>
    {children}
  </div>
);

export type { FormFieldProps, FormLabelProps, FormErrorProps, FormProps, FormInputWrapProps };
export { FormField, FormLabel, FormError, Form, FormInputWrap }; 

