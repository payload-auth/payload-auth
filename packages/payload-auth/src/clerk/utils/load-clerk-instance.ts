import type { Clerk } from '@clerk/clerk-js'

declare global {
  interface Window {
    clerkInstance?: Clerk
  }
}

export async function loadClerkInstance() {
  if (typeof window === 'undefined') return
  if (window.clerkInstance) return window.clerkInstance
  const { Clerk } = await import('@clerk/clerk-js')
  const clerkInstance = new Clerk(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!)
  clerkInstance.load()
  window.clerkInstance = clerkInstance
  return clerkInstance
}
