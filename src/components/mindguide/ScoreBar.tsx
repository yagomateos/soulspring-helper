import { cn } from "@/lib/utils";
import type { DimensionScore } from "@/lib/mindguide/types";

const LEVEL_TEXT: Record<DimensionScore["level"], string> = {
  bajo: "Necesita atención",
  moderado: "En equilibrio parcial",
  alto: "En buen estado",
};

export function ScoreBar({ score }: { score: DimensionScore }) {
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="truncate font-medium">{score.label}</p>
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
            score.level === "alto" && "bg-mint-soft text-secondary-foreground",
            score.level === "moderado" && "bg-primary-soft text-primary",
            score.level === "bajo" && "bg-destructive/10 text-destructive",
          )}
        >
          {LEVEL_TEXT[score.level]}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-all duration-700"
          style={{ width: `${Math.max(score.score, 4)}%` }}
        />
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{score.summary}</p>
    </div>
  );
}