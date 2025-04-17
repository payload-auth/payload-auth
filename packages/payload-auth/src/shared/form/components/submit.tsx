import React from 'react'
import { useFormContext } from '..'
import { FormSubmit } from '@payloadcms/ui'

type SubmitProps = {
  label: string
  loadingLabel: string
}

export const Submit: React.FC<SubmitProps> = ({ label, loadingLabel }) => {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting]}
      children={([canSubmit, isSubmitting]) => <FormSubmit disabled={!canSubmit}>{isSubmitting ? loadingLabel : label}</FormSubmit>}
    />
  )
}
