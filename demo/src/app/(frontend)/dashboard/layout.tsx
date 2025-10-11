import { getPayload } from '@/lib/payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export default async function DashboardPage({ children }: { children: React.ReactNode }) {
  const payload = await getPayload()
  const session = await payload.betterAuth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect('/auth/sign-in')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
