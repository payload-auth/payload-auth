"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function GradientBG({
  children,
  className,
  ...props
}: React.PropsWithChildren<
  {
    className?: string;
  } & React.HTMLAttributes<HTMLElement>
>) {
  return (
    <div
      className={cn(
        "relative flex content-center transition duration-300 items-center flex-col flex-nowrap h-min justify-center overflow-visible p-px decoration-clone w-full"
      )}
      {...props}
    >
      <div className={cn("w-auto z-10 px-4 py-2 rounded-none", className)}>
        {children}
      </div>
      <div
        className={cn(
          "flex-none inset-0 overflow-hidden absolute z-0 rounded-none bg-gradient-to-tl from-primary/10 via-secondary/20 to-background dark:from-primary/20 dark:via-secondary/10 dark:to-background blur-sm opacity-70"
        )}
      />
      <div className="bg-background/90 dark:bg-background/95 absolute z-1 flex-none inset-[1px] backdrop-blur-sm" />
    </div>
  );
}
