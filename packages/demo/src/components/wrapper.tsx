"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { User } from "@/payload-types";
import { useRouter } from "next/navigation";

export function Wrapper(props: { children: React.ReactNode }) {
  const [impersonating, setImpersonating] = useState(false);
  const [impersonatedBy, setImpersonatedBy] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkImpersonation = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.session.impersonatedBy) {
          setImpersonating(true);
          setImpersonatedBy(session.data.session.impersonatedBy as any as User);
        } else {
          setImpersonating(false);
          setImpersonatedBy(null);
        }
      } catch (error) {
        console.error("Failed to check impersonation status:", error);
      }
    };

    checkImpersonation();
  }, []);

  const handleStopImpersonating = async () => {
    try {
      await authClient.admin.stopImpersonating();
      setImpersonating(false);
      setImpersonatedBy(null);
      router.push("/admin");
    } catch (error) {
      console.error("Failed to stop impersonating:", error);
    }
  };

  return (
    <div className="min-h-screen w-full dark:bg-zinc-950 bg-white relative flex flex-col items-center">
      {impersonating && (
        <div className="w-full bg-amber-500 dark:bg-amber-600 text-black dark:text-white py-2 px-4 text-center">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
            <span>
              You are currently impersonating a user
              {impersonatedBy && ` (admin: ${impersonatedBy.email})`}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleStopImpersonating}
              className="font-medium"
            >
              Stop Impersonating
            </Button>
          </div>
        </div>
      )}

      <div className="absolute inset-0 dark:bg-grid-small-white/[0.1] bg-grid-small-black/[0.05] pointer-events-none"></div>

      <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border-b py-3 flex justify-between items-center border-border sticky top-0 z-50 w-full px-4 md:px-8">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer transition-opacity hover:opacity-90">
            <Logo />
            <div className="flex flex-col">
              <p className="font-semibold dark:text-white text-black">
                PAYLOAD &times; BETTER-AUTH
              </p>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Seamless Authentication for Payload CMS
              </p>
            </div>
          </div>
        </Link>
        <div className="z-50 flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <main className="mt-8 w-full max-w-6xl px-4 md:px-8 flex-1">
        {props.children}
      </main>

      <footer className="w-full border-t border-border mt-16 py-6 text-center text-sm text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4">
          Payload CMS × Better Auth Integration
        </div>
      </footer>
    </div>
  );
}

const queryClient = new QueryClient();

export function WrapperWithQuery(props: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}
