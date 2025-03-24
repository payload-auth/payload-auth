import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { sidebarTabs } from "@/config";
import { useRouter } from "next/navigation";

export function SidebarTabs({
  group,
  setGroup,
}: {
  group: string;
  setGroup: (group: string) => void;
}) {
  const router = useRouter();
  const selected = sidebarTabs.find((tab) => tab.value === group);

  return (
    <Select
      value={group}
      onValueChange={(val) => {
        setGroup(val);
        if (val === "docs") {
          router.push("/docs/introduction");
        } else {
          router.push("/docs/examples/next-js");
        }
      }}
    >
      <SelectTrigger className="p-7  border-0 border-b rounded-none transition-colors hover:bg-accent/50 w-full">
        {selected ? (
          <div className="flex flex-col gap-0.5 items-start w-full">
            <div className="flex items-center gap-2 font-medium w-full">
              {selected.icon}
              <span>{selected.title}</span>
            </div>
            <p className="text-xs text-muted-foreground tracking-wide">
              {selected.description}
            </p>
          </div>
        ) : null}
      </SelectTrigger>
      <SelectContent>
        {sidebarTabs.map((tab) => (
          <SelectItem
            key={tab.value}
            value={tab.value}
            className="h-12 flex flex-col items-start gap-1"
          >
            <div className="flex items-center gap-1">
              {tab.icon}
              {tab.title}
            </div>
            <p className="text-xs text-muted-foreground">{tab.description}</p>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
