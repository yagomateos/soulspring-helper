import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PremiumBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn("gap-1 border-transparent bg-primary-soft text-primary", className)}
    >
      <Sparkles className="size-3" />
      Premium
    </Badge>
  );
}
