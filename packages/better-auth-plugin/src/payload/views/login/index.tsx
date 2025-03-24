import React from 'react'
import type { AdminViewServerProps, ServerProps } from 'payload'
import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import { redirect } from 'next/navigation'
import { Gutter } from '@payloadcms/ui'
import SignIn from '../../components/sign-in'
import Logo from '../../components/logo'

export default async function LoginView({
  initPageResult,
  params,
  searchParams,
  defaultAdminRole,
}: AdminViewServerProps & { defaultAdminRole: string }) {
  const { locale, permissions, req } = initPageResult
  const {
    i18n,
    payload: { config },
    payload,
    user,
  } = req

  const {
    admin: { components: { afterLogin, beforeLogin, graphics } = {}, user: userSlug },
    routes: { admin },
  } = config

  const adminCount = await req.payload.count({
    collection: userSlug,
    where: {
      role: {
        equals: defaultAdminRole ?? 'admin',
      },
    },
  })

  // Filter out the first component from afterLogin array or set to undefined if not more than 1
  const filteredAfterLogin =
    Array.isArray(afterLogin) && afterLogin.length > 1 ? afterLogin.slice(1) : undefined

  if (adminCount.totalDocs === 0) {
    redirect(`${admin}/create-first-admin`)
  }

  return (
    <Gutter className="mt-40">
      {RenderServerComponent({
        Component: graphics?.Logo,
        Fallback: () => <Logo />,
        importMap: payload.importMap,
        serverProps: {
          i18n,
          locale,
          params,
          payload,
          permissions,
          searchParams,
          user: user ?? undefined,
        } satisfies ServerProps,
      })}
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
          user: user ?? undefined,
        } satisfies ServerProps,
      })}
      <div className="flex flex-col items-center justify-center">
        <SignIn admin={true} />
      </div>
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
          user: user ?? undefined,
        } satisfies ServerProps,
      })}
    </Gutter>
  )
}
