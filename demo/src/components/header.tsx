import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";

export function Header() {
  return (
    <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border-b py-3 flex justify-between items-center border-border sticky top-0 z-50 w-full px-4 md:px-8">
      <Link href="/">
        <div className="flex items-center gap-3 cursor-pointer transition-opacity hover:opacity-90">
          <Logo />
          <div className="flex flex-col">
            <p className="font-semibold dark:text-white text-black">
              PAYLOAD &times; BETTER-AUTH
            </p>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Seamless Authentication for Payload CMS
            </p>
          </div>
        </div>
      </Link>
      <div className="z-50 flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
} 