import React from 'react'
import { AdminLoginClient } from './client'
import { redirect } from 'next/navigation'
import { Logo } from '@/shared/components/logo'
import { getSafeRedirect } from '@/better-auth/plugin/payload/utils/get-safe-redirect'
import { MinimalTemplate } from '@payloadcms/next/templates'
import { checkPluginExists } from '@/better-auth/plugin/helpers/check-plugin-exists'
import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import { adminRoutes, defaults, supportedBAPluginIds } from '@/better-auth/plugin/constants'

import { type AdminViewServerProps, type ServerProps } from 'payload'
import type { BetterAuthPluginOptions } from '@/better-auth/plugin/types'

export const loginBaseClass = 'login'

interface AdminLoginProps extends AdminViewServerProps {
  adminInvitationsSlug: string
  pluginOptions: BetterAuthPluginOptions
}

const AdminLogin: React.FC<AdminLoginProps> = async ({
  initPageResult,
  params,
  searchParams,
  pluginOptions,
  adminInvitationsSlug
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

  if (adminCount.totalDocs === 0) {
    // Check if we already have an admin invitation
    const existingInvitations = await req.payload.find({
      collection: adminInvitationsSlug,
      where: {
        role: {
          equals: adminRole
        }
      }
    })

    let token

    if (existingInvitations.totalDocs > 0) {
      // Use existing token
      token = existingInvitations.docs[0].token
    } else {
      // Generate a new secure invite token
      token = crypto.randomUUID()
      await req.payload.create({
        collection: adminInvitationsSlug,
        data: {
          role: adminRole,
          token
        }
      })
    }

    redirect(`${adminRoute}${adminRoutes.adminSignup}?token=${token}`)
  }

  // Filter out the first component from afterLogin array or set to undefined if not more than 1
  // This is because of the custom login redirect component, we don't want an infinite loop
  const filteredAfterLogin = Array.isArray(afterLogin) && afterLogin.length > 1 ? afterLogin.slice(1) : undefined
  const prefillAutoLogin = typeof config.admin?.autoLogin === 'object' && config.admin?.autoLogin.prefillOnly
  const prefillUsername = prefillAutoLogin && typeof config.admin?.autoLogin === 'object' ? config.admin?.autoLogin.username : undefined
  const prefillEmail = prefillAutoLogin && typeof config.admin?.autoLogin === 'object' ? config.admin?.autoLogin.email : undefined
  const prefillPassword = prefillAutoLogin && typeof config.admin?.autoLogin === 'object' ? config.admin?.autoLogin.password : undefined
  const hasUsernamePlugin = checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.username)
  const hasPasskeyPlugin = checkPluginExists(pluginOptions.betterAuthOptions ?? {}, supportedBAPluginIds.passkey)
  const loginMethods = pluginOptions.admin?.loginMethods ?? []
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
        hasUsernamePlugin={hasUsernamePlugin}
        hasPasskeyPlugin={hasPasskeyPlugin}
        loginMethods={loginMethods}
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
