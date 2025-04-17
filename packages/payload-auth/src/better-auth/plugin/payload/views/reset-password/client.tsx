'use client'

import React, { useMemo, useState, useTransition } from 'react'

import { Form } from '@/shared/form/ui'
import { useRouter } from 'next/navigation.js'
import { formatAdminURL } from 'payload/shared'
import { createAuthClient } from 'better-auth/react'
// import { PasswordField } from '@/shared/form/components/password'
import { useAuth, useConfig, useTranslation, toast, FormSubmit } from '@payloadcms/ui'

type PasswordResetFormArgs = {
  readonly token: string
  readonly minPasswordLength?: number
  readonly maxPasswordLength?: number
}

function isValidPassword(input: string, minLength: number = 8, maxLength: number = 128): true | string {
  if (!input) {
    return 'Password cannot be empty'
  }
  if (input.length < minLength) {
    return `Password must be at least ${minLength} characters long`
  }
  if (input.length > maxLength) {
    return `Password cannot be longer than ${maxLength} characters`
  }
  return true
}

export const PasswordResetForm: React.FC<PasswordResetFormArgs> = ({ token, minPasswordLength = 8, maxPasswordLength = 128 }) => {
  const authClient = useMemo(() => createAuthClient(), [])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [isPending, startTransition] = useTransition()
  const { t } = useTranslation()
  const history = useRouter()
  const { fetchFullUser } = useAuth()
  const {
    config: {
      admin: {
        routes: { login: loginRoute }
      },
      routes: { admin: adminRoute }
    }
  } = useConfig()

  const validatePassword = (value: string, isOnBlur: boolean = false) => {
    if (isOnBlur && !value) {
      setPasswordError('')
      return true
    }
    const result = isValidPassword(value, minPasswordLength, maxPasswordLength)
    setPasswordError(result === true ? '' : result)
    return result === true
  }

  const validateConfirmPassword = (value: string, isOnBlur: boolean = false) => {
    if (isOnBlur && !value) {
      setConfirmPasswordError('')
      return true
    }
    if (!value) {
      setConfirmPasswordError('Confirm password cannot be empty')
      return false
    }
    if (value !== password) {
      setConfirmPasswordError('Passwords do not match')
      return false
    }
    setConfirmPasswordError('')
    return true
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setPasswordError('')
    setConfirmPasswordError('')
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
    setConfirmPasswordError('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const isPasswordValid = validatePassword(password, false)
    const isConfirmValid = validateConfirmPassword(confirmPassword, false)
    if (!isPasswordValid || !isConfirmValid) return
    startTransition(async () => {
      try {
        const { data, error } = await authClient.resetPassword({
          newPassword: password,
          token
        })
        if (error) {
          toast.error(error.message || 'Error resetting password')
          return
        }
        if (data?.status) {
          const user = await fetchFullUser()
          if (user) {
            history.push(adminRoute)
          } else {
            history.push(
              formatAdminURL({
                adminRoute,
                path: loginRoute
              })
            )
          }
          toast.success(t('authentication:passwordResetSuccessfully'))
        }
      } catch (e) {
        toast.error('An unexpected error occurred')
      }
    })
  }

  return (
    <Form onSubmit={handleSubmit}>
      {/* <PasswordField
        id="password"
        label={t('authentication:newPassword')}
        value={password}
        error={passwordError}
        onChange={handlePasswordChange}
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => validatePassword(e.target.value, true)}
        style={{ marginBottom: '1rem' }}
        required
      />
      <PasswordField
        id="confirm-password"
        label={t('authentication:confirmPassword')}
        value={confirmPassword}
        error={confirmPasswordError}
        onChange={handleConfirmPasswordChange}
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => validateConfirmPassword(e.target.value, true)}
        required
      /> */}
      <input type="hidden" name="token" value={token} />
      <FormSubmit disabled={isPending}>{isPending ? t('general:loading') : t('authentication:resetPassword')}</FormSubmit>
    </Form>
  )
}
