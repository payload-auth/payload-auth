"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavbar } from "./provider";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { navMenu } from "@/config";
import { docLinks, exampleLinks } from "@/config";
import { motion } from "motion/react";

export function MobileNavbarBtn() {
  const { isOpen, toggleNavbar } = useNavbar();

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const transition = { duration: 0.3, ease: [0.6, 0.05, 0.01, 0.9] as const };

  return (
    <motion.button
      onClick={toggleNavbar}
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      className="relative px-2.5 focus:outline-none mr-2 block md:hidden overflow-hidden"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <div className="w-5 h-5 relative">
        <motion.div
          className="absolute w-full h-0.5 bg-foreground/80 rounded-lg origin-center"
          initial={{ top: 0 }}
          animate={{
            top: isOpen ? "50%" : 0,
            y: isOpen ? "-50%" : 0,
            rotate: isOpen ? 45 : 0,
          }}
          transition={transition}
        />
        <motion.div
          className="absolute w-full h-0.5 bg-foreground/80 rounded-lg top-1/2 -mt-0.25 origin-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        />
        <motion.div
          className="absolute w-full h-0.5 bg-foreground/80 rounded-lg origin-center"
          initial={{ bottom: 0 }}
          animate={{
            bottom: isOpen ? "50%" : 0,
            y: isOpen ? "50%" : 0,
            rotate: isOpen ? -45 : 0,
          }}
          transition={transition}
        />
      </div>
    </motion.button>
  );
}

export function MobileNavbar() {
  const { isOpen, toggleNavbar } = useNavbar();
  const pathname = usePathname();
  const isDocs = pathname.startsWith("/docs");

  return (
    <div
      className={cn(
        "fixed top-[50px] inset-x-0 transform-gpu z-[100] bg-background grid grid-rows-[0fr] duration-300 transition-all md:hidden",
        isOpen &&
          "shadow-lg border-b border-[rgba(255,255,255,.1)] grid-rows-[1fr]"
      )}
    >
      <div
        className={cn(
          "px-9 min-h-0 overflow-y-auto max-h-[80vh] divide-y [mask-image:linear-gradient(to_top,transparent,white_40px)] transition-all duration-300",
          isOpen ? "py-5" : "invisible",
          isDocs && "px-4"
        )}
      >
        {navMenu.map((menu) => (
          <Fragment key={menu.name}>
            {menu.child ? (
              <Accordion type="single" collapsible>
                <AccordionItem value={menu.name}>
                  <AccordionTrigger
                    className={cn(
                      "font-normal text-foreground",
                      !isDocs && "text-2xl"
                    )}
                  >
                    {menu.name}
                  </AccordionTrigger>
                  <AccordionContent className="pl-5 divide-y">
                    {menu.child.map((child) => (
                      <Link
                        href={child.path}
                        key={child.name}
                        className={cn(
                          "block py-2 border-b first:pt-0 last:pb-0 last:border-0 text-muted-foreground",
                          !isDocs && "text-xl"
                        )}
                        onClick={toggleNavbar}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <Link
                href={menu.path}
                className={cn(
                  "group flex items-center gap-2.5 first:pt-0 last:pb-0 text-2xl py-4",
                  isDocs && "text-base py-2"
                )}
                onClick={toggleNavbar}
              >
                {isDocs && (
                  <ChevronRight className="ml-0.5 size-4 text-muted-foreground md:hidden" />
                )}
                {menu.name}
              </Link>
            )}
          </Fragment>
        ))}
        <DocsNavBarContent />
      </div>
    </div>
  );
}

function DocsNavBarContent() {
  const pathname = usePathname();
  const { toggleNavbar } = useNavbar();

  if (!pathname.startsWith("/docs")) return null;

  const content = pathname.startsWith("/docs/examples")
    ? exampleLinks
    : docLinks;

  return (
    <>
      {content.map((menu) => (
        <Accordion type="single" collapsible key={menu.title}>
          <AccordionItem value={menu.title}>
            <AccordionTrigger className="font-normal text-foreground">
              <div className="flex items-center gap-2">
                {!!menu.Icon && <menu.Icon className="w-5 h-5" />}
                {menu.title}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-5 divide-y">
              {menu.list.map((child) => (
                <Link
                  href={child.href}
                  key={child.title}
                  className="block py-2 text-sm border-b first:pt-0 last:pb-0 last:border-0 text-muted-foreground"
                  onClick={toggleNavbar}
                >
                  {child.group ? (
                    <div className="flex flex-row items-center gap-2 ">
                      <div className="flex-grow h-px bg-gradient-to-r from-stone-800/90 to-stone-800/60" />
                      <p className="text-sm text-transparent bg-gradient-to-tr dark:from-gray-100 dark:to-stone-200 bg-clip-text from-gray-900 to-stone-900">
                        {child.title}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <child.icon />
                      {child.title}
                    </div>
                  )}
                </Link>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </>
  );
}
