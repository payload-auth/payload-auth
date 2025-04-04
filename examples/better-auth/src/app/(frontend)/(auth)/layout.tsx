import { Toaster } from '@/components/ui/sonner'
import { Providers } from './providers'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Providers>{children}</Providers>
      <Toaster />
    </>
  )
}
