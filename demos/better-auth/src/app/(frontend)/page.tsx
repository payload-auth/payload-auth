import { SignInButton } from "@/components/sign-in-btn";
import Link from "next/link";
export default function Home() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 md:px-8">
      <div className="flex flex-col gap-6 items-center justify-center w-full">
        <div className="flex flex-col gap-3 items-center text-center">
          <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl text-foreground bg-clip-text">
            Better Auth x Payload CMS
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            A powerful authentication solution for your Payload CMS projects
          </p>
        </div>
        <div className="w-full max-w-md mx-auto mt-4 flex gap-2 justify-center">
          <SignInButton />
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/90 h-9 px-3 py-1 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-7 14H5v-2h7zm7-4H5v-2h14zm0-4H5V7h14z"
              />
            </svg>
            Admin
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
          <div className="p-6 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
            <h3 className="font-medium text-lg mb-2">Secure</h3>
            <p className="text-muted-foreground text-sm">
              Industry-standard authentication protocols with enhanced security
              features
            </p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
            <h3 className="font-medium text-lg mb-2">Flexible</h3>
            <p className="text-muted-foreground text-sm">
              Customizable authentication flows to match your application needs
            </p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
            <h3 className="font-medium text-lg mb-2">Seamless</h3>
            <p className="text-muted-foreground text-sm">
              Integrates perfectly with Payload CMS and your existing workflow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
