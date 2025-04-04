import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SignedIn, SignedOut } from "@clerk/nextjs"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center max-w-screen-md mx-auto">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Welcome to Clerk Authentication Demo
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              A simple demonstration of authentication using Clerk in a Next.js application.
            </p>
          </div>
          <div className="space-x-4">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="outline" className="mr-4">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button>Sign Up</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/user-profile">
                <Button>View Profile</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>
    </section>
  )
}

