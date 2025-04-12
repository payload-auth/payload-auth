"use client";

import { Button, toast, useDocumentInfo, useField } from "@payloadcms/ui";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

import "./styles.css";

import "@payloadcms/ui/styles.css";

type AdminButtonsProps = {
  userSlug: string;
};

const AdminButtons: React.FC<AdminButtonsProps> = () => {
  const router = useRouter();
  const { id } = useDocumentInfo();
  const { value: isBanned } = useField({ path: "banned" });

  if (!id) {
    return null;
  }

  const authClient = createAuthClient({
    plugins: [adminClient()],
  });

  const handleImpersonate = async () => {
    await authClient.admin.impersonateUser({
      userId: String(id),
      fetchOptions: {
        onSuccess() {
          router.push("/");
        },
        onError(error: any) {
          console.error("Error impersonating user:", error);
          toast.error("Failed to impersonate user");
        },
      },
    });
  };

  const handleBan = async () => {
    await authClient.admin.banUser({
      userId: String(id),
      fetchOptions: {
        onSuccess() {
          toast.success("User banned successfully");
          router.refresh();
        },
        onError(error: any) {
          console.error("Error banning user:", error);
          toast.error("Failed to ban user");
        },
      },
    });
  };

  const handleUnban = async () => {
    await authClient.admin.unbanUser({
      userId: String(id),
      fetchOptions: {
        onSuccess() {
          toast.success("User unbanned successfully");
          router.refresh();
        },
        onError(error: any) {
          console.error("Error unbanning user:", error);
          toast.error("Failed to unban user");
        },
      },
    });
  };

  const handleRevokeAllSessions = async () => {
    await authClient.admin.revokeUserSessions({
      userId: String(id),
      fetchOptions: {
        onSuccess() {
          toast.success("All sessions revoked successfully");
          router.refresh();
        },
        onError(error: any) {
          console.error("Error revoking all sessions:", error);
          toast.error("Failed to revoke all sessions");
        },
      },
    });
  };

  return (
    <>
      <style>{`
        .doc-tabs__tabs:has(.impersonate-button) .doc-tab {
          order: 10;
        }
        .impersonate-button, .revoke-sessions-button, .ban-button, .unban-button {
          display: inline-flex;
          align-items: center;
          margin-block: 0;
          padding-block: 0.23rem;
          text-wrap: nowrap;
        }
        .ban-button {
          background-color: oklch(0.258 0.092 26.042);
          color: oklch(0.577 0.245 27.325);
          border: 1px solid oklch(0.396 0.141 25.723);
          &:hover {
            color: #fff;
            background-color: oklch(0.505 0.213 27.518);
          }
        }
        .revoke-sessions-button {
          --theme-elevation-800: oklch(0.396 0.141 25.723);
          color: oklch(0.637 0.237 25.331);
          &:hover {
            --theme-elevation-400: oklch(0.396 0.141 25.723);
            color: #fff;
            background-color: oklch(0.396 0.141 25.723);
          }
        }
      `}</style>
      <Button
        onClick={handleImpersonate}
        buttonStyle="pill"
        className="impersonate-button"
        size="medium"
      >
        Impersonate
      </Button>
      <Button
        onClick={handleRevokeAllSessions}
        buttonStyle="secondary"
        className="revoke-sessions-button"
        size="medium"
      >
        Revoke All Sessions
      </Button>
      {!isBanned ? (
        <Button
          onClick={handleBan}
          buttonStyle="error"
          className="ban-button"
          size="medium"
        >
          Ban
        </Button>
      ) : null}
      {isBanned ? (
        <Button onClick={handleUnban} buttonStyle="primary" className="unban-button" size="medium">
          Unban
        </Button>
      ) : null}
    </>
  );
};

export default AdminButtons;
