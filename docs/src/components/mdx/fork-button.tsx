import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { ExternalLink } from "lucide-react";

export function ForkButton({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 my-2">
      <Link href={`https://codesandbox.io/p/github/${url}`} target="_blank">
        <Button className="gap-2" variant="outline" size="sm">
          <ExternalLink size={12} />
          Open in Stackblitz
        </Button>
      </Link>
      <Link href={`https://github.com/${url}`} target="_blank">
        <Button className="gap-2" variant="secondary" size="sm">
          <Icons.github2 className="size-4" />
          View on GitHub
        </Button>
      </Link>
    </div>
  );
}
