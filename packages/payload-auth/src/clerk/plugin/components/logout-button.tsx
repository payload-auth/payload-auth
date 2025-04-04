"use client";

import type { Clerk } from "@clerk/clerk-js";
import { LogOutIcon, useAuth, useTranslation } from "@payloadcms/ui";
import { useEffect, useState } from "react";
import { loadClerkInstance } from "../../utils/load-clerk-instance";

export const LogoutButton = () => {
  const [clerkInstance, setClerkInstance] = useState<Clerk | undefined>(
    undefined
  );
  const { logOut } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    loadClerkInstance()
      .then((instance) => {
        setClerkInstance(instance);
      })
      .catch((err: any) => console.error("Error loading clerk:", err));
  }, []);

  return (
    <button
      aria-label={t("authentication:logOut")}
      className={`nav__log-out`}
      style={{
        background: "transparent",
        border: "1px solid var(--theme-elevation-100)",
        width: "34px",
        height: "34px",
        borderRadius: "9999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        WebkitAppearance: "none",
        cursor: "pointer",
        padding: "7px",
      }}
      onClick={async () => {
        if (!clerkInstance) return;
        try {
          if (clerkInstance.user) {
            await clerkInstance.signOut();
          }
          if (logOut) {
            await logOut();
          }
          window.location.reload();
        } catch (err) {
          console.error("Error logging out:", err);
        }
      }}
    >
      <LogOutIcon />
    </button>
  );
};
