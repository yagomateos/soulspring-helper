import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Disclaimer } from "@/components/mc/Disclaimer";
import { ExerciseCard } from "@/components/mc/ExerciseCard";
import { PageHeading, PageShell } from "@/components/mc/PageShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CATEGORY_LABELS } from "@/lib/mc/exercises";
import { actions, selectExercises, selectSaved, useAppState } from "@/lib/mc/store";
import type { Exercise, ExerciseCategory } from "@/lib/mc/types";

export const Route = createFileRoute("/recomendaciones")({
  head: () => ({
    meta: [
      { title: "Ejercicios y recomendaciones — Mente Clara" },
      {
        name: "description",
        content:
          "Biblioteca de ejercicios autorizados por la psicóloga: respiración, regulación, sueño, diario emocional y relaciones.",
      },
      { property: "og:title", content: "Ejercicios y recomendaciones — Mente Clara" },
      {
        property: "og:description",
        content: "Prácticas breves y guiadas para acompañarte entre sesiones.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RecomendacionesPage,
});

function RecomendacionesPage() {
  const exercises = useAppState(selectExercises);
  const saved = useAppState(selectSaved);
  const [filter, setFilter] = useState<ExerciseCategory | "todos">("todos");
  const [open, setOpen] = useState<Exercise | null>(null);

  const categories = [...new Set(exercises.map((e) => e.category))];
  const list = filter === "todos" ? exercises : exercises.filter((e) => e.category === filter);

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-8 px-5 py-12">
        <PageHeading
          eyebrow="Biblioteca"
          title="Ejercicios y recomendaciones"
          description="Prácticas breves revisadas por la psicóloga. Elige una, pruébala con calma y márcala como hecha para seguir tu progreso."
        />

        <div className="flex flex-wrap gap-2">
          {(["todos", ...categories] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c as ExerciseCategory | "todos")}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                filter === c
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c === "todos" ? "Todos" : CATEGORY_LABELS[c as ExerciseCategory]}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <ExerciseCard
              key={e.id}
              exercise={e}
              saved={saved.includes(e.id)}
              onToggleSave={() => actions.toggleSavedExercise(e.id)}
              onOpen={() => setOpen(e)}
              onComplete={() => {
                actions.logExercise(e.id);
                toast.success("Ejercicio registrado");
              }}
            />
          ))}
        </div>

        <Disclaimer compact />
      </div>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{open?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{open?.description}</p>
          <ol className="mt-2 space-y-2.5">
            {open?.instructions.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-medium text-primary">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <Button
            className="mt-3 w-full"
            onClick={() => {
              if (open) actions.logExercise(open.id);
              toast.success("Ejercicio registrado");
              setOpen(null);
            }}
          >
            Marcar como hecho
          </Button>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}