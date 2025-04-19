import React from 'react'

import { z } from 'zod'
import { Logo } from '../../../../../shared/components/logo'
import { MinimalTemplate } from '@payloadcms/next/templates'
import { AdminSignupClient } from './client'
import { FormHeader } from '../../../../../shared/form/ui/header'
import { baseCollectionSlugs } from '../../../constants'
import { checkUsernamePlugin } from '../../../helpers/check-username-plugin'

import type { AdminViewServerProps } from 'payload'
import type { BetterAuthPluginOptions, SanitizedBetterAuthOptions } from '../../../types'

import './index.scss'

const baseClass = 'admin-signup'

const searchParamsSchema = z.object({
  token: z.string().uuid()
})

type AdminSignupProps = AdminViewServerProps & {
  defaultAdminRole: string
  pluginOptions: BetterAuthPluginOptions
  betterAuthOptions: SanitizedBetterAuthOptions
}

const AdminSignup: React.FC<AdminSignupProps> = async ({
  initPageResult,
  params,
  searchParams,
  pluginOptions,
  betterAuthOptions
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

  const renderInvalidInvite = () => (
    <MinimalTemplate className={baseClass}>
      <div className={`${baseClass}__brand`}>
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
      <FormHeader
        heading="Invalid or expired token"
        description="You need to get a new invite to sign up."
        style={{ textAlign: 'center' }}
      />
    </MinimalTemplate>
  )

  if (!success) return renderInvalidInvite()

  const { totalDocs: hasInvite } = await req.payload.count({
    collection: pluginOptions.adminInvitations?.slug ?? baseCollectionSlugs.adminInvitations,
    where: { token: { equals: data.token } },
  })

  if (!hasInvite) return renderInvalidInvite()

  const socialProviders = pluginOptions.adminComponents?.socialProviders ?? {}
  const hasUsernamePlugin = checkUsernamePlugin(betterAuthOptions)
  const loginWithUsername = collections?.[userSlug]?.config.auth.loginWithUsername
  const canLoginWithUsername = (hasUsernamePlugin && loginWithUsername) ?? false

  return (
    <MinimalTemplate className={baseClass}>
      <div className={`${baseClass}__brand`}>
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
      <AdminSignupClient
        adminInviteToken={data.token}
        socialProviders={socialProviders}
        searchParams={searchParams ?? {}}
        loginWithUsername={canLoginWithUsername}
      />
    </MinimalTemplate>
  )
}

export default AdminSignup
