import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, Sparkles } from "lucide-react";
import { Disclaimer } from "@/components/mc/Disclaimer";
import { ExerciseCard } from "@/components/mc/ExerciseCard";
import { PageHeading, PageShell } from "@/components/mc/PageShell";
import { ScoreBar } from "@/components/mc/ScoreBar";
import { Button } from "@/components/ui/button";
import { areaById } from "@/lib/mc/areas";
import {
  actions,
  selectExercises,
  selectLatest,
  selectSaved,
  useAppState,
} from "@/lib/mc/store";

export const Route = createFileRoute("/resultado")({
  head: () => ({
    meta: [
      { title: "Tu orientación — Mente Clara" },
      {
        name: "description",
        content:
          "Resumen orientativo de tus respuestas, factores relacionados, recomendaciones iniciales y ejercicios sugeridos.",
      },
      { property: "og:title", content: "Tu orientación — Mente Clara" },
      { property: "og:description", content: "Qué parece estar afectándote y qué puedes hacer ahora." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResultadoPage,
});

function ResultadoPage() {
  const result = useAppState(selectLatest);
  const exercises = useAppState(selectExercises);
  const saved = useAppState(selectSaved);

  if (!result) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold">Aún no tienes una orientación</h1>
          <p className="mt-2 text-muted-foreground">Completa el cuestionario para verla aquí.</p>
          <Button className="mt-6" asChild>
            <Link to="/evaluacion">Comenzar evaluación</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const suggested = exercises.filter((e) => result.exerciseIds.includes(e.id));
  const derive = result.triage === "HIGH" || result.triage === "MEDIUM";

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-8 px-5 py-12">
        <PageHeading
          eyebrow={areaById(result.area)?.name}
          title="Tu orientación"
          description={result.summary}
        />

        <Disclaimer />

        <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-lg font-semibold">Qué parece estar afectándote</h2>
          <ul className="mt-4 space-y-2.5">
            {result.aspects.map((a) => (
              <li key={a} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                {a}
              </li>
            ))}
          </ul>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {result.factors.map((f) => (
              <ScoreBar key={f.factor} label={f.label} score={f.score} />
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-lg font-semibold">Posibles factores relacionados</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {result.related.map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Lightbulb className="size-4 text-primary" /> Recomendaciones iniciales
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {result.recommendations.map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Ejercicios recomendados</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {suggested.map((e) => (
              <ExerciseCard
                key={e.id}
                exercise={e}
                saved={saved.includes(e.id)}
                onToggleSave={() => actions.toggleSavedExercise(e.id)}
                onComplete={() => actions.logExercise(e.id)}
              />
            ))}
          </div>
        </section>

        {derive ? (
          <section className="rounded-3xl border border-primary/30 bg-primary-soft/60 p-6">
            <h2 className="font-display text-lg font-semibold">
              Por las respuestas que has dado, puede ser recomendable hablar con un profesional.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Una consulta con la psicóloga permite valorar tu situación con detalle y ajustar el
              acompañamiento a lo que necesitas.
            </p>
            <Button className="mt-5" asChild>
              <Link to="/reserva">
                Solicitar consulta <ArrowRight className="size-4" />
              </Link>
            </Button>
          </section>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button variant="soft" asChild>
            <Link to="/chat">Continuar con el asistente</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/recomendaciones">Ver todos los ejercicios</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/perfil">Ir a mi seguimiento</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}