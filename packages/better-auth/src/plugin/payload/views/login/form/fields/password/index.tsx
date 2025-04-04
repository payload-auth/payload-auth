// 'use client'
// import React, { useCallback } from 'react'
// import type { ChangeEvent } from 'react'
// import { getTranslation } from '@payloadcms/translations'
// import type { PasswordFieldProps } from './types'
// import { password } from 'payload/shared'

// import { RenderCustomComponent } from '../../elements/RenderCustomComponent/index.js'
// import { FieldDescription } from '../../fields/FieldDescription/index.js'
// import { FieldError } from '../../fields/FieldError/index.js'
// import { FieldLabel } from '../../fields/FieldLabel/index.js'
// import { useTranslation } from '../../providers/Translation/index.js'
// import { fieldBaseClass } from '../shared/index.js'
// import './index.scss'
// import { PasswordFieldValidation } from 'payload'

// export const PasswordInput: React.FC<PasswordFieldProps> = (props) => {
//   const memoizedValidate: PasswordFieldValidation = useCallback(
//     (value, options) => {
//       const pathSegments = path ? path.split('.') : []

//       if (typeof props.validate === 'function') {
//         return props.validate(value, { ...options, required })
//       }

//       return password(value, {
//         name: 'password',
//         type: 'text',
//         blockData: {},
//         data: {},
//         event: 'onChange',
//         path: pathSegments,
//         preferences: { fields: {} },
//         req: {
//           payload: {
//             config,
//           },
//           t,
//         } as unknown as PayloadRequest,
//         required: true,
//         siblingData: {},
//       })
//     },
//     [validate, config, t, required, path],
//   )

//   const {
//     AfterInput,
//     autoComplete = 'off',
//     BeforeInput,
//     className,
//     description,
//     Description,
//     Error,
//     inputRef,
//     Label,
//     label,
//     localized,
//     onChange,
//     onKeyDown,
//     path,
//     placeholder,
//     readOnly,
//     required,
//     rtl,
//     showError,
//     style,
//     value,
//     width,
//   } = props

//   const { i18n } = useTranslation()

//   return (
//     <div
//       className={[
//         fieldBaseClass,
//         'password',
//         className,
//         showError && 'error',
//         readOnly && 'read-only',
//       ]
//         .filter(Boolean)
//         .join(' ')}
//       style={{
//         ...style,
//         width,
//       }}
//     >
//       <RenderCustomComponent
//         CustomComponent={Label}
//         Fallback={
//           <FieldLabel label={label} localized={localized} path={path} required={required} />
//         }
//       />
//       <div className={`${fieldBaseClass}__wrap`}>
//         <RenderCustomComponent
//           CustomComponent={Error}
//           Fallback={<FieldError path={path} showError={showError} />}
//         />
//         <div>
//           {BeforeInput}
//           <input
//             aria-label={getTranslation(label, i18n)}
//             autoComplete={autoComplete}
//             data-rtl={rtl}
//             disabled={readOnly}
//             id={`field-${path.replace(/\./g, '__')}`}
//             name={path}
//             onChange={onChange as (e: ChangeEvent<HTMLInputElement>) => void}
//             onKeyDown={onKeyDown}
//             placeholder={getTranslation(placeholder, i18n)}
//             ref={inputRef}
//             type="password"
//             value={value || ''}
//           />
//           {AfterInput}
//         </div>
//         <RenderCustomComponent
//           CustomComponent={Description}
//           Fallback={<FieldDescription description={description} path={path} />}
//         />
//       </div>
//     </div>
//   )
// }
