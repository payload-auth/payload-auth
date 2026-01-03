import { MinimalTemplate } from "@payloadcms/next/templates";
import { Button, Link, Translation } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import { formatAdminURL } from "payload/shared";
import React from "react";
import { z } from "zod";
import { adminRoutes } from "@/better-auth/plugin/constants";
import type { PayloadAuthOptions } from "@/better-auth/plugin/types";
import { FormHeader } from "@/shared/form/ui/header";
import { PasswordResetForm } from "./client";

const resetPasswordParamsSchema = z.object({
  token: z.string()
});

const resetPasswordBaseClass = "reset-password";

interface ResetPasswordProps extends AdminViewServerProps {
  pluginOptions: PayloadAuthOptions;
}

function ResetPassword({
  pluginOptions,
  initPageResult,
  searchParams
}: ResetPasswordProps) {
  const {
    req: {
      user,
      t,
      payload: {
        config: {
          routes: { admin: adminRoute },
          admin: {
            routes: { account: accountRoute }
          }
        }
      }
    }
  } = initPageResult;

  if (user) {
    return (
      <MinimalTemplate className={`${resetPasswordBaseClass}`}>
        <FormHeader
          description={
            <Translation
              elements={{
                "0": ({ children }) => (
                  <Link
                    href={formatAdminURL({
                      adminRoute,
                      path: accountRoute
                    })}
                    prefetch={false}
                  >
                    {children}
                  </Link>
                )
              }}
              i18nKey="authentication:loggedInChangePassword"
              t={t}
            />
          }
          heading={t("authentication:alreadyLoggedIn")}
        />
        <Button buttonStyle="secondary" el="link" size="large" to={adminRoute}>
          {t("general:backToDashboard")}
        </Button>
      </MinimalTemplate>
    );
  }

  const resetPasswordParams = resetPasswordParamsSchema.safeParse(searchParams);
  if (!resetPasswordParams.success) {
    return <div>Invalid reset password params</div>;
  }
  const { token } = resetPasswordParams.data;

  return (
    <MinimalTemplate className={`${resetPasswordBaseClass}`}>
      <FormHeader heading={t("authentication:resetPassword")} />
      <PasswordResetForm
        token={token}
        baseURL={pluginOptions.betterAuthOptions?.baseURL}
        basePath={pluginOptions.betterAuthOptions?.basePath}
      />
      <Link
        href={formatAdminURL({
          adminRoute,
          path: adminRoutes.adminLogin as `/${string}`
        })}
        prefetch={false}
      >
        {t("authentication:backToLogin")}
      </Link>
    </MinimalTemplate>
  );
}

export default ResetPassword;
