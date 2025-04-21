'use client'

import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { MotionConfig } from 'motion/react'
import { AsideLink } from '@/components/ui/aside-link'
import { sidebarTabs } from '@/config'
import { SidebarSearch } from './sidebar-search'
import { SidebarTabs } from './sidebar-tabs'
import { NewBadge } from './new-badge'
import { source } from '@/lib/source'
import { processPageTree } from '@/lib/utils'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const pageTree = source.getPageTree()

  const getCurrentGroup = useCallback(() => {
    const pathSegments = pathname.split('/')

    // Handle root path or first level paths
    if (pathSegments.length <= 2) {
      return 'docs'
    }

    // For paths like /docs/better-auth, /docs/clerk, etc.
    if (pathSegments[1] === 'docs' && pathSegments[2]) {
      const fullPath = `docs/${pathSegments[2]}`
      const matchedTab = sidebarTabs.find((tab) => tab.value === fullPath)
      return matchedTab ? matchedTab.value : 'docs'
    }

    return 'docs'
  }, [pathname])

  const [group, setGroup] = useState(getCurrentGroup)

  const pageNodes = useMemo(() => {
    return processPageTree(pageTree, group)
  }, [pageTree, group])

  // Handle tab changes
  const handleGroupChange = (newGroup: string) => {
    setGroup(newGroup)
    router.replace(`/${newGroup}`)
  }

  // Update group when pathname changes
  useEffect(() => {
    const newGroup = getCurrentGroup()
    setGroup(newGroup)
  }, [pathname, getCurrentGroup])

  return (
    <div className={cn('fixed top-0')}>
      <aside
        className={cn(
          'md:transition-all',
          `no-scrollbar mt-[var(--fd-nav-height)] hidden h-screen flex-col justify-between overflow-y-scroll border-r border-solid md:flex md:w-[268px]`
        )}>
        <div>
          <SidebarTabs group={group} setGroup={handleGroupChange} />
          <SidebarSearch />
          <MotionConfig transition={{ duration: 0.4, type: 'spring', bounce: 0 }}>
            <div className="flex flex-col">
              {pageNodes.map((node, index) => {
                switch (node.type) {
                  case 'separator':
                    return (
                      <div key={index} className="mx-5 my-2 flex items-center gap-2">
                        <span className="text-foreground text-xs font-semibold tracking-wider uppercase">{node.name}</span>
                      </div>
                    )
                  case 'page':
                    return (
                      <AsideLink key={index} href={node.url}>
                        {node.name}
                      </AsideLink>
                    )
                  case 'folder':
                    return (
                      <AsideLink key={index} href={node.index?.url || ''}>
                        {node.name}
                      </AsideLink>
                    )
                  default:
                    return null
                }
              })}
            </div>
          </MotionConfig>
        </div>
      </aside>
    </div>
  )
}
