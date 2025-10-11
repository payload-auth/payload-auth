'use client'

import { cn } from '@/lib/utils'
import type { User } from '@/payload-types'
import { CircleUserRound, LayoutDashboard, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from './actions'

interface AdminBarClientProps {
  user: User
  isPreviewMode: boolean
  userCollectionSlug: string
  icons?: boolean
}

export function AdminBarClient({ user, isPreviewMode, userCollectionSlug, icons = true }: AdminBarClientProps) {
  const router = useRouter()
  const pathName = usePathname()

  const handleExitPreview = async () => {
    await fetch('/next/exit-preview').catch(() => null)
    router.push('/')
    router.refresh()
  }

  const linkClasses = 'inline-flex items-center gap-2 hover:text-zinc-300 cursor-pointer py-2 shrink-0'

  return (
    <div className="admin-bar border-border bg-background text-foreground fixed top-0 right-0 left-0 z-[70] h-9 w-full border-b text-sm">
      <div className="container ms-auto flex max-w-screen-xl flex-wrap items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/admin" className={linkClasses}>
            {icons && <LayoutDashboard className="h-4 w-4" />}
            Dashboard
          </Link>
          <Link href={`/admin/collections/${userCollectionSlug}/${user.id}`} className={linkClasses}>
            {icons && <CircleUserRound className="h-4 w-4" />}
            {user.email}
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {isPreviewMode && (
            <button onClick={handleExitPreview} className={cn('hover:text-zinc-300', 'transition-colors')}>
              Exit Preview
            </button>
          )}
          <button type="submit" onClick={() => logout({ redirectTo: pathName })} className={linkClasses}>
            {icons && <LogOut className="h-4 w-4" />}
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
