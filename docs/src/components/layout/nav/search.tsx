"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useSearchContext } from "fumadocs-ui/provider";

export function SearchToggle() {
  const { setOpenSearch } = useSearchContext();
  return (
    <Button
      onClick={() => setOpenSearch(true)}
      variant="ghost"
      size="icon"
      aria-label="Search"
      className={cn(
        "flex ring-0 shrink-0 md:w-[3.56rem] md:h-14 md:border-l md:text-muted-foreground max-md:-mr-1.5 max-md:hover:bg-transparent relative overflow-hidden"
      )}
    >
      <Search className="w-5 h-5" />
    </Button>
  );
}
