'use client'
import type { ClassValue } from 'clsx'
import Link from 'next/link'
import { usePathname, useSelectedLayoutSegment } from 'next/navigation'

import { cn } from '@/lib/utils'

type Props = {
  href: string
  children: React.ReactNode
  className?: ClassValue
  activeClassName?: ClassValue
} & React.AnchorHTMLAttributes<HTMLAnchorElement>

export const AsideLink = ({ href, children, className, activeClassName, ...props }: Props) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        isActive ? cn('text-foreground bg-primary/10', activeClassName) : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
        'flex w-full items-center gap-x-2 rounded-sm px-5 py-1.5 text-sm transition-colors',
        'border-l-2 border-transparent pl-8',
        isActive && 'border-primary/50 border-l-2',
        'overflow-hidden break-words',
        'focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none',
        className
      )}
      {...props}>
      {children}
    </Link>
  )
}
