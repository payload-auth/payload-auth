import { createFormHookContexts, createFormHook } from '@tanstack/react-form'
import { TextField } from './fields/text-field'
import { Submit } from './components/submit'
import { HiddenField } from './fields/hidden-field'

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts()

const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    HiddenField
  },
  formComponents: {
    Submit
  }
})

export { useAppForm, withForm, fieldContext, formContext, useFieldContext, useFormContext }
