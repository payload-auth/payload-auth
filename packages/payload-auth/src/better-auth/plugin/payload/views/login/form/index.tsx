'use client'

import React from 'react'
import { createAuthClient } from 'better-auth/react'
import { passkeyClient } from 'better-auth/client/plugins'
import { Key, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation.js'
import type { BetterAuthPluginOptions, SocialProviders } from '../../../../types.js'
import type { ClientConfig, FormState } from 'payload'
import {
  Button,
  Form,
  FormSubmit,
  Link,
  PasswordField,
  useConfig,
  useTranslation,
} from '@payloadcms/ui'

import { getSafeRedirect } from '../../../utils/get-safe-redirect.js'

import type { LoginFieldProps } from './login-field.js'
import { Icons } from '../../../components/ui/icons.js'

import './index.scss'
import { getTranslation, t } from '@payloadcms/translations'
const baseClass = 'login__form'

export const LoginForm: React.FC<{
  clientConfig: ClientConfig
  options: BetterAuthPluginOptions['adminComponents']
  prefillEmail?: string
  prefillPassword?: string
  prefillUsername?: string
  searchParams: { [key: string]: string | string[] | undefined }
}> = ({ clientConfig, options, prefillEmail, prefillPassword, prefillUsername, searchParams }) => {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const loginWithUsername = false
  const canLoginWithEmail = true
  const canLoginWithUsername = false

  const config = useConfig()

  const [loginType] = React.useState<LoginFieldProps['type']>(() => {
    if (canLoginWithEmail && canLoginWithUsername) {
      return 'emailOrUsername'
    }
    if (canLoginWithUsername) {
      return 'username'
    }
    return 'email'
  })

  const authClient = React.useMemo(
    () =>
      createAuthClient({
        plugins: [passkeyClient()],
      }),
    [],
  )

  const initialState: FormState = {
    password: {
      initialValue: prefillPassword ?? undefined,
      valid: true,
      value: prefillPassword ?? undefined,
    },
  }

  if (loginWithUsername) {
    initialState.username = {
      initialValue: prefillUsername ?? undefined,
      valid: true,
      value: prefillUsername ?? undefined,
    }
  } else {
    initialState.email = {
      initialValue: prefillEmail ?? undefined,
      valid: true,
      value: prefillEmail ?? undefined,
    }
  }

  const adminRoute = clientConfig.routes.admin

  const handleSubmit = (data: unknown) => {
    const { email, password } = data as { email: string; password: string }
    authClient.signIn.email({
      email,
      password,
      callbackURL: adminRoute,
    })
  }

  return (
    <div className="space-y-4">
      {/* <Form
        className={baseClass}
        disableSuccessStatus
        initialState={initialState}
        method="POST"
        onSubmit={handleSubmit}
        redirect={getSafeRedirect(searchParams?.redirect as string, adminRoute)}
        waitForAutocomplete
      >
        <div className={`${baseClass}__inputWrap`}>
          <LoginField type={loginType} />
          <PasswordField
            field={{
              name: 'password',
              label: getTranslation('general:password', clientConfig.i18n),
              required: true,
            }}
            path="password"
          />
        </div>
        <Link
          href={formatAdminURL({
            adminRoute: clientConfig.routes.admin,
            path: clientConfig.admin.routes.forgot,
          })}
          prefetch={false}
        >
          {getTranslation('authentication:forgotPasswordQuestion', clientConfig.admin.i18n)}
        </Link>
        <FormSubmit size="large" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              {getTranslation('authentication:login', clientConfig.i18n)}
            </>
          ) : (
            getTranslation('authentication:login', clientConfig.i18n)
          )}
        </FormSubmit>
      </Form> */}

      <div className="relative my-4">
        <div className="relative flex justify-center text-xs uppercase border-b border-muted pb-4">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {Object.keys(options?.socialProviders ?? {}).map((provider) => {
          const typedProvider = provider as keyof SocialProviders
          const providerConfig = options?.socialProviders?.[typedProvider]

          const Icon = Icons[provider as keyof typeof Icons]

          return (
            <Button
              key={provider}
              type="button"
              onClick={async () => {
                setLoading(true)
                try {
                  await authClient.signIn.social({
                    provider: typedProvider,
                    callbackURL: adminRoute,
                    requestSignUp:
                      providerConfig?.disableSignUp === undefined
                        ? false
                        : !providerConfig.disableSignUp,
                  })
                } catch (error) {
                  toast.error(`Failed to sign in with ${typedProvider}`)
                } finally {
                  setLoading(false)
                }
              }}
            >
              {typedProvider.charAt(0).toUpperCase() + typedProvider.slice(1)}
              {Icon && <Icon />}
            </Button>
          )
        })}
      </div>

      <Button
        type="button"
        onClick={async () => {
          setLoading(true)
          try {
            await authClient.signIn.passkey({
              fetchOptions: {
                onSuccess() {
                  router.push(getSafeRedirect(searchParams?.redirect as string, adminRoute))
                },
                onError(context) {
                  toast.error(context.error.message)
                },
              },
            })
          } finally {
            setLoading(false)
          }
        }}
      >
        <Key size={16} />
        <span>Sign in with Passkey</span>
      </Button>
    </div>
  )
}
