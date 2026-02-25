import { ThemeProvider } from '@/components/theme-provider'
import { createMetadata, baseUrl } from '@/lib/metadata'
import { RootProvider } from 'fumadocs-ui/provider'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { NavbarProvider } from '@/components/layout/nav/provider'
import { Navbar } from '@/components/layout/nav'
import { cn } from '@/lib/utils'

import '@/lib/styles/global.css'

export const metadata = createMetadata({
  title: {
    template: '%s | Payload Auth',
    default: 'Payload Auth'
  },
  description: 'Payload Auth is a simple, secure, and flexible authentication library for Payload CMS.',
  metadataBase: baseUrl
})

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn(GeistSans.variable, GeistMono.variable)} suppressHydrationWarning>
      <body className="bg-background relative font-sans">
        <RootProvider
          theme={{
            attribute: 'class',
            enableSystem: true,
            defaultTheme: 'dark',
            disableTransitionOnChange: true
          }}>
          <NavbarProvider>
            <Navbar />
            {children}
            <Toaster />
          </NavbarProvider>
        </RootProvider>
      </body>
    </html>
  )
}
