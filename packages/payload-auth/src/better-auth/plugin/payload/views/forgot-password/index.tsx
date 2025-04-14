import React, { Fragment } from "react";
import type { AdminViewServerProps } from "payload";
import { ForgotPasswordClient } from "./client";
import Link from "next/link";
import { formatAdminURL } from "payload/shared";
import { redirect } from "next/navigation";
import { checkUsernamePlugin } from "../../../helpers/check-username-plugin";
import type { SanitizedBetterAuthOptions } from "../../../types";
import { Button, Translation } from "@payloadcms/ui";
import { FormHeader } from "../../components/form-header";

type ForgotViewProps = AdminViewServerProps & {
  betterAuthOptions: SanitizedBetterAuthOptions;
};

const ForgotView: React.FC<ForgotViewProps> = ({
  initPageResult,
  betterAuthOptions,
}) => {
  const {
    req: {
      payload: {
        collections,
        config: {
          admin: {
            user: userSlug,
            custom,
            routes: { login, account: accountRoute },
          },
          routes: { admin: adminRoute },
        },
      },
      user,
      i18n,
    },
  } = initPageResult;

  const loginRoute = custom?.betterAuth?.adminRoutes?.login ?? login;
  const collectionConfig = collections?.[userSlug]?.config;
  const { auth: authOptions } = collectionConfig;
  const hasUsernamePlugin = checkUsernamePlugin(betterAuthOptions);
  const loginWithUsername = authOptions.loginWithUsername;
  const canLoginWithUsername =
    (hasUsernamePlugin && loginWithUsername) ?? false;

  if (user) {
    return (
      <Fragment>
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
              t={i18n.t}
            />
          }
          heading={i18n.t("authentication:alreadyLoggedIn")}
        />
        <Button buttonStyle="secondary" el="link" size="large" to={adminRoute}>
          {i18n.t("general:backToDashboard")}
        </Button>
      </Fragment>
    );
  }

  return (
    <section className="forgot-password template-minimal template-minimal--width-normal">
      <div className="template-minimal__wrap">
        <ForgotPasswordClient loginWithUsername={canLoginWithUsername} />
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
    </section>
  );
};

export default ForgotView;
