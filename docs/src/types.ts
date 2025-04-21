import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { SVGProps } from "react";

export interface DocLink {
  title: string;
  href?: string;
  Icon?: ((props?: SVGProps<any>) => ReactNode) | LucideIcon;
  isNew?: boolean;
  isSingle?: boolean;
  list?: {
    title: string;
    href: string;
    icon: ((props?: SVGProps<any>) => ReactNode) | LucideIcon;
    group?: boolean;
    isNew?: boolean;
  }[];
}

export interface NavItem {
  name: string;
  path: string;
  child?: NavItem[];
}
