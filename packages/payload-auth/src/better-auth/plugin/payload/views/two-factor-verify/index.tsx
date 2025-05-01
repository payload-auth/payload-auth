import { MinimalTemplate } from '@payloadcms/next/templates'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'
import React from 'react'
import { TwoFactorVerifyForm } from './client'
import { cookies } from 'next/headers'
import { getSafeRedirect } from '../../utils/get-safe-redirect'
import { valueOrDefaultString } from '@/shared/utils/value-or-default'
import { adminRoutes, supportedBAPluginIds } from '@/better-auth/plugin/constants'
import { BetterAuthPluginOptions } from '@/better-auth/plugin/types'

interface TwoFactorVerifyProps extends AdminViewServerProps {
  pluginOptions: BetterAuthPluginOptions
  verificationsSlug: string
}

const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = async ({ searchParams, initPageResult, pluginOptions, verificationsSlug }) => {
  const { req } = initPageResult
  const {
    payload: { config },
    payload
  } = req

  const {
    admin: {
      routes: { login }
    },
    routes: { admin: adminRoute }
  } = config
  const cookieStore = await cookies()
  const loginRoute = valueOrDefaultString(login, adminRoutes.adminLogin)
  const redirectUrl = getSafeRedirect(searchParams?.redirect as string, adminRoute)

  const twoFactorOptions =
    pluginOptions.betterAuthOptions?.plugins?.find((plugin) => plugin.id === supportedBAPluginIds.twoFactor)?.options ?? {}

  const twoFactorCookie = cookieStore.get(`${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}better-auth.two_factor`)?.value
  if (!twoFactorCookie) {
    redirect(`${adminRoute}${loginRoute}`)
  }
  const twoFactorVerifyToken = twoFactorCookie.split('.').at(0)
  if (!twoFactorVerifyToken) {
    redirect(`${adminRoute}${loginRoute}`)
  }
  const { totalDocs: isValidTwoFactorToken } = await payload.count({
    collection: verificationsSlug,
    where: {
      identifier: {
        equals: twoFactorVerifyToken
      }
    }
  })
  if (!isValidTwoFactorToken) {
    redirect(`${adminRoute}${loginRoute}`)
  }

  return (
    <MinimalTemplate className="two-factor-verify">
      <TwoFactorVerifyForm redirect={redirectUrl} twoFactorDigits={twoFactorOptions?.totpOptions?.digits} />
    </MinimalTemplate>
  )
}

export default TwoFactorVerify
