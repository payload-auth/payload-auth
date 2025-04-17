import React from 'react'
import { AdminLoginClient } from './client'
import { redirect } from 'next/navigation'
import { Logo } from '@/shared/components/logo'
import { getSafeRedirect } from '@/better-auth/plugin/payload/utils/get-safe-redirect'
import { MinimalTemplate } from '@payloadcms/next/templates'
import { checkPasskeyPlugin } from '@/better-auth/plugin/helpers/check-passkey-plugin'
import { checkUsernamePlugin } from '@/better-auth/plugin/helpers/check-username-plugin'
import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import { adminRoutes, baseCollectionSlugs, defaults } from '@/better-auth/plugin/constants'

import { type AdminViewServerProps, type ServerProps } from 'payload'
import type { BetterAuthPluginOptions, SanitizedBetterAuthOptions } from '@/better-auth/plugin/types'

export const loginBaseClass = 'login'

type AdminLoginProps = AdminViewServerProps & {
  pluginOptions: BetterAuthPluginOptions
  betterAuthOptions: SanitizedBetterAuthOptions
}

const AdminLogin: React.FC<AdminLoginProps> = async ({
  initPageResult,
  params,
  searchParams,
  pluginOptions,
  betterAuthOptions
}: AdminLoginProps) => {
  const { locale, permissions, req } = initPageResult
  const {
    i18n,
    payload: { config, collections },
    payload,
    user
  } = req

  const {
    admin: { components: { afterLogin, beforeLogin } = {}, user: userSlug },
    routes: { admin: adminRoute }
  } = config

  const adminRole = pluginOptions.users?.defaultAdminRole ?? defaults.adminRole
  const redirectUrl = getSafeRedirect(searchParams?.redirect ?? '', adminRoute)

  if (user) {
    redirect(redirectUrl)
  }

  const adminCount = await req.payload.count({
    collection: userSlug,
    where: {
      role: {
        equals: adminRole
      }
    }
  })

  // Filter out the first component from afterLogin array or set to undefined if not more than 1
  // This is because of the custom login redirect component, we don't want an infinite loop
  const filteredAfterLogin = Array.isArray(afterLogin) && afterLogin.length > 1 ? afterLogin.slice(1) : undefined

  const prefillAutoLogin = typeof config.admin?.autoLogin === 'object' && config.admin?.autoLogin.prefillOnly

  const prefillUsername = prefillAutoLogin && typeof config.admin?.autoLogin === 'object' ? config.admin?.autoLogin.username : undefined

  const prefillEmail = prefillAutoLogin && typeof config.admin?.autoLogin === 'object' ? config.admin?.autoLogin.email : undefined

  const prefillPassword = prefillAutoLogin && typeof config.admin?.autoLogin === 'object' ? config.admin?.autoLogin.password : undefined

  if (adminCount.totalDocs === 0) {
    //generate a secure invite and redirect to admin-signup
    const token = crypto.randomUUID()
    await req.payload.create({
      collection: pluginOptions.adminInvitations?.slug ?? baseCollectionSlugs.adminInvitations,
      data: {
        role: adminRole,
        token
      }
    })
    redirect(`${adminRoute}${adminRoutes.adminSignup}?token=${token}`)
  }

  const hasUsernamePlugin = checkUsernamePlugin(betterAuthOptions)
  const hasPasskeyPlugin = checkPasskeyPlugin(betterAuthOptions)
  const socialProviders = pluginOptions.adminComponents?.socialProviders ?? {}
  const loginWithUsername = collections?.[userSlug]?.config.auth.loginWithUsername
  const canLoginWithUsername = (hasUsernamePlugin && loginWithUsername) ?? false

  return (
    <MinimalTemplate className={loginBaseClass}>
      <div className={`${loginBaseClass}__brand`}>
        <Logo
          i18n={i18n}
          locale={locale}
          params={params}
          payload={payload}
          permissions={permissions}
          searchParams={searchParams}
          user={user ?? undefined}
        />
      </div>
      {RenderServerComponent({
        Component: beforeLogin,
        importMap: payload.importMap,
        serverProps: {
          i18n,
          locale,
          params,
          payload,
          permissions,
          searchParams,
          user: user ?? undefined
        } satisfies ServerProps
      })}
      <AdminLoginClient
        loginWithUsername={canLoginWithUsername}
        hasPasskeySupport={hasPasskeyPlugin}
        hasUsernamePlugin={hasUsernamePlugin}
        socialProviders={socialProviders}
        prefillEmail={prefillEmail}
        prefillPassword={prefillPassword}
        prefillUsername={prefillUsername}
        searchParams={searchParams ?? {}}
      />
      {RenderServerComponent({
        Component: filteredAfterLogin,
        importMap: payload.importMap,
        serverProps: {
          i18n,
          locale,
          params,
          payload,
          permissions,
          searchParams,
          user: user ?? undefined
        } satisfies ServerProps
      })}
    </MinimalTemplate>
  )
}

export default AdminLogin
