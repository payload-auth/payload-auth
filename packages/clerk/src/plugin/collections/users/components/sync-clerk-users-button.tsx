"use client";

import { Button, toast } from "@payloadcms/ui";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type { SyncClerkUsersResponse } from "../endpoints/sync-from-clerk";

export const SyncClerkUsersButton = ({
  userCollectionSlug,
  apiBasePath,
  adminBasePath,
}: {
  userCollectionSlug: string;
  apiBasePath: string;
  adminBasePath: string;
}) => {
  const [isPending, setIsPending] = useState(false);
  const path = usePathname();

  if (`${adminBasePath}/collections/${userCollectionSlug}` !== path) return null;

  const handleSync = async () => {
    setIsPending(true);

    try {
      const response = await fetch(
        `${apiBasePath}/${userCollectionSlug}/sync-from-clerk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result: SyncClerkUsersResponse = await response.json();

      if (result.success) {
        toast.success(result.message || `Successfully synced users from Clerk`, { duration: 5000 });
      } else {
        toast.error(result.error || "Failed to sync users from Clerk", { duration: 5000 });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error syncing users from Clerk", { duration: 5000 });
      console.error("Error syncing users:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        className="sync-clerk-users-button"
        disabled={isPending}
        onClick={handleSync}
      >
        {isPending ? "Syncing..." : "Sync Users"}
      </Button>

      <style>
        {`
        .list-header:has(.collection-list__sub-header .sync-clerk-users-button) {
          display: flex;
          align-items: center;
        }

        .list-header:has(.collection-list__sub-header .sync-clerk-users-button) .collection-list__sub-header {
          margin-left: auto;
          display: flex;
          justify-content: flex-start;
          flex-basis: 100%;
        }
        .list-header:has(.collection-list__sub-header .sync-clerk-users-button) .btn {
          flex-shrink: 0;
          margin-bottom: 0;
        }
        @media (min-width: 768px) {
          .list-header:has(.collection-list__sub-header .sync-clerk-users-button) .collection-list__sub-header {
            flex-basis: 70%;
            justify-content: flex-end;
          }
        }
        `}
      </style>
    </>
  );
};
