import type { ComponentPropsWithoutRef } from 'react';
import { useFieldContext } from '../index';

type HiddenFieldProps = ComponentPropsWithoutRef<'input'> & {
  required?: boolean
}

export function HiddenField({ required = false, ...props }: HiddenFieldProps) {
  const field = useFieldContext<string>()

  return (
    <input
      {...props}
      type="hidden"
      id={field.name}
      name={field.name}
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      required={required}
    />
  )
}
