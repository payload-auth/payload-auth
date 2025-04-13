import { MinimalTemplate } from "@payloadcms/next/templates";
import type { AdminViewServerProps } from "payload";
import React from "react";
import { ForgotPasswordForm } from "./form";
import Link from "next/link";
import { formatAdminURL } from "payload/shared";

const ForgotView: React.FC<AdminViewServerProps> = (props) => {
  const { initPageResult: { req } } = props;
  const { i18n, payload: { config } } = req;

  const { routes: { admin: adminRoute } } = config;
  const loginRoute = config.admin?.custom?.betterAuth?.adminRoutes?.login ?? config.admin?.routes?.login;
  return (
    <MinimalTemplate>
      <ForgotPasswordForm />
      <Link
        href={formatAdminURL({
          adminRoute,
          path: loginRoute,
        })}
        prefetch={false}
      >
        {i18n.t("authentication:backToLogin")}
      </Link>
    </MinimalTemplate>
  );
};

export default ForgotView;