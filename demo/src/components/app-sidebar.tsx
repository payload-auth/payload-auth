'use client'

import * as React from 'react'
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Building2,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  User2
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { useBetterAuth } from '@/lib/auth/context'
import { use } from 'react'

const navMain = [
  {
    title: 'Home',
    url: '/dashboard',
    icon: Frame
  },
  {
    title: 'Admin',
    url: '/dashboard/admin',
    icon: User2
  },
  {
    title: 'Organization',
    url: '/dashboard/organization',
    icon: Building2
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings2
  }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentUserPromise } = useBetterAuth()
  const user = use(currentUserPromise)
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: user?.name || '', email: user?.email || '', avatar: user?.image || '' }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
