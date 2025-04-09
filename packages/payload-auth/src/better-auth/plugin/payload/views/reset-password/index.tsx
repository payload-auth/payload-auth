import React from "react";
import type { AdminViewServerProps } from "payload";
import { Button, Link } from "@payloadcms/ui";
import { Translation } from "@payloadcms/ui/shared";
import { formatAdminURL } from "payload/shared";
import { ResetPasswordForm } from "./form";

// import { FormHeader } from "../../elements/FormHeader/index.js";

import "./index.scss";

export const resetPasswordBaseClass = "reset-password";

const ResetPassword: React.FC<AdminViewServerProps> = ({
  initPageResult,
  params,
}) => {
  const { req } = initPageResult;

  if (!params) {
    return <div>No params</div>;
  }
  const segments = Array.isArray(params.segments)
    ? params.segments
    : [params.segments];
  const [_, token] = segments;

  const {
    i18n,
    payload: { config },
    user,
  } = req;

  const {
    admin: {
      routes: { account: accountRoute, login: loginRoute },
    },
    routes: { admin: adminRoute },
  } = config;

  if (user) {
    return (
      <div className={`${resetPasswordBaseClass}__wrap`}>
        {/* <FormHeader
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
              t={i18n.t}
            />
          }
          heading={i18n.t("authentication:alreadyLoggedIn")}
        /> */}
        <Button buttonStyle="secondary" el="link" size="large" to={adminRoute}>
          {i18n.t("general:backToDashboard")}
        </Button>
      </div>
    );
  }

  return (
    <div className={`${resetPasswordBaseClass}__wrap`}>
      {/* <FormHeader heading={i18n.t("authentication:resetPassword")} /> */}
      <ResetPasswordForm token={token ?? ""} />
      <Link
        href={formatAdminURL({
          adminRoute,
          path: loginRoute,
        })}
        prefetch={false}
      >
        {i18n.t("authentication:backToLogin")}
      </Link>
    </div>
  );
};

export default ResetPassword;
