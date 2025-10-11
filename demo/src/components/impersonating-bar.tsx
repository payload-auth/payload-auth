'use client'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth/client'
import { useBetterAuth } from '@/lib/auth/context'
import { User } from '@/payload-types'
import { useRouter } from 'next/navigation'
import { use } from 'react'

export function ImpersonatingBar() {
  const router = useRouter()
  const { sessionPromise } = useBetterAuth()
  const session = use(sessionPromise)
  const impersonatedUser = session && 'impersonatedBy' in session?.session ? session?.user : null
  const impersonatedBy = session && 'impersonatedBy' in session?.session ? (session?.session.impersonatedBy as string) : null

  const handleStopImpersonating = async () => {
    try {
      await authClient.admin.stopImpersonating()
      router.push('/admin')
    } catch (error) {
      console.error('Failed to stop impersonating:', error)
    }
  }
  if (!impersonatedUser || !impersonatedBy) return null

  return (
    <div className="impersonating-bar fixed top-9 right-0 left-0 z-[69] w-full bg-zinc-100 px-4 py-2 text-center text-black dark:bg-zinc-900 dark:text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3">
        <span>
          You are currently impersonating {impersonatedUser?.email}
          {impersonatedBy && ` as (admin: ${impersonatedBy})`}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleStopImpersonating}
          className="cursor-pointer font-medium transition-colors duration-200 hover:bg-zinc-200 dark:hover:bg-zinc-800">
          Stop Impersonating
        </Button>
      </div>
    </div>
  )
}
