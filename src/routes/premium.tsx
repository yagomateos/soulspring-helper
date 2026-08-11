import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarClock, ListChecks, Sparkles, Wand2 } from "lucide-react";
import { Disclaimer } from "@/components/mc/Disclaimer";
import { PageHeading, PageShell } from "@/components/mc/PageShell";
import { PremiumStatusCard } from "@/components/mc/PremiumStatusCard";
import { Button } from "@/components/ui/button";
import { isPremium, useSession } from "@/lib/mc/session";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "Premium — Mente Clara" },
      {
        name: "description",
        content:
          "Tu espacio para seguir trabajando en tu bienestar: biblioteca completa, programas y seguimiento.",
      },
      { property: "og:title", content: "Premium — Mente Clara" },
      {
        property: "og:description",
        content: "Biblioteca Premium, programas guiados y seguimiento de tu progreso.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PremiumPage,
});

const FEATURES = [
  {
    icon: BookOpen,
    title: "Biblioteca Premium",
    description: "Guías y materiales completos, sin límites, por tema.",
    to: "/biblioteca" as const,
  },
  {
    icon: Sparkles,
    title: "Ejercicios Premium",
    description: "Prácticas guiadas adicionales, revisadas por la psicóloga.",
    to: "/recomendaciones" as const,
  },
  {
    icon: CalendarClock,
    title: "Programas",
    description: "Recorridos de varias sesiones para trabajar un tema paso a paso.",
    to: "/programas" as const,
  },
  {
    icon: ListChecks,
    title: "Seguimiento",
    description: "Tu actividad y progreso dentro de la plataforma.",
    to: "/seguimiento" as const,
  },
];

function PremiumPage() {
  const { user, profile, loading } = useSession();

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-10 px-5 py-12">
        <PageHeading
          eyebrow="Premium"
          title="Tu espacio para seguir trabajando en tu bienestar"
          description="Biblioteca completa, programas guiados y seguimiento de tu progreso. Cuando lo necesites, siempre puedes pedir una consulta directa con la psicóloga."
        />

        {!loading && user ? <PremiumStatusCard profile={profile} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              to={f.to}
              className="animate-rise flex items-start gap-3 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                <f.icon className="size-4.5" />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="animate-rise flex items-start gap-3 rounded-3xl border border-dashed border-border p-5 text-sm text-muted-foreground">
          <Wand2 className="size-4.5 shrink-0 text-primary" />
          <p>
            Más adelante, los miembros Premium tendrán acceso a funcionalidades de IA más completas,
            siempre basadas en contenidos y pautas revisados por la psicóloga — sin diagnósticos ni
            sustituir la consulta profesional.
          </p>
        </div>

        {!user ? (
          <div className="animate-rise rounded-3xl border border-border bg-card p-6 text-center shadow-[var(--shadow-soft)]">
            <p className="text-sm text-muted-foreground">Crea una cuenta gratuita para empezar.</p>
            <Button asChild className="mt-4">
              <Link to="/registro">Crear cuenta</Link>
            </Button>
          </div>
        ) : !isPremium(profile) ? (
          <div className="animate-rise rounded-3xl border border-border bg-card p-6 text-center shadow-[var(--shadow-soft)]">
            <p className="text-sm text-muted-foreground">
              La suscripción de pago todavía no está activa — próximamente. Si quieres acceso
              anticipado o tienes dudas, puedes escribirnos.
            </p>
            <Button variant="soft" className="mt-4" disabled>
              Suscripción — próximamente
            </Button>
          </div>
        ) : null}

        <Disclaimer compact />
      </div>
    </PageShell>
  );
}
