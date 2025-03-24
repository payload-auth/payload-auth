"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { AsideLink } from "@/components/ui/aside-link";
import { docLinks, exampleLinks } from "@/config";
import { ChevronDownIcon } from "lucide-react";
import { SidebarSearch } from "./sidebar-search";
import { SidebarTabs } from "./sidebar-tabs";
import { NewBadge } from "./new-badge";

export default function Sidebar() {
  const [group, setGroup] = useState("docs");
  const [currentOpen, setCurrentOpen] = useState<number>(0);

  const pathname = usePathname();

  const getDefaultValue = useCallback(() => {
    const defaultValue = docLinks.findIndex((item) =>
      item.list.some((listItem) => listItem.href === pathname)
    );
    return defaultValue === -1 ? 0 : defaultValue;
  }, [pathname]);

  useEffect(() => {
    const grp = pathname.includes("docs/examples") ? "examples" : "docs";
    setGroup(grp);
    setCurrentOpen(getDefaultValue());
  }, [pathname, getDefaultValue]);

  const cts = group === "docs" ? docLinks : exampleLinks;

  return (
    <div className={cn("fixed top-0")}>
      <aside
        className={cn(
          "md:transition-all",
          "border-r border-solid hidden md:flex overflow-y-auto absolute top-[58px] h-screen flex-col justify-between md:w-[268px]"
        )}
      >
        <div>
          <SidebarTabs group={group} setGroup={setGroup} />
          <SidebarSearch />
          <MotionConfig
            transition={{ duration: 0.4, type: "spring", bounce: 0 }}
          >
            <div className="flex flex-col">
              {cts.map((item, index) => (
                <div key={item.title}>
                  <button
                    className="border-b w-full hover:underline border-lines text-sm px-5 py-2.5 text-left flex items-center gap-2"
                    onClick={() => {
                      if (currentOpen === index) {
                        setCurrentOpen(-1);
                      } else {
                        setCurrentOpen(index);
                      }
                    }}
                  >
                    <item.Icon className="size-5" />
                    <span className="grow">{item.title}</span>
                    {item.isNew && <NewBadge />}
                    <motion.div
                      animate={{ rotate: currentOpen === index ? 180 : 0 }}
                    >
                      <ChevronDownIcon
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
                        )}
                      />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {currentOpen === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative overflow-hidden"
                      >
                        <motion.div className="text-sm">
                          {item.list.map((listItem, j) => (
                            <div key={listItem.title}>
                              <Suspense fallback={<>Loading...</>}>
                                {listItem.group ? (
                                  <div className="flex flex-row items-center gap-2 mx-5 my-1 ">
                                    <p className="text-sm text-transparent bg-gradient-to-tr dark:from-gray-100 dark:to-stone-200 bg-clip-text from-gray-900 to-stone-900">
                                      {listItem.title}
                                    </p>
                                    <div className="flex-grow h-px bg-gradient-to-r from-stone-800/90 to-stone-800/60" />
                                  </div>
                                ) : (
                                  <AsideLink
                                    href={listItem.href}
                                    startWith="/docs"
                                    title={listItem.title}
                                    className="break-words text-nowrap w-[--fd-sidebar-width] [&>div>div]:hover:!bg-fd-muted"
                                    activeClassName="[&>div>div]:!bg-fd-muted"
                                  >
                                    <div className="min-w-4">
                                      <listItem.icon className="text-stone-950 dark:text-white" />
                                    </div>
                                    {listItem.title}
                                    {listItem.isNew && <NewBadge />}
                                  </AsideLink>
                                )}
                              </Suspense>
                            </div>
                          ))}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </MotionConfig>
        </div>
      </aside>
    </div>
  );
}
