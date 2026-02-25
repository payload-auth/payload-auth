import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function NewBadge({ isSelected }: { isSelected?: boolean }) {
  return (
    <div className="flex w-full items-center justify-end">
      <Badge
        className={cn('pointer-events-none border-dashed !no-underline !decoration-transparent', isSelected && '!border-solid')}
        variant={isSelected ? 'default' : 'outline'}>
        New
      </Badge>
    </div>
  )
}
