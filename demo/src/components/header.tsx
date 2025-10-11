import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { Logo } from './logo'

export function Header() {
  return (
    <header className="site-header border-border sticky top-0 z-50 flex w-full items-center justify-between border-b bg-white/80 px-4 py-3 backdrop-blur-sm md:px-8 dark:bg-zinc-950/80">
      <Link href="/">
        <div className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90">
          <Logo />
          <div className="flex flex-col">
            <p className="font-semibold text-black dark:text-white">PAYLOAD &times; BETTER-AUTH</p>
            <p className="text-muted-foreground hidden text-xs sm:block">Seamless Authentication for Payload CMS</p>
          </div>
        </div>
      </Link>
      <div className="z-50 flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  )
}
