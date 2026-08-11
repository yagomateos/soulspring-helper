import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, Phone, Users } from "lucide-react";
import { PageShell } from "@/components/mc/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/urgente")({
  head: () => ({
    meta: [
      { title: "Atención inmediata — Mente Clara" },
      {
        name: "description",
        content: "Recursos de ayuda inmediata y teléfonos de atención en caso de crisis emocional.",
      },
      { property: "og:title", content: "Atención inmediata — Mente Clara" },
      { property: "og:description", content: "Recursos de ayuda inmediata en caso de crisis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UrgentePage,
});

const RESOURCES = [
  {
    icon: Phone,
    title: "024 — Atención a la conducta suicida",
    text: "Gratuito, confidencial y disponible 24 horas todos los días del año (España).",
  },
  {
    icon: LifeBuoy,
    title: "112 — Emergencias",
    text: "Si existe un riesgo inmediato para tu vida o la de otra persona, llama ahora.",
  },
  {
    icon: Users,
    title: "Alguien de confianza",
    text: "Avisa a una persona cercana y trata de no quedarte a solas en este momento.",
  },
];

function UrgentePage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl space-y-7 px-5 py-16">
        <div className="animate-rise space-y-3 rounded-[2rem] border border-destructive/30 bg-destructive/5 p-7">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">
            Lo que nos has contado merece atención profesional ahora
          </h1>
          <p className="leading-relaxed text-muted-foreground">
            Algunas de tus respuestas indican que estás pasando por un momento delicado. Esta
            plataforma ofrece orientación general y no puede acompañarte adecuadamente en una
            situación de riesgo. Por eso hemos detenido el cuestionario aquí.
          </p>
        </div>

        <div className="space-y-3">
          {RESOURCES.map((r) => (
            <div
              key={r.title}
              className="flex gap-4 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-calm text-primary">
                <r.icon className="size-5" />
              </span>
              <div className="space-y-1">
                <h2 className="font-medium">{r.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/reserva">Solicitar consulta con la psicóloga</Link>
          </Button>
          <Button variant="soft" asChild>
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}