"use client";

import React from "react";
import Link from "next/link";
import { formatAdminURL } from "payload/shared";
import { LogOutIcon, useConfig, useTranslation } from "@payloadcms/ui";

const baseClass = "nav";

const LogoutButton: React.FC<{
  tabIndex?: number;
}> = ({ tabIndex = 0 }) => {
  const { t } = useTranslation();
  const { config } = useConfig();

  const {
    admin: {
      routes: { logout: logoutRoute },
    },
    routes: { admin: adminRoute },
  } = config;

  return (
    <Link
      aria-label={t("authentication:logOut")}
      className={`${baseClass}__log-out`}
      href={formatAdminURL({
        adminRoute,
        path: logoutRoute,
      })}
      prefetch={false}
      tabIndex={tabIndex}
      title={t("authentication:logOut")}
    >
      <LogOutIcon />
    </Link>
  );
};

export default LogoutButton;
