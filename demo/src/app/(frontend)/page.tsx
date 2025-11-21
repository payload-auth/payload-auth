import { SignInButton } from '@/components/sign-in-btn'
import Link from 'next/link'

export default async function Home() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center overflow-hidden px-4 sm:px-6 md:px-8">
      <div className="flex w-full flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-foreground bg-clip-text text-3xl font-bold sm:text-4xl md:text-5xl">Better Auth x Payload CMS</h1>
          <p className="text-muted-foreground max-w-md text-lg">A powerful authentication solution for your Payload CMS projects</p>
        </div>
        <div className="mx-auto mt-4 flex w-full max-w-md justify-center gap-2">
          <SignInButton />
          <Link
            href="/admin"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 inline-flex h-9 items-center gap-2 rounded-md px-3 py-1 text-sm font-medium transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-7 14H5v-2h7zm7-4H5v-2h14zm0-4H5V7h14z"
              />
            </svg>
            Admin
          </Link>
        </div>
        <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border-border bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-medium">Secure</h3>
            <p className="text-muted-foreground text-sm">Industry-standard authentication protocols with enhanced security features</p>
          </div>
          <div className="border-border bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-medium">Flexible</h3>
            <p className="text-muted-foreground text-sm">Customizable authentication flows to match your application needs</p>
          </div>
          <div className="border-border bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-medium">Seamless</h3>
            <p className="text-muted-foreground text-sm">Integrates perfectly with Payload CMS and your existing workflow</p>
          </div>
        </div>
      </div>
    </div>
  )
}
