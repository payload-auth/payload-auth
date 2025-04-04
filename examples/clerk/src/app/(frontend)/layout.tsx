import '@/styles/app.css'
import React from "react";
import Providers from "./providers";
import { Inter } from "next/font/google"
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Clerk Auth Demo",
  description: "A demo application showcasing Clerk authentication",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} dark`}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
