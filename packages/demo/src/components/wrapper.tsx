"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Wrapper(props: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full dark:bg-zinc-950 bg-white relative flex flex-col items-center">
      {/* <div className="absolute pointer-events-none inset-0 md:flex items-center justify-center dark:bg-zinc-950 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)] hidden"></div> */}

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
