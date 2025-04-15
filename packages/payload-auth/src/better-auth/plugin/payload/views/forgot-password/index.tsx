import { MinimalTemplate } from '@payloadcms/next/templates'
import { Button, Translation } from '@payloadcms/ui'
import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { formatAdminURL } from 'payload/shared'
import React, { Fragment } from 'react'
import type { SanitizedBetterAuthOptions } from '../../../types'
import { FormHeader } from '../../components/form/header'
import { ForgotPasswordForm } from './client'

type ForgotViewProps = AdminViewServerProps & {
  betterAuthOptions: SanitizedBetterAuthOptions
}

const ForgotView: React.FC<ForgotViewProps> = ({ initPageResult, betterAuthOptions }) => {
  const {
    req: {
      payload: {
        collections,
        config: {
          admin: {
            user: userSlug,
            custom,
            routes: { login, account: accountRoute }
          },
          routes: { admin: adminRoute }
        }
      },
      user,
      i18n
    }
  } = initPageResult

  const loginRoute = custom?.betterAuth?.adminRoutes?.login ?? login

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
      <ForgotPasswordForm />
      <Link
        href={formatAdminURL({
          adminRoute,
          path: loginRoute
        })}
        prefetch={false}>
        {i18n.t('authentication:backToLogin')}
      </Link>
    </MinimalTemplate>
  )
}

export default ForgotView
