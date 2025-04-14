"use client";

import React from "react";
import { formatAdminURL } from "payload/shared";
import { LogOutIcon, useConfig, useTranslation } from "@payloadcms/ui";
import { getAdminRoutes } from "../../helpers/get-admin-routes";

const baseClass = "nav";

const LogoutButton: React.FC<{
  tabIndex?: number;
}> = ({ tabIndex = 0 }) => {
  const { t } = useTranslation();
  const { config } = useConfig();

  const {
    routes: { admin: adminRoute },
  } = config;

  const adminRoutes = getAdminRoutes(config.admin.custom);

  return (
    <a
      aria-label={t("authentication:logOut")}
      className={`${baseClass}__log-out`}
      href={formatAdminURL({
        adminRoute,
        path: adminRoutes.logout as `/${string}`,
      })}
      tabIndex={tabIndex}
      title={t("authentication:logOut")}
    >
      <LogOutIcon />
    </a>
  );
};

export default LogoutButton;
