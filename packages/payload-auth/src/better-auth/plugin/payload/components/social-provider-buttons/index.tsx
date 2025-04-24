'use client'

import { socialProviders } from '@/better-auth/plugin/constants'
import type { LoginMethod, SocialProvider } from '@/better-auth/plugin/types'
import { Icons } from '@/shared/components/icons'
import { Button, toast } from '@payloadcms/ui'
import { passkeyClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { Key } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useMemo } from 'react'
import './index.scss'

type AdminSocialProviderButtonsProps = {
  isSignup: boolean
  loginMethods: LoginMethod[]
  setLoading: (loading: boolean) => void
  redirectUrl?: string
  newUserCallbackURL?: string
  adminInviteToken?: string
}

const baseClass = 'admin-social-provider-buttons'

export const AdminSocialProviderButtons: React.FC<AdminSocialProviderButtonsProps> = ({
  isSignup,
  loginMethods,
  setLoading,
  redirectUrl,
  newUserCallbackURL,
  adminInviteToken
}) => {
  const router = useRouter()
  const authClient = useMemo(() => createAuthClient({ plugins: [passkeyClient()] }), [])
  
  const loginMethodCount = loginMethods.filter(method => method !== 'emailPassword', 'passkey').length
  if (loginMethodCount === 0) return null

  const showIconOnly = loginMethodCount >= 3

  return (
    <>
      {loginMethods.includes('emailPassword') && (
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            marginTop: '-.5rem',
            color: 'var(--theme-elevation-450)',
          marginBottom: '1.5rem'
        }}>
          <span>Or {isSignup ? 'sign up' : 'login'} with</span>
        </div>
      )}
      <div className={`${baseClass} ${baseClass}--count-${showIconOnly ? 'many' : loginMethodCount}`}>
        {loginMethods.map((loginMethod) => {
          const providerName = loginMethod.charAt(0).toUpperCase() + loginMethod.slice(1)
          const isSocialProvider = socialProviders.includes(loginMethod as SocialProvider)

          // ---- Passkey ----
          if (loginMethod === 'passkey') {
            if (isSignup) return null
            const handlePasskeyClick = async () => {
              setLoading(true)
              try {
                await authClient.signIn.passkey({
                  fetchOptions: {
                    onSuccess() {
                      if (router && redirectUrl) router.push(redirectUrl)
                    },
                    onError(context: any) {
                      toast.error(context.error.message || 'Failed to sign in with passkey')
                    }
                  }
                })
              } catch (error: any) {
                toast.error(error?.message || 'Failed to sign in with passkey')
              } finally {
                setLoading(false)
              }
            }

            return (
              <Button
                key={loginMethod}
                type="button"
                size="large"
                className={`${baseClass}__button provider--passkey`}
                onClick={handlePasskeyClick}
                icon={showIconOnly ? <Key className={`${baseClass}__icon`} /> : undefined}
                tooltip={showIconOnly ? `Sign in with ${providerName}` : undefined}>
                {!showIconOnly && <Key className={`${baseClass}__icon`} />}
                {!showIconOnly && <span>{providerName}</span>}
              </Button>
            )
          }

          // ---- Social providers ----
          if (isSocialProvider) {
            const Icon = Icons[loginMethod as keyof typeof Icons] ?? null

            const handleSocialClick = async () => {
              setLoading(true)
              try {
                const { error } = await authClient.signIn.social({
                  provider: loginMethod as SocialProvider,
                  fetchOptions: {
                    query: {
                      ...(isSignup && { adminInviteToken })
                    }
                  },
                  errorCallbackURL: window.location.href,
                  callbackURL: redirectUrl,
                  newUserCallbackURL,
                  ...(isSignup && { requestSignUp: true }),
                })

                if (error) {
                  toast.error(error.message)
                }
              } catch (error: any) {
                toast.error(`Failed to sign in with ${providerName}`)
              } finally {
                setLoading(false)
              }
            }

            return (
              <Button
                key={loginMethod}
                type="button"
                size="large"
                className={`${baseClass}__button provider--${loginMethod}`}
                onClick={handleSocialClick}
                iconPosition='left'
                icon={<Icon className={`${baseClass}__icon`} />}
                tooltip={showIconOnly ? `Sign in with ${providerName}` : undefined}>
                {!showIconOnly && <span>{providerName}</span>}
              </Button>
            )
          }

          // Unknown provider — render nothing
          return null
        })}
      </div>
    </>
  )
}
