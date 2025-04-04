"use client";
import React from "react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

export default function LogoutButton() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const handleLogout = async () => {
    setLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onResponse: () => {
            setLoading(false);
          },
          onError: () => {
            setLoading(false);
          },
          onSuccess: () => {
            router.refresh();
          },
        },
      });
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      className="border-none bg-transparent"
    >
      {loading ? (
        <Loader2 className="animate-spin h-8 w-8" />
      ) : (
        <LogOut className="h-8 w-8" />
      )}
    </Button>
  );
}
