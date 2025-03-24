import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { source } from "@/lib/source";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    enabled: false,
  },
};

export const docsOptions = {
  ...baseOptions,
  tree: source.pageTree,
};
