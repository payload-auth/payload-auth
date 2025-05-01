import React from 'react'

import { z } from 'zod'
import { Logo } from '@/shared/components/logo'
import { MinimalTemplate } from '@payloadcms/next/templates'
import { AdminSignupClient } from './client'
import { FormHeader } from '@/shared/form/ui/header'
import { supportedBAPluginIds } from '@/better-auth/plugin/constants'

import type { AdminViewServerProps } from 'payload'
import type { BetterAuthPluginOptions } from '../../../types'
import { checkPluginExists } from '@/better-auth/plugin/helpers/check-plugin-exists'

//  Avoid the need for custom styles
const baseClass = 'login'

const searchParamsSchema = z.object({
  token: z.string()
})

interface AdminSignupProps extends AdminViewServerProps {
  adminInvitationsSlug: string
  pluginOptions: BetterAuthPluginOptions
}

const AdminSignup: React.FC<AdminSignupProps> = async ({
  initPageResult,
  params,
  searchParams,
  pluginOptions,
  adminInvitationsSlug
}: AdminSignupProps) => {
  const {
    locale,
    permissions,
    req,
    req: {
      i18n,
      user,
      payload: {
        collections,
        config: {
          admin: { user: userSlug }
        }
      }
    }
  } = initPageResult

  const { success, data } = searchParamsSchema.safeParse(searchParams)

  let hasInvalidToken = false
  if (!success) {
    hasInvalidToken = true
  } else {
    const { totalDocs: isValidInvite } = await req.payload.count({
      collection: adminInvitationsSlug,
      where: { token: { equals: data.token } }
    })
    if (!isValidInvite) {
      hasInvalidToken = true
    }
  }

  const loginMethods = pluginOptions.admin?.loginMethods ?? []
  const hasUsernamePlugin = checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.username)
  const loginWithUsername = collections?.[userSlug]?.config.auth.loginWithUsername
  const canLoginWithUsername = (hasUsernamePlugin && loginWithUsername) ?? false

  return (
    <MinimalTemplate className={`${baseClass} admin-signup`}>
      <div className={`${baseClass}__brand admin-signup__brand`}>
        <Logo
          i18n={i18n}
          locale={locale}
          params={params}
          payload={req.payload}
          permissions={permissions}
          searchParams={searchParams}
          user={user ?? undefined}
        />
      </div>
      {hasInvalidToken ? (
        <FormHeader
          style={{ textAlign: 'center' }}
          heading="Invalid or expired token"
          description="You need to get a new invite to sign up."
        />
      ) : (
        data && (
          <AdminSignupClient
            adminInviteToken={data.token}
            userSlug={userSlug}
            loginMethods={loginMethods}
            searchParams={searchParams ?? {}}
            loginWithUsername={canLoginWithUsername}
          />
        )
      )}
    </MinimalTemplate>
  )
}

export default AdminSignup
