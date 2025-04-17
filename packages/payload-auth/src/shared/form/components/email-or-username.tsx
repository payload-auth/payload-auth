// import React, { type ComponentPropsWithRef } from 'react'
// import { FormField, FormInputWrap, FormLabel } from '../ui'
// import { useAppForm, withForm } from '..'
// import { WithFormProps } from '@tanstack/react-form'
// import { useFormContext } from '..'
// import type { AnyFormApi } from '@tanstack/react-form'
// import { formOptions } from '@tanstack/react-form'

// export type EmailOrUsernameFieldProps = {
//   label: string
//   type: 'email' | 'username' | 'emailOrUsername'
// }

// export const emailOrUsernameFormOpts = formOptions({
//   defaultValues: {
//     email: '',
//     username: '',
//     emailOrUsername: ''
//   }
// })

// // export const EmailOrUsernameField = withForm({
// //   props: {} as EmailOrUsernameFieldProps,
// //   render: function Render({ form, type, label }) {
// //     return <form.AppField name={type} children={(field) => <field.TextField label={label} />} />
// //   }
// // })

// export const EmailOrUsernameField = React.memo(({ label, type, ...props }: EmailOrUsernameFieldProps) => {
//   const form = 
//   let autoComplete = 'username email'
//   if (id === 'email') {
//     autoComplete = 'email'
//   } else if (id === 'username') {
//     autoComplete = 'username'
//   }
//   return (
//     <form.
//     <FormField error={error} className="email">
//       <FormLabel label={label} htmlFor={id} required={required} />
//       <FormInputWrap>
//         <input
//           type="text"
//           id={id}
//           aria-invalid={!!error}
//           aria-describedby={error ? `${id}-error` : undefined}
//           autoComplete={autoComplete}
//           required={false}
//           {...props}
//         />
//       </FormInputWrap>
//       {error && <div className="field-error">{error}</div>}
//     </FormField>
//   )
// }) as React.FC<EmailOrUsernameFieldProps>
