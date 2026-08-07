import { Bookmark, BookmarkCheck, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/mc/exercises";
import type { Exercise } from "@/lib/mc/types";

export function ExerciseCard({
  exercise,
  saved,
  onToggleSave,
  onComplete,
  onOpen,
}: {
  exercise: Exercise;
  saved?: boolean;
  onToggleSave?: () => void;
  onComplete?: () => void;
  onOpen?: () => void;
}) {
  return (
    <article className="animate-rise flex h-full flex-col gap-3 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="inline-flex rounded-full bg-mint-soft px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
            {CATEGORY_LABELS[exercise.category]}
          </span>
          <h3 className="font-display text-base font-semibold">{exercise.title}</h3>
        </div>
        {onToggleSave ? (
          <button
            onClick={onToggleSave}
            aria-label={saved ? "Quitar de guardados" : "Guardar ejercicio"}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {saved ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4" />}
          </button>
        ) : null}
      </div>

      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{exercise.description}</p>

      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" /> {exercise.minutes} min
        </span>
        <div className="flex gap-2">
          {onOpen ? (
            <Button size="sm" variant="soft" onClick={onOpen}>
              Ver pauta
            </Button>
          ) : null}
          {onComplete ? (
            <Button size="sm" variant="ghost" onClick={onComplete}>
              <Check className="size-4" /> Hecho
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}