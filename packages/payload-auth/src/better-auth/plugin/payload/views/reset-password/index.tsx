import React from "react";
import { Button, Link, Translation } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import { formatAdminURL } from "payload/shared";
import { PasswordResetClient } from "./client";
import { getAdminRoutes } from "../../../helpers/get-admin-routes";
import { z } from "zod";
import { FormHeader } from "../../components/form-header";

const resetPasswordParamsSchema = z.object({
  token: z.string(),
});

const ResetPassword: React.FC<AdminViewServerProps> = ({
  initPageResult,
  searchParams,
}) => {
  const {
    req: {
      user,
      t,
      payload: {
        config: {
          routes: { admin: adminRoute },
          admin: {
            custom,
            routes: { account: accountRoute },
          },
        },
      },
    },
  } = initPageResult;

  if (user) {
    return (
      <section className="reset-password template-minimal template-minimal--width-normal">
        <div className="template-minimal__wrap">
          <FormHeader
            description={
              <Translation
                elements={{
                  "0": ({ children }) => (
                    <Link
                      href={formatAdminURL({
                        adminRoute,
                        path: accountRoute,
                      })}
                      prefetch={false}
                    >
                      {children}
                    </Link>
                  ),
                }}
                i18nKey="authentication:loggedInChangePassword"
                t={t}
              />
            }
            heading={t("authentication:alreadyLoggedIn")}
          />
          <Button
            buttonStyle="secondary"
            el="link"
            size="large"
            to={adminRoute}
          >
            {t("general:backToDashboard")}
          </Button>
        </div>
      </section>
    );
  }

  const resetPasswordParams = resetPasswordParamsSchema.safeParse(searchParams);
  if (!resetPasswordParams.success) {
    return <div>Invalid reset password params</div>;
  }
  const { token } = resetPasswordParams.data;
  const adminRoutes = getAdminRoutes(custom);

  return (
    <section className="reset-password__wrap template-minimal template-minimal--width-normal">
      <div className="template-minimal__wrap">
        <FormHeader heading={t("authentication:resetPassword")} />
        <PasswordResetClient token={token} />
        <Link
          href={formatAdminURL({
            adminRoute,
            path: adminRoutes.login as `/${string}`,
          })}
          prefetch={false}
        >
          {t("authentication:backToLogin")}
        </Link>
      </div>
    </section>
  );
};

export default ResetPassword;
