import { cn } from "@/lib/utils";

export function Main({ children, className }: { children: React.ReactNode, className?: string }) {
  return <main className={cn("my-8 w-full px-4 md:px-8 flex flex-col grow", className)}>{children}</main>;
}
