import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, CalendarClock, ListChecks } from "lucide-react";
import { Disclaimer } from "@/components/mc/Disclaimer";
import { PageHeading, PageShell } from "@/components/mc/PageShell";
import { PaywallCard } from "@/components/mc/PaywallCard";
import { fetchSeguimientoSummary } from "@/lib/data/progress";
import { isPremium, useSession } from "@/lib/mc/session";

export const Route = createFileRoute("/seguimiento")({
  head: () => ({
    meta: [{ title: "Seguimiento — Mente Clara" }, { name: "robots", content: "noindex" }],
  }),
  component: SeguimientoPage,
});

function SeguimientoPage() {
  const { user, profile, loading } = useSession();
  const premium = isPremium(profile);

  const { data: summary } = useQuery({
    queryKey: ["seguimiento", user?.id],
    queryFn: () => fetchSeguimientoSummary(user!.id),
    enabled: !!user && premium,
  });

  const stats = [
    { icon: CalendarClock, label: "Programas iniciados", value: summary?.programsStarted ?? 0 },
    { icon: ListChecks, label: "Ejercicios completados", value: summary?.exercisesCompleted ?? 0 },
    { icon: BookOpen, label: "Contenidos vistos", value: summary?.contentViewed ?? 0 },
  ];

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-8 px-5 py-12">
        <PageHeading
          eyebrow="Premium"
          title="Seguimiento"
          description="Tu actividad y uso dentro de la plataforma. Esto no es una medida clínica de mejora, solo un registro de lo que has ido haciendo."
        />

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : !user ? (
          <PaywallCard title="Inicia sesión para ver tu seguimiento" />
        ) : !premium ? (
          <PaywallCard title="El seguimiento está disponible para miembros Premium" />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="animate-rise rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
                >
                  <s.icon className="size-4 text-primary" />
                  <p className="mt-3 font-display text-2xl font-semibold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-semibold">Actividad reciente</h2>
              {!summary || summary.recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todavía no hay actividad registrada.
                </p>
              ) : (
                <div className="space-y-2">
                  {summary.recent.map((a) => (
                    <div
                      key={`${a.kind}-${a.id}`}
                      className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card p-4 text-sm"
                    >
                      <span>{a.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.at).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <Disclaimer compact />
      </div>
    </PageShell>
  );
}
