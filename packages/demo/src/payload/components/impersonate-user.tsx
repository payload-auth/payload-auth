"use client";

import React from "react";
import type { UIFieldClientComponent } from "payload";
import { useDocumentInfo } from "@payloadcms/ui";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function ImpersonateUser(props: UIFieldClientComponent) {
  const { initialData } = useDocumentInfo();
  console.log(initialData);
  const handleImpersonate = async () => {
    try {
      // Use the auth client to impersonate the user
      await authClient.admin.impersonateUser({
        userId: initialData?.id.toString(),
        fetchOptions: {
          onSuccess() {
            // Redirect to dashboard after successful impersonation
            window.location.href = "/dashboard";
          },
          onError(error) {
            console.error("Error impersonating user:", error);
            alert("Failed to impersonate user");
          },
        },
      });
    } catch (error) {
      console.error("Error impersonating user:", error);
      alert("Failed to impersonate user");
    }
  };

  return (
    <Button
      onClick={handleImpersonate}
      className="border-[0.5px] border-gray-300 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors"
      type="button"
      aria-label={`Impersonate ${initialData?.name}`}
    >
      Impersonate {initialData?.name}
    </Button>
  );
}
