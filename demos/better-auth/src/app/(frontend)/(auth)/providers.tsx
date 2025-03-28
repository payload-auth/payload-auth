"use client"
 
import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { authClient } from "@/lib/auth/client"
import { QueryClient } from "@tanstack/react-query"
import { QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthUIProvider
        authClient={authClient}
        navigate={router.push}
        replace={router.replace}
        onSessionChange={() => { router.refresh() }}
        magicLink={true}
        providers={["google"]}
        viewPaths={{
          settings: "dashboard",
        }}
        basePath="/"
        LinkComponent={Link}
      >
        {children}
      </AuthUIProvider>
    </QueryClientProvider>
  )
}