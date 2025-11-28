import React, { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import type { AnyFieldMeta } from '@tanstack/react-form';
import './index.scss';
type FormFieldProps = ComponentPropsWithoutRef<'div'> & {
    hasError?: boolean;
};
declare const FormField: React.FC<FormFieldProps>;
type FormLabelProps = ComponentPropsWithoutRef<'label'> & {
    label: ReactNode;
    required?: boolean;
};
declare const FormLabel: React.FC<FormLabelProps>;
type FieldErrorsProps = {
    meta: AnyFieldMeta;
    className?: string;
};
export declare const FieldErrors: ({ meta, className }: FieldErrorsProps) => React.JSX.Element | null;
type FormErrorProps = {
    errors?: string[];
    className?: string;
};
declare const FormError: React.FC<FormErrorProps>;
type FormProps = ComponentPropsWithoutRef<'form'>;
declare const Form: React.FC<FormProps>;
type FormInputWrapProps = ComponentPropsWithoutRef<'div'>;
declare const FormInputWrap: React.FC<FormInputWrapProps>;
type FieldInputWrapProps = ComponentPropsWithoutRef<'div'>;
declare const FieldInputWrap: React.FC<FieldInputWrapProps>;
export type { FormFieldProps, FormLabelProps, FormErrorProps, FormProps, FormInputWrapProps };
export { FormField, FormLabel, FormError, Form, FormInputWrap, FieldInputWrap };
//# sourceMappingURL=index.d.ts.map