import { getPayloadAuth } from '@/better-auth/plugin/lib/get-payload-auth'
import { MinimalTemplate } from '@payloadcms/next/templates'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'
import React from 'react'
import { TwoFactorVerifyForm } from './client'
import { cookies } from 'next/headers'
import { getSafeRedirect } from '../../utils/get-safe-redirect'

interface TwoFactorVerifyProps extends AdminViewServerProps {
  verificationSlug: string
}

const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = async ({ clientConfig, payload, searchParams, initPageResult, verificationSlug }) => {
  const adminRoute = clientConfig?.routes?.admin || '/admin'
  const loginRoute = clientConfig?.admin?.routes?.login || '/login'
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
    <MinimalTemplate className='two-factor-verify'>
      <TwoFactorVerifyForm redirect={redirectUrl} />
    </MinimalTemplate>
  )
}

export default TwoFactorVerify 