import React from 'react'
import type { AdminViewServerProps, ServerProps } from 'payload'
import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import { redirect } from 'next/navigation'
import { Gutter } from '@payloadcms/ui'
import SignIn from '@/components/sign-in'
import { SignUp } from '@/components/sign-up'

export default async function CreateFirstAdmin({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { locale, permissions, req } = initPageResult
  const {
    i18n,
    payload: { config },
    payload,
    user
  } = req

  const {
    admin: { components: { afterLogin, beforeLogin, graphics } = {}, user: userSlug },
    routes: { admin }
  } = config

  const adminCount = await req.payload.count({
    collection: 'users',
    where: {
      role: {
        equals: 'admin'
      }
    }
  })

  if (adminCount.totalDocs > 0) {
    redirect('/admin')
  }

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
          user: user ?? undefined
        } satisfies ServerProps
      })}
      {/* {RenderServerComponent({
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
        })} */}
      <div className="flex flex-col items-center justify-center">
        <SignUp admin={true} />
      </div>
      {RenderServerComponent({
        Component: afterLogin,
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
    </Gutter>
  )
}
