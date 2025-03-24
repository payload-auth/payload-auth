import { NavLink } from "./nav-link";
import { navMenu } from "@/config";
import { Icons } from "@/components/ui/icons";

export function DesktopNavbar() {
  return (
    <ul className="md:flex items-center divide-x w-max hidden shrink-0">
      {navMenu.map((menu) => (
        <NavLink key={menu.name} href={menu.path}>
          {menu.name}
        </NavLink>
      ))}
      <NavLink
        href="https://github.com/forrestdevs/payload-better-auth"
        className="bg-muted/20 h-[var(--fd-nav-height)]"
        external
      >
        <Icons.github2 className="w-5 h-5" />
      </NavLink>
    </ul>
  );
}
