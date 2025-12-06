'use client'

import { getSafeRedirect } from '@/better-auth/plugin/payload/utils/get-safe-redirect'
import { LoginFormProvider, CredentialsForm, AlternativeMethods } from '@/better-auth/plugin/payload/components/login-form'
import { useConfig } from '@payloadcms/ui'
import React from 'react'
import type { LoginMethod } from '@/better-auth/plugin/types'

type AdminLoginClientProps = {
  loginMethods: LoginMethod[]
  plugins?: {
    username?: boolean
    passkey?: boolean
    magicLink?: boolean
  }
  loginIdentifiers: ('email' | 'username')[]
  prefill?: {
    email?: string
    password?: string
    username?: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
  baseURL?: string
  basePath?: string
}

export const AdminLoginClient: React.FC<AdminLoginClientProps> = ({
  loginMethods,
  searchParams,
  loginIdentifiers,
  baseURL,
  basePath,
  plugins,
  prefill
}) => {
  const { config } = useConfig()
  const redirectUrl = getSafeRedirect(searchParams?.redirect as string, config.routes.admin)

  return (
    <LoginFormProvider
      loginMethods={loginMethods}
      redirectUrl={redirectUrl}
      baseURL={baseURL}
      basePath={basePath}
      loginIdentifiers={loginIdentifiers}
      plugins={plugins}
      prefill={prefill}>
      <CredentialsForm />
      <AlternativeMethods />
    </LoginFormProvider>
  )
}
