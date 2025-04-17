// import React, { type ComponentPropsWithoutRef } from 'react'
// import { FormField, FormLabel, FormError, FormInputWrap } from '../ui'
// import clsx from 'clsx'
// import { useFormContext, withForm } from '..'
// import { formOptions } from '@tanstack/react-form'

// export type PasswordFieldProps = {
//   label: string
//   defaultValues: any
// }

// export const passwordFormOpts = formOptions({
//   defaultValues: {
//     password: ''
//   }
// })

// export const PasswordField = withForm({
//   defaultValues: 
//   props: {} as PasswordFieldProps,
//   render: ({ form, label, defaultValues }) => {
//     return <form.AppField name="password" children={(field) => <field.TextField label="Password" />} />
//   }
// })

// // export const PasswordField: React.FC<PasswordFieldProps> = ({ label }) => {
// //   const form = useFormContext()

// //   return (
// //     <FormField className={clsx('password')}>
// //       <FormLabel label={label} />
// //       <FormInputWrap>
// //         <form.App
// //         <input
// //           type="password"
// //           id={id}
// //           name={name ?? id}
// //           aria-invalid={!!error}
// //           aria-describedby={error ? `${id}-error` : undefined}
// //           {...rest}
// //         />
// //         <FormError error={error} />
// //       </FormInputWrap>
// //     </FormField>
// //   )
// // }
