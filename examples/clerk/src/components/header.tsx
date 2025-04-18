import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'
import { ThemeToggle } from './theme-toggle'

export function Header() {
  return (
    <header className="border-border border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Clerk Demo
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link href="/" className="hover:text-primary text-sm font-medium transition-colors">
              Home
            </Link>
            <SignedIn>
              <Link href="/user-profile" className="hover:text-primary text-sm font-medium transition-colors">
                Profile
              </Link>
            </SignedIn>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button variant="secondary">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button>Sign Up</Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </header>
  )
}
