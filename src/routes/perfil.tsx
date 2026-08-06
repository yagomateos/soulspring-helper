import { Link, createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, LogOut, Trash2 } from "lucide-react";
import { PageHeading, PageShell } from "@/components/mindguide/PageShell";
import { RecommendationCard } from "@/components/mindguide/RecommendationCard";
import { Button } from "@/components/ui/button";
import { RECOMMENDATIONS } from "@/lib/mindguide/recommendations";
import {
  actions,
  selectAppointments,
  selectAssessments,
  selectSaved,
  selectUser,
  useAppState,
} from "@/lib/mindguide/store";

const TITLE = "Mi perfil y progreso — MindGuide AI";
const DESC =
  "Consulta tu progreso emocional, los cuestionarios realizados, las recomendaciones guardadas y tus próximas citas.";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const user = useAppState(selectUser);
  const assessments = useAppState(selectAssessments);
  const saved = useAppState(selectSaved);
  const appointments = useAppState(selectAppointments);
  const savedRecs = RECOMMENDATIONS.filter((r) => saved.includes(r.id));
  const latest = assessments[0];
  const previous = assessments[1];
  const delta = latest && previous ? latest.overall - previous.overall : null;

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-12 px-5 py-12 sm:py-16">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <PageHeading
            eyebrow="Tu espacio"
            title={user ? `Hola, ${user.name.split(" ")[0]}` : "Tu perfil"}
            description={
              user
                ? user.email
                : "Entra o crea una cuenta para guardar tu progreso entre dispositivos."
            }
          />
          {user ? (
            <Button variant="ghost" size="sm" className="shrink-0" onClick={() => actions.signOut()}>
              <LogOut /> Salir
            </Button>
          ) : (
            <Button variant="soft" size="sm" className="shrink-0" asChild>
              <Link to="/registro">Entrar</Link>
            </Button>
          )}
        </div>

        <section className="grid gap-5 sm:grid-cols-3">
          <StatCard
            label="Bienestar general"
            value={latest ? String(latest.overall) : "—"}
            hint={
              delta === null
                ? "Completa otra evaluación para ver tu evolución"
                : `${delta >= 0 ? "+" : ""}${delta} puntos desde la anterior`
            }
          />
          <StatCard
            label="Cuestionarios"
            value={String(assessments.length)}
            hint="Evaluaciones completadas"
          />
          <StatCard
            label="Prácticas guardadas"
            value={String(savedRecs.length)}
            hint="Tu rutina de bienestar"
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Cuestionarios realizados</h2>
          {assessments.length === 0 ? (
            <EmptyState
              text="Todavía no has completado ninguna evaluación."
              action={{ to: "/cuestionario", label: "Empezar ahora" }}
            />
          ) : (
            <ul className="space-y-3">
              {assessments.map((a) => (
                <li
                  key={a.id}
                  className="surface-card grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-5"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {format(new Date(a.date), "d 'de' MMMM, HH:mm", { locale: es })}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{a.summary}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary-soft px-4 py-1.5 text-sm font-semibold text-primary">
                    {a.overall}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Recomendaciones guardadas</h2>
          {savedRecs.length === 0 ? (
            <EmptyState
              text="Aún no has guardado ninguna práctica."
              action={{ to: "/recomendaciones", label: "Ver recomendaciones" }}
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {savedRecs.map((r) => (
                <RecommendationCard
                  key={r.id}
                  recommendation={r}
                  saved
                  onToggleSave={() => actions.toggleRecommendation(r.id)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Próximas citas</h2>
          {appointments.length === 0 ? (
            <EmptyState
              text="No tienes sesiones programadas."
              action={{ to: "/reserva", label: "Reservar consulta" }}
            />
          ) : (
            <ul className="space-y-3">
              {appointments.map((a) => (
                <li
                  key={a.id}
                  className="surface-card grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-5"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-calm text-primary">
                    <CalendarDays className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">
                      {format(new Date(a.date), "EEEE d 'de' MMMM", { locale: es })} · {a.time}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {a.therapist} · {a.duration} min · {a.price} €
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Cancelar cita"
                    onClick={() => actions.cancelAppointment(a.id)}
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageShell>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="surface-card p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-display mt-1 text-4xl font-semibold text-primary">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function EmptyState({
  text,
  action,
}: {
  text: string;
  action: { to: "/cuestionario" | "/recomendaciones" | "/reserva"; label: string };
}) {
  return (
    <div className="surface-card grid gap-4 bg-calm p-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <p className="text-sm text-muted-foreground">{text}</p>
      <Button variant="soft" className="shrink-0" asChild>
        <Link to={action.to}>{action.label}</Link>
      </Button>
    </div>
  );
}