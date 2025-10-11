'use client'

import * as React from 'react'
import { ChevronsUpDown, Plus } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { authClient, useActiveOrganization, useListOrganizations, useSession } from '@/lib/auth/client'

function getInitials(name?: string) {
  if (!name) return 'P'
  const parts = name.split(' ').filter(Boolean)
  const first = parts[0]?.[0]
  const second = parts[1]?.[0]
  return (first || 'P').toUpperCase() + (second ? second.toUpperCase() : '')
}

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { data: sessionData } = useSession()
  const { data: organizations } = useListOrganizations()
  const { data: activeOrganization } = useActiveOrganization()

  const [optimisticActive, setOptimisticActive] = React.useState<any>(activeOrganization || null)
  const [openCreate, setOpenCreate] = React.useState(false)
  const [name, setName] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [isSlugEdited, setIsSlugEdited] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)

  React.useEffect(() => {
    setOptimisticActive(activeOrganization || null)
  }, [activeOrganization])

  React.useEffect(() => {
    if (!isSlugEdited) {
      const generated = name.trim().toLowerCase().replace(/\s+/g, '-')
      setSlug(generated)
    }
  }, [name, isSlugEdited])

  const handleSetPersonal = async () => {
    setOptimisticActive(null)
    try {
      await authClient.organization.setActive({ organizationId: null })
    } catch (e) {
      // setOptimisticActive(activeOrganization || null)
    }
  }

  const handleSetActive = async (org: any) => {
    if (!org) return
    if (optimisticActive?.id?.toString() === org.id?.toString()) return
    const prev = optimisticActive
    setOptimisticActive(org)
    try {
      await authClient.organization.setActive({ organizationId: org.id?.toString?.() ?? (org.id as string) })
    } catch (e) {
      setOptimisticActive(prev || null)
    }
  }

  const handleCreate = async () => {
    if (!name || !slug) return
    setIsCreating(true)
    try {
      const { data: created } = await authClient.organization.create({ name, slug })
      if (created?.id) {
        await authClient.organization.setActive({ organizationId: created.id?.toString?.() ?? (created.id as string) })
      }
      setOpenCreate(false)
      setName('')
      setSlug('')
      setIsSlugEdited(false)
    } finally {
      setIsCreating(false)
    }
  }

  const activeName = optimisticActive?.name || 'Personal'
  const initials = getInitials(optimisticActive?.name)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <span className="text-xs font-semibold">{initials}</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeName}</span>
                <span className="truncate text-xs">{optimisticActive ? 'Workspace' : 'Personal'}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}>
            <DropdownMenuLabel className="text-muted-foreground text-xs">Workspaces</DropdownMenuLabel>
            <DropdownMenuItem className="gap-2 p-2" onClick={handleSetPersonal}>
              <div className="flex size-6 items-center justify-center rounded-md border">
                <span className="text-[10px] font-semibold">P</span>
              </div>
              Personal
            </DropdownMenuItem>
            {organizations?.map((org) => (
              <DropdownMenuItem key={org.id} className="gap-2 p-2" onClick={() => handleSetActive(org)}>
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <span className="text-[10px] font-semibold">{getInitials(org.name)}</span>
                </div>
                {org.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger asChild>
                <DropdownMenuItem className="gap-2 p-2" onSelect={(e) => e.preventDefault()}>
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">New organization</div>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="w-11/12 sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>New organization</DialogTitle>
                  <DialogDescription>Create a new organization workspace.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Name</Label>
                    <Input placeholder="Acme Inc" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Slug</Label>
                    <Input
                      placeholder="acme-inc"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value)
                        setIsSlugEdited(true)
                      }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleCreate} disabled={isCreating || !name || !slug}>
                      {isCreating ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
