import { useSearchContext } from 'fumadocs-ui/provider'
import { Search } from 'lucide-react'
import React from 'react'

export function SidebarSearch() {
  const { setOpenSearch } = useSearchContext()
  return (
    <button
      className="text-muted-foreground flex w-full items-center gap-2 border-b px-5 py-2.5"
      onClick={() => {
        setOpenSearch(true)
      }}>
      <Search className="mx-0.5 size-4" />
      <p className="text-sm">Search documentation...</p>
    </button>
  )
}
