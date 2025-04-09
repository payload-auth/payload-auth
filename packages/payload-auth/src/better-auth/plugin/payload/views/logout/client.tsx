"use client";

import {
  Button,
  LoadingOverlay,
  toast,
  useAuth,
  useRouteTransition,
  useTranslation,
} from "@payloadcms/ui";
import { useRouter } from "next/navigation.js";
import { formatAdminURL } from "payload/shared";
import React, { useEffect } from "react";

import "./index.scss";
import { createAuthClient } from "better-auth/react";

const baseClass = "logout";

export const LogoutClient: React.FC<{
  adminRoute: string;
  inactivity?: boolean;
  redirect: string;
}> = (props) => {
  const { adminRoute, inactivity, redirect } = props;

  const { user } = useAuth();

  const { startRouteTransition } = useRouteTransition();

  const [isLoggedOut, setIsLoggedOut] = React.useState<boolean>(!user);

  const logOutSuccessRef = React.useRef(false);

  const [loginRoute] = React.useState(() =>
    formatAdminURL({
      adminRoute,
      path: `/login${
        inactivity && redirect && redirect.length > 0
          ? `?redirect=${encodeURIComponent(redirect)}`
          : ""
      }`,
    })
  );

  const { t } = useTranslation();
  const router = useRouter();
  const authClient = createAuthClient({});

  const handleLogOut = React.useCallback(async () => {
    const loggedOut = await authClient.signOut();
    setIsLoggedOut(loggedOut.data?.success ?? false);

    if (!inactivity && loggedOut && !logOutSuccessRef.current) {
      toast.success(t("authentication:loggedOutSuccessfully"));
      logOutSuccessRef.current = true;
      startRouteTransition(() => router.push(loginRoute));
      return;
    }
  }, [inactivity, authClient, loginRoute, router, startRouteTransition, t]);

  useEffect(() => {
    if (!isLoggedOut) {
      void handleLogOut();
    } else {
      startRouteTransition(() => router.push(loginRoute));
    }
  }, [handleLogOut, isLoggedOut, loginRoute, router, startRouteTransition]);

  if (isLoggedOut && inactivity) {
    return (
      <div className={`${baseClass}__wrap`}>
        <h2>{t("authentication:loggedOutInactivity")}</h2>
        <Button buttonStyle="secondary" el="link" size="large" url={loginRoute}>
          {t("authentication:logBackIn")}
        </Button>
      </div>
    );
  }

  return (
    <LoadingOverlay
      animationDuration={"0ms"}
      loadingText={t("authentication:loggingOut")}
    />
  );
};
