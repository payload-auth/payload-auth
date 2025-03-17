import React from 'react'
import type { AdminViewServerProps, ServerProps } from 'payload'
import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import { redirect } from 'next/navigation'
import { Gutter } from '@payloadcms/ui'
import { SignUp } from '../../components/sign-up'

export default async function CreateFirstAdmin({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
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
    collection: 'users',
    where: {
      role: {
        equals: 'admin',
      },
    },
  })

  if (adminCount.totalDocs > 0) {
    redirect('/admin')
  }

  const addAdminRole = async (userId: string) => {
    await payload.update({
      collection: userSlug,
      id: userId,
      data: {
        role: 'admin',
      },
    })
  }

  // Filter out the first component from afterLogin array or set to undefined if not more than 1
  const filteredAfterLogin =
    Array.isArray(afterLogin) && afterLogin.length > 1 ? afterLogin.slice(1) : undefined

  return (
    <Gutter className="twp mt-40">
      {RenderServerComponent({
        Component: graphics?.Logo,
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
        <SignUp admin={true} addAdminRole={addAdminRole} />
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
