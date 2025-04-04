import {
  createClientConfig,
  sanitizeConfig,
  type AdminViewServerProps,
  type ServerProps,
} from 'payload'
import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import { redirect } from 'next/navigation.js'
import { Gutter } from '@payloadcms/ui'
import Logo from '../../components/logo.js'
import { LoginForm } from './form/index.js'
import { getSafeRedirect } from '../../utils/get-safe-redirect.js'
import type { BetterAuthPluginOptions } from '../../../types.js'

export const loginBaseClass = 'login'

export default async function LoginView({
  initPageResult,
  params,
  searchParams,
  defaultAdminRole,
  options,
}: AdminViewServerProps & {
  defaultAdminRole: string
  options: BetterAuthPluginOptions['adminComponents']
}) {
  const { locale, permissions, req } = initPageResult
  const {
    i18n,
    payload: { config },
    payload,
    user,
  } = req

  const {
    admin: {
      components: { afterLogin, beforeLogin, graphics } = {},
      user: userSlug,
      routes: { forgot: forgotRoute },
    },
    routes: { admin: adminRoute },
  } = config

  const redirectUrl = getSafeRedirect(searchParams?.redirect ?? '', adminRoute)

  if (user) {
    redirect(redirectUrl)
  }

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

  const prefillAutoLogin =
    typeof config.admin?.autoLogin === 'object' && config.admin?.autoLogin.prefillOnly

  const prefillUsername =
    prefillAutoLogin && typeof config.admin?.autoLogin === 'object'
      ? config.admin?.autoLogin.username
      : undefined

  const prefillEmail =
    prefillAutoLogin && typeof config.admin?.autoLogin === 'object'
      ? config.admin?.autoLogin.email
      : undefined

  const prefillPassword =
    prefillAutoLogin && typeof config.admin?.autoLogin === 'object'
      ? config.admin?.autoLogin.password
      : undefined

  if (adminCount.totalDocs === 0) {
    redirect(`${adminRoute}/create-first-admin`)
  }

  const clientConfig = createClientConfig({
    config,
    i18n,
    importMap: payload.importMap,
  })

  return (
    <Gutter className="mt-40">
      <div className={`${loginBaseClass}__brand`}>
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
          user: user ?? undefined,
        } satisfies ServerProps,
      })}
      <LoginForm
        clientConfig={clientConfig}
        options={options}
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
          user: user ?? undefined,
        } satisfies ServerProps,
      })}
    </Gutter>
  )
}
