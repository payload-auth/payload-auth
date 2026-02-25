import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { sidebarTabs } from '@/config'

export function SidebarTabs({ group, setGroup }: { group: string; setGroup: (group: string) => void }) {
  const selected = sidebarTabs.find((tab) => tab.value === group) ?? sidebarTabs[0]

  return (
    <Select
      value={group}
      onValueChange={(val) => {
        setGroup(val)
      }}>
      <SelectTrigger className="hover:bg-accent/50 focus-visible:ring-border w-full rounded-none border-0 border-b p-7 py-8 shadow-none transition-colors focus-visible:ring-0">
        <div className="flex flex-col items-start gap-2">
          <selected.icon />
          <span className="text-muted-foreground text-xs">{selected.description}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {sidebarTabs.map((tab) => (
          <SelectItem key={tab.value} value={tab.value} className="py-2">
            <div className="flex flex-col items-start gap-2">
              <tab.icon />
              <span className="text-muted-foreground text-xs">{tab.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
