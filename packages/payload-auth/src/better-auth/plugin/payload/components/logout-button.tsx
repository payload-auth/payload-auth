"use client";

import { LogOutIcon, useConfig, useTranslation } from "@payloadcms/ui";
import { formatAdminURL } from "payload/shared";
import React from "react";

const baseClass = "nav";

export const LogoutButton: React.FC<{
  tabIndex?: number;
}> = ({ tabIndex = 0 }) => {
  const { t } = useTranslation();
  const { config } = useConfig();

  const {
    admin: {
      routes: { logout: logoutRoute }
    },
    routes: { admin: adminRoute }
  } = config;

  return (
    <a
      aria-label={t("authentication:logOut")}
      className={`${baseClass}__log-out`}
      href={formatAdminURL({
        adminRoute,
        path: logoutRoute
      })}
      tabIndex={tabIndex}
      title={t("authentication:logOut")}
    >
      <LogOutIcon />
    </a>
  );
};
