'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useNavbar } from './provider'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Fragment, useCallback, useState, useMemo } from 'react'
import { navMenu, sidebarTabs } from '@/config'
import { motion } from 'motion/react'
import { source } from '@/lib/source'
import { processPageTree } from '@/lib/utils'
import { AsideLink } from '@/components/ui/aside-link'

export function MobileNavbarBtn() {
  const { isOpen, toggleNavbar } = useNavbar()

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  }

  const transition = { duration: 0.3, ease: [0.6, 0.05, 0.01, 0.9] }

  return (
    <motion.button
      onClick={toggleNavbar}
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      className="relative mr-2 block overflow-hidden px-2.5 focus:outline-none md:hidden"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}>
      <div className="relative h-5 w-5">
        <motion.div
          className="bg-foreground/80 absolute h-0.5 w-full origin-center rounded-lg"
          initial={{ top: 0 }}
          animate={{
            top: isOpen ? '50%' : 0,
            y: isOpen ? '-50%' : 0,
            rotate: isOpen ? 45 : 0
          }}
          transition={transition}
        />
        <motion.div
          className="bg-foreground/80 absolute top-1/2 -mt-0.25 h-0.5 w-full origin-center rounded-lg"
          initial={{ opacity: 1 }}
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        />
        <motion.div
          className="bg-foreground/80 absolute h-0.5 w-full origin-center rounded-lg"
          initial={{ bottom: 0 }}
          animate={{
            bottom: isOpen ? '50%' : 0,
            y: isOpen ? '50%' : 0,
            rotate: isOpen ? -45 : 0
          }}
          transition={transition}
        />
      </div>
    </motion.button>
  )
}

export function MobileNavbar() {
  const { isOpen, toggleNavbar } = useNavbar()
  const pathname = usePathname()
  const isDocs = pathname.startsWith('/docs')

  return (
    <div
      className={cn(
        'bg-background fixed inset-x-0 top-[50px] z-[100] grid transform-gpu grid-rows-[0fr] transition-all duration-300 md:hidden',
        isOpen && 'grid-rows-[1fr] border-b border-[rgba(255,255,255,.1)] shadow-lg'
      )}>
      <div
        className={cn(
          `max-h-[80vh] min-h-0 divide-y overflow-y-auto [mask-image:linear-gradient(to_top,transparent,white_40px)] px-9 transition-all duration-300`,
          isOpen ? 'py-5' : 'invisible',
          isDocs && 'px-4'
        )}>
        {navMenu.map((menu) => (
          <Fragment key={menu.name}>
            <Link
              href={menu.path}
              className={cn('group flex items-center gap-2.5 py-4 text-2xl first:pt-0 last:pb-0', isDocs && 'py-2 text-base')}
              onClick={toggleNavbar}>
              {menu.name}
            </Link>
          </Fragment>
        ))}
        <DocsNavBarContent />
      </div>
    </div>
  )
}

function DocsNavBarContent() {
  const pathname = usePathname()
  const pageTree = source.getPageTree()
  const { toggleNavbar } = useNavbar()
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

  const group = getCurrentGroup()

  const pageNodes = useMemo(() => {
    return processPageTree(pageTree, group)
  }, [pageTree, group])

  if (!pathname.startsWith('/docs')) return null

  return (
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
              <AsideLink key={index} href={node.url} onClick={toggleNavbar}>
                {node.name}
              </AsideLink>
            )
          case 'folder':
            return (
              <AsideLink key={index} href={node.index?.url || ''} onClick={toggleNavbar}>
                {node.name}
              </AsideLink>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
