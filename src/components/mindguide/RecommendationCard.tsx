import {
  Bookmark,
  BookmarkCheck,
  Brain,
  Clock,
  DoorClosed,
  Footprints,
  HeartHandshake,
  ListChecks,
  MessageCircleHeart,
  Moon,
  NotebookPen,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Recommendation } from "@/lib/mindguide/types";

const ICONS: Record<string, LucideIcon> = {
  wind: Wind,
  brain: Brain,
  "notebook-pen": NotebookPen,
  footprints: Footprints,
  "list-checks": ListChecks,
  moon: Moon,
  "heart-handshake": HeartHandshake,
  "door-closed": DoorClosed,
  "message-circle-heart": MessageCircleHeart,
};

export function RecommendationCard({
  recommendation,
  saved,
  onToggleSave,
}: {
  recommendation: Recommendation;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const Icon = ICONS[recommendation.icon] ?? Brain;

  return (
    <article className="surface-card flex h-full flex-col gap-4 p-6 transition-transform hover:-translate-y-1">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-calm text-primary">
          <Icon className="size-5" />
        </span>
        <h3 className="min-w-0 text-lg font-semibold">{recommendation.title}</h3>
      </div>
      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
        {recommendation.description}
      </p>
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          <Clock className="size-3.5" /> {recommendation.minutes} min
        </span>
        <Button variant={saved ? "mint" : "soft"} size="sm" onClick={onToggleSave}>
          {saved ? <BookmarkCheck /> : <Bookmark />}
          {saved ? "Guardada" : "Guardar"}
        </Button>
      </div>
    </article>
  );
}