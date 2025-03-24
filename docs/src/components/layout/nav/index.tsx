import Link from "next/link";
import { Logo } from "@/components/logo";
import LogoContextMenu from "@/components/ui/logo-context";
import { ThemeToggle } from "@/components/theme-toggler";
import { MobileNavbar, MobileNavbarBtn } from "./mobile";
import { DesktopNavbar } from "./desktop";
import { SearchToggle } from "./search";
import { logoAssets } from "@/config";

export function Navbar() {
  return (
    <div className="flex flex-col sticky top-0 bg-background backdrop-blur-md z-30 h-[var(--fd-nav-height)]">
      <nav className="md:grid grid-cols-12 md:border-b top-0 flex items-center justify-between ">
        <Link
          href="/"
          className="pl-5 md:pl-0 flex items-center justify-center text-foreground transition-colors h-[var(--fd-nav-height)] md:col-span-2 md:border-r md:w-[268px]"
        >
          <LogoContextMenu
            logo={
              <div className="flex items-center gap-2">
                <Logo className="size-6" />
                <p className="select-none font-medium leading-none tracking-wide">
                  PAYLOAD-AUTH.
                </p>
              </div>
            }
            logoAssets={logoAssets}
          />
        </Link>
        <div className="md:col-span-10 flex items-center justify-end relative">
          <DesktopNavbar />
          <SearchToggle />
          <ThemeToggle />
          <MobileNavbarBtn />
        </div>
      </nav>
      <MobileNavbar />
    </div>
  );
}
