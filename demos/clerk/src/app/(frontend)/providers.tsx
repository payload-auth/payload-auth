import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from 'next-themes'
import { dark } from '@clerk/themes'
import type { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </ClerkProvider>
  )
}
