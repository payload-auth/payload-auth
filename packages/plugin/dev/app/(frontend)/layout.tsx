import './globals.css'

import React from 'react'
import { PayloadAdminBar } from '@payloadcms/admin-bar'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <PayloadAdminBar />
        {children}
      </body>
    </html>
  )
}
