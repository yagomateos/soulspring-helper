import { createFileRoute } from "@tanstack/react-router";
import { Disclaimer } from "@/components/mindguide/Disclaimer";
import { PageHeading, PageShell } from "@/components/mindguide/PageShell";
import { RecommendationCard } from "@/components/mindguide/RecommendationCard";
import { RECOMMENDATIONS, recommendFor } from "@/lib/mindguide/recommendations";
import { actions, selectLatest, selectSaved, useAppState } from "@/lib/mindguide/store";

const TITLE = "Recomendaciones personalizadas — MindGuide AI";
const DESC =
  "Respiración, mindfulness, diario emocional, paseos, organización del día e higiene del sueño, con tiempo estimado y explicación.";

export const Route = createFileRoute("/recomendaciones")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: RecomendacionesPage,
});

function RecomendacionesPage() {
  const latest = useAppState(selectLatest);
  const saved = useAppState(selectSaved);
  const priority = latest ? recommendFor(latest).map((r) => r.id) : [];
  const list = [...RECOMMENDATIONS].sort(
    (a, b) =>
      (priority.indexOf(a.id) === -1 ? 99 : priority.indexOf(a.id)) -
      (priority.indexOf(b.id) === -1 ? 99 : priority.indexOf(b.id)),
  );

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl space-y-10 px-5 py-12 sm:py-16">
        <PageHeading
          eyebrow="Práctica diaria"
          title="Recomendaciones basadas en evidencia"
          description={
            latest
              ? "Ordenadas según tu última evaluación. Guarda las que quieras practicar esta semana."
              : "Completa la evaluación para verlas ordenadas según lo que hoy más te pide atención."
          }
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <RecommendationCard
              key={r.id}
              recommendation={r}
              saved={saved.includes(r.id)}
              onToggleSave={() => actions.toggleRecommendation(r.id)}
            />
          ))}
        </div>
        <Disclaimer />
      </div>
    </PageShell>
  );
}