import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarHeart, MessageCircle } from "lucide-react";
import { Disclaimer } from "@/components/mindguide/Disclaimer";
import { PageShell, PageHeading } from "@/components/mindguide/PageShell";
import { RecommendationCard } from "@/components/mindguide/RecommendationCard";
import { ScoreBar } from "@/components/mindguide/ScoreBar";
import { Button } from "@/components/ui/button";
import { recommendFor } from "@/lib/mindguide/recommendations";
import { actions, selectLatest, selectSaved, useAppState } from "@/lib/mindguide/store";

const TITLE = "Tu resumen emocional — MindGuide AI";
const DESC =
  "Niveles estimados de ansiedad, estrés, autoestima y sueño a partir de tus respuestas, con recomendaciones prácticas personalizadas.";

export const Route = createFileRoute("/resultado")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: ResultadoPage,
});

function ResultadoPage() {
  const result = useAppState(selectLatest);
  const saved = useAppState(selectSaved);

  if (!result) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <h1 className="text-3xl font-semibold">Aún no tienes resultados</h1>
          <p className="mt-3 text-muted-foreground">
            Completa el cuestionario para ver tu resumen emocional personalizado.
          </p>
          <Button variant="hero" size="lg" className="mt-7" asChild>
            <Link to="/cuestionario">
              Empezar evaluación <ArrowRight />
            </Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const recommendations = recommendFor(result);

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-12 px-5 py-12 sm:py-16">
        <PageHeading
          eyebrow="Tu resultado"
          title="Así se ve tu momento actual"
          description={result.summary}
        />

        <section className="animate-rise grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)]">
          <div className="surface-card flex flex-col items-center justify-center gap-2 bg-calm p-8 text-center lg:w-64">
            <p className="text-sm text-muted-foreground">Bienestar general</p>
            <p className="font-display text-6xl font-semibold text-primary">{result.overall}</p>
            <p className="text-sm text-muted-foreground">sobre 100</p>
          </div>
          <div className="surface-card grid gap-7 p-7 sm:grid-cols-2">
            {result.scores.map((s) => (
              <ScoreBar key={s.dimension} score={s} />
            ))}
          </div>
        </section>

        {result.goals.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Tus objetivos</h2>
            <div className="flex flex-wrap gap-2">
              {result.goals.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-primary-soft px-4 py-1.5 text-sm text-primary"
                >
                  {g}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <Disclaimer />

        <section className="space-y-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Recomendaciones para ti</h2>
              <p className="mt-1 text-muted-foreground">
                Ordenadas según las áreas que hoy piden más cuidado.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0" asChild>
              <Link to="/recomendaciones">Ver todas</Link>
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((r) => (
              <RecommendationCard
                key={r.id}
                recommendation={r}
                saved={saved.includes(r.id)}
                onToggleSave={() => actions.toggleRecommendation(r.id)}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="surface-card space-y-3 p-7">
            <MessageCircle className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">Habla con la IA</h3>
            <p className="text-sm text-muted-foreground">
              Explora lo que te pasa en una conversación tranquila y sin prisas.
            </p>
            <Button variant="soft" asChild>
              <Link to="/chat">Abrir chat</Link>
            </Button>
          </div>
          <div className="surface-card space-y-3 bg-calm p-7">
            <CalendarHeart className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">Habla con una psicóloga</h3>
            <p className="text-sm text-muted-foreground">
              Sesión online de 50 minutos con una profesional colegiada.
            </p>
            <Button variant="hero" asChild>
              <Link to="/reserva">Reservar consulta</Link>
            </Button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}