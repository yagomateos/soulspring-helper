import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { PremiumBadge } from "@/components/mc/PremiumBadge";
import type { ContentItem } from "@/lib/data/content";

export function ContentCard({
  content,
  categoryName,
}: {
  content: ContentItem;
  categoryName?: string | undefined;
}) {
  return (
    <Link
      to="/biblioteca/$slug"
      params={{ slug: content.slug }}
      className="animate-rise flex h-full flex-col gap-3 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          {categoryName ? (
            <span className="inline-flex rounded-full bg-mint-soft px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
              {categoryName}
            </span>
          ) : null}
          <h3 className="font-display text-base font-semibold">{content.title}</h3>
        </div>
        {content.access_level === "PREMIUM" ? <PremiumBadge /> : null}
      </div>

      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{content.description}</p>

      {content.duration_minutes ? (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" /> {content.duration_minutes} min
        </span>
      ) : null}
    </Link>
  );
}
