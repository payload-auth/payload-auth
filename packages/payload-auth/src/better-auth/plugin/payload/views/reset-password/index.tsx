import { MinimalTemplate } from "@payloadcms/next/templates";
import { Link } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import { formatAdminURL } from "payload/shared";
import React from "react";
import { PasswordResetForm } from "./form";

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
    i18n: { t },
    payload: { config },
  } = req;

  const { routes: { admin: adminRoute } } = config;
  const loginRoute = config.admin?.custom?.betterAuth?.adminRoutes?.login ?? config.admin?.routes?.login;

  return (
    <MinimalTemplate className={`${resetPasswordBaseClass}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h1>{t("authentication:resetPassword")}</h1>
        <PasswordResetForm token={token ?? ""} />
        <Link
          href={formatAdminURL({
            adminRoute,
            path: loginRoute,
          })}
          prefetch={false}
        >
          {t("authentication:backToLogin")}
        </Link>
      </div>
    </MinimalTemplate>
  );
};

export default ResetPassword;
