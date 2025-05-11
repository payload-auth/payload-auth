import React, { Fragment } from 'react'
import { MinimalTemplate } from '@payloadcms/next/templates'
import { Button, Translation } from '@payloadcms/ui'
import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { formatAdminURL } from 'payload/shared'
import { FormHeader } from '@/shared/form/ui/header'
import { ForgotPasswordForm } from './client'
import { adminRoutes } from '@/better-auth/plugin/constants'
import type { BetterAuthPluginOptions } from '@/better-auth/plugin/types'
type ForgotPasswordProps = AdminViewServerProps & {
  pluginOptions: BetterAuthPluginOptions
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ pluginOptions, initPageResult }) => {
  const {
    req: {
      payload: {
        config: {
          admin: {
            routes: { account: accountRoute }
          },
          routes: { admin: adminRoute }
        }
      },
      user,
      i18n
    }
  } = initPageResult

  if (user) {
    return (
      <Fragment>
        <FormHeader
          description={
            <Translation
              elements={{
                '0': ({ children }) => (
                  <Link
                    href={formatAdminURL({
                      adminRoute,
                      path: accountRoute
                    })}
                    prefetch={false}>
                    {children}
                  </Link>
                )
              }}
              i18nKey="authentication:loggedInChangePassword"
              t={i18n.t}
            />
          }
          heading={i18n.t('authentication:alreadyLoggedIn')}
        />
        <Button buttonStyle="secondary" el="link" size="large" to={adminRoute}>
          {i18n.t('general:backToDashboard')}
        </Button>
      </Fragment>
    )
  }

  return (
    <MinimalTemplate>
      <ForgotPasswordForm baseURL={pluginOptions.betterAuthOptions?.baseURL} basePath={pluginOptions.betterAuthOptions?.basePath} />
      <Link
        href={formatAdminURL({
          adminRoute,
          path: adminRoutes.adminLogin as `/${string}`
        })}
        prefetch={false}>
        {i18n.t('authentication:backToLogin')}
      </Link>
    </MinimalTemplate>
  )
}

export default ForgotPassword
