"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyProps extends React.HTMLAttributes<HTMLButtonElement> {
  text: string;
  className?: string;
  iconClassName?: string;
  displayText?: boolean;
}

export function CopyButton({
  text,
  className,
  iconClassName,
  displayText = false,
  ...props
}: CopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className={cn(
        "inline-flex items-center gap-1 rounded-md p-1.5 text-sm transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy to clipboard"}
      {...props}
    >
      {copied ? (
        <Check className={cn("h-4 w-4", iconClassName)} />
      ) : (
        <Copy className={cn("h-4 w-4", iconClassName)} />
      )}
      {displayText && <span>{copied ? "Copied!" : "Copy"}</span>}
    </button>
  );
}
