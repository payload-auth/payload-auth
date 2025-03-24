import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function NewBadge({ isSelected }: { isSelected?: boolean }) {
  return (
    <div className="flex items-center justify-end w-full">
      <Badge
        className={cn(
          " pointer-events-none !no-underline border-dashed !decoration-transparent",
          isSelected && "!border-solid"
        )}
        variant={isSelected ? "default" : "outline"}
      >
        New
      </Badge>
    </div>
  );
}
