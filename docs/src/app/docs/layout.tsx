import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { docsOptions } from "../layout.config";
import Sidebar from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      {...docsOptions}
      sidebar={{
        component: (
          <div
            className={cn(
              "[--fd-tocnav-height:36px] md:mr-[268px] xl:[--fd-toc-width:286px] xl:[--fd-tocnav-height:0px] "
            )}
          >
            <Sidebar />
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
