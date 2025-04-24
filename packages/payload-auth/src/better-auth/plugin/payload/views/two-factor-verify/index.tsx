import { MinimalTemplate } from '@payloadcms/next/templates'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'
import React from 'react'
import { TwoFactorVerifyForm } from './client'
import { cookies } from 'next/headers'
import { getSafeRedirect } from '../../utils/get-safe-redirect'
import { valueOrDefaultString } from '@/shared/utils/value-or-default'
import { adminRoutes } from '@/better-auth/plugin/constants'
import type { TwoFactorOptions } from 'better-auth/plugins/two-factor'

interface TwoFactorVerifyProps extends AdminViewServerProps {
  verificationSlug: string
  twoFactorOptions: TwoFactorOptions | undefined
}

const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = async ({
  clientConfig,
  payload,
  searchParams,
  initPageResult,
  verificationSlug,
  twoFactorOptions
}) => {
  const adminRoute = valueOrDefaultString(clientConfig?.routes?.admin, '/admin')
  const loginRoute = valueOrDefaultString(clientConfig?.admin?.routes?.login, adminRoutes.adminLogin)
  const cookieStore = await cookies()
  const twoFactorCookie = cookieStore.get(`${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}better-auth.two_factor`)?.value
  const redirectUrl = getSafeRedirect(searchParams?.redirect as string, adminRoute)
  if (!twoFactorCookie) {
    redirect(`${adminRoute}${loginRoute}`)
  }
  const twoFactorVerifyToken = twoFactorCookie.split('.').at(0)
  if (!twoFactorVerifyToken) {
    redirect(`${adminRoute}${loginRoute}`)
  }
  const { totalDocs: isValidTwoFactorToken } = await payload.count({
    collection: verificationSlug,
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
