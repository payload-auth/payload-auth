import React from 'react'

import { z } from 'zod'
import { Logo } from '../../../../../shared/components/logo'
import { AdminSignupClient } from './client'
import { FormHeader } from '../../../../../shared/form/ui/header'
import { baseCollectionSlugs } from '../../../constants'
import { checkUsernamePlugin } from '../../../helpers/check-username-plugin'

import type { AdminViewServerProps } from 'payload'
import type { BetterAuthPluginOptions, SanitizedBetterAuthOptions } from '../../../types'

import './index.scss'

const baseClass = 'admin-signup'

const searchParamsSchema = z.object({
  token: z.string()
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

  const { token } = searchParamsSchema.parse(searchParams)

  const invite = await req.payload.find({
    collection: pluginOptions.adminInvitations?.slug ?? baseCollectionSlugs.adminInvitations,
    where: { token: { equals: token } },
    limit: 1
  })

  if (invite.docs.length === 0) {
    return (
      <section className={`${baseClass} login template-minimal template-minimal--width-normal`}>
        <div className="template-minimal__wrap">
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
          <FormHeader heading={i18n.t('error:tokenInvalidOrExpired')} />
        </div>
      </section>
    )
  }

  const inviteRole = invite.docs[0].role as string
  const socialProviders = pluginOptions.adminComponents?.socialProviders ?? {}
  const hasUsernamePlugin = checkUsernamePlugin(betterAuthOptions)
  const loginWithUsername = collections?.[userSlug]?.config.auth.loginWithUsername
  const canLoginWithUsername = (hasUsernamePlugin && loginWithUsername) ?? false

  return (
    <section className={`${baseClass} login template-minimal template-minimal--width-normal`}>
      <div className="template-minimal__wrap">
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
          token={token}
          role={inviteRole}
          userSlug={userSlug}
          socialProviders={socialProviders}
          searchParams={searchParams ?? {}}
          loginWithUsername={canLoginWithUsername}
        />
      </div>
    </section>
  )
}

export default AdminSignup
