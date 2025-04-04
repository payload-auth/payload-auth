import { cn } from '@/lib/utils'

export function Main({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn('my-8 flex w-full grow flex-col px-4 md:px-8', className)}>{children}</main>
}
