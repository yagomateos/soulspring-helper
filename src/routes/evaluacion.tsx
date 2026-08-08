import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Sun, Wind } from "lucide-react";
import { Disclaimer } from "@/components/mc/Disclaimer";
import { PageHeading, PageShell } from "@/components/mc/PageShell";
import { AREAS } from "@/lib/mc/areas";
import { actions } from "@/lib/mc/store";

export const Route = createFileRoute("/evaluacion")({
  head: () => ({
    meta: [
      { title: "Motivo de consulta — Mente Clara" },
      {
        name: "description",
        content:
          "Elige el área que mejor describe lo que estás viviendo: ansiedad, estado de ánimo o relaciones y pareja.",
      },
      { property: "og:title", content: "Motivo de consulta — Mente Clara" },
      {
        property: "og:description",
        content: "Selecciona tu área y comienza el cuestionario de orientación.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EvaluacionPage,
});

const ICONS = { wind: Wind, sun: Sun, heart: Heart } as const;

function EvaluacionPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-8 px-5 py-14">
        <PageHeading
          eyebrow="Paso 1 de 3"
          title="¿Qué te trae hoy aquí?"
          description="Elige el área que mejor describa lo que estás viviendo. Podrás cambiarla o completar otra evaluación más adelante."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {AREAS.map((area) => {
            const Icon = ICONS[area.icon];
            return (
              <Link
                key={area.id}
                to="/cuestionario/$area"
                params={{ area: area.id }}
                onClick={() => actions.selectArea(area.id)}
                className="group animate-rise rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold">{area.name}</h2>
                <p className="text-sm text-muted-foreground">{area.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{area.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Comenzar cuestionario
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        <Disclaimer />
      </div>
    </PageShell>
  );
}