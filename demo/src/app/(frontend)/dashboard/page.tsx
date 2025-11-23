'use client'

import { authClient } from '@/lib/auth/client'
import { useBetterAuth } from '@/lib/auth/context'
import { use } from 'react'

function getInitials(name?: string) {
  if (!name) return 'P'
  const parts = name.split(' ').filter(Boolean)
  const first = parts[0]?.[0]
  const second = parts[1]?.[0]
  return (first || 'P').toUpperCase() + (second ? second.toUpperCase() : '')
}

export default function DashboardPage() {
  const { sessionPromise } = useBetterAuth()
  const session = use(sessionPromise)

  const user = session?.user
  const { data: organizations, isPending: organizationsPending } = authClient.useListOrganizations()

  return (
    <main className="bg-muted flex min-h-screen w-full items-center justify-center">
      <div className="bg-background container mx-auto my-12 max-w-fit space-y-8 rounded-lg p-8 shadow-lg">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Better Auth x Payload CMS</h1>
          <p className="text-muted-foreground">
            Explore authentication features and seamless org/team switching—built with{' '}
            <span className="font-semibold">better-auth</span>.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="flex gap-4 justify-center">
          <div className="bg-card flex flex-col items-center rounded-lg border p-4 min-w-[120px]">
            <div className="text-2xl font-bold">{getInitials(user?.name) ?? '—'}</div>
            <div className="text-muted-foreground mt-1 text-xs">User Initials</div>
          </div>
          <div className="bg-card flex flex-col items-center rounded-lg border p-4 min-w-[120px]">
            <div className="text-2xl font-bold whitespace-nowrap">{user?.role?.join(', ')}</div>
            <div className="text-muted-foreground mt-1 text-xs">Role</div>
          </div>
          <div className="bg-card flex flex-col items-center rounded-lg border p-4 min-w-[120px]">
            <div className="text-2xl font-bold">
              {Array.isArray(organizations) ? organizations.length : '–'}
            </div>
            <div className="text-muted-foreground mt-1 text-xs">Organizations</div>
          </div>
        </div>
      </div>
    </main>
  )
}
