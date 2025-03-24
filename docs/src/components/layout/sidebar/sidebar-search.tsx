import { useSearchContext } from "fumadocs-ui/provider";
import { Search } from "lucide-react";
import React from "react";

export function SidebarSearch() {
  const { setOpenSearch } = useSearchContext();
  return (
    <button
      className="flex w-full items-center gap-2 px-5 py-2.5 border-b text-muted-foreground"
      onClick={() => {
        setOpenSearch(true);
      }}
    >
      <Search className="size-4 mx-0.5" />
      <p className="text-sm">Search documentation...</p>
    </button>
  );
}
