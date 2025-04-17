import { useStore } from '@tanstack/react-form'
import { useFieldContext } from '../index'
import { FieldErrors, FieldInputWrap, FormField, FormLabel } from '../ui'

export function TextField({
  className,
  label,
  required = false,
  type = 'text',
  autoComplete = 'off'
}: {
  className: string
  label: string
  required?: boolean
  type?: string
  autoComplete?: string
}) {
  const field = useFieldContext<string>()
  const meta = useStore(field.store, (state) => state.meta)

  const hasError = meta.isTouched && meta.errors.length > 0

  return (
    <FormField id={field.name} className={className} hasError={hasError}>
      <FormLabel label={label} htmlFor={field.name} required={required} />
      <FieldInputWrap>
        <input
          autoComplete={autoComplete}
          type={type}
          id={field.name}
          name={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          required={required}
          className="text-field"
        />
        <FieldErrors meta={meta} />
      </FieldInputWrap>
    </FormField>
  )
}
