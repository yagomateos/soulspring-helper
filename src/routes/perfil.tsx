import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, LineChart, ListChecks, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Disclaimer } from "@/components/mc/Disclaimer";
import { PageHeading, PageShell } from "@/components/mc/PageShell";
import { Button } from "@/components/ui/button";
import { areaById } from "@/lib/mc/areas";
import { TRIAGE_LABELS } from "@/lib/mc/triage";
import {
  actions,
  CONSULTATION_TYPES,
  selectAppointments,
  selectAssessments,
  selectExercises,
  selectLogs,
  selectMoods,
  selectSaved,
  selectThreads,
  selectUser,
  useAppState,
} from "@/lib/mc/store";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Mi progreso — Mente Clara" },
      {
        name: "description",
        content:
          "Consulta tus cuestionarios, la evolución de tu estado de ánimo, los ejercicios realizados y tus consultas solicitadas.",
      },
      { property: "og:title", content: "Mi progreso — Mente Clara" },
      { property: "og:description", content: "Tu historial de orientación y seguimiento." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PerfilPage,
});

const MOODS = [
  { value: 1, label: "Muy mal" },
  { value: 2, label: "Mal" },
  { value: 3, label: "Regular" },
  { value: 4, label: "Bien" },
  { value: 5, label: "Muy bien" },
];

function PerfilPage() {
  const user = useAppState(selectUser);
  const assessments = useAppState(selectAssessments);
  const moods = useAppState(selectMoods);
  const logs = useAppState(selectLogs);
  const saved = useAppState(selectSaved);
  const exercises = useAppState(selectExercises);
  const threads = useAppState(selectThreads);
  const appointments = useAppState(selectAppointments);

  const stats = [
    { icon: ListChecks, label: "Cuestionarios", value: assessments.length },
    { icon: LineChart, label: "Ejercicios hechos", value: logs.length },
    { icon: MessageCircle, label: "Conversaciones", value: threads.length },
    { icon: CalendarDays, label: "Consultas", value: appointments.length },
  ];

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-8 px-5 py-12">
        <PageHeading
          eyebrow={user ? user.email : "Invitado"}
          title={user ? `Hola, ${user.name.split(" ")[0]}` : "Tu progreso"}
          description="Aquí se guarda todo lo que vas haciendo: cuestionarios, ejercicios, conversaciones y consultas."
        />

        <div className="grid gap-3 sm:grid-cols-4">
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

        <section className="space-y-3 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-lg font-semibold">¿Cómo estás hoy?</h2>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => {
                  actions.addMood(m.value);
                  toast.success("Registrado");
                }}
                className="rounded-2xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {m.label}
              </button>
            ))}
          </div>
          {moods.length > 0 ? (
            <div className="flex items-end gap-1.5 pt-3">
              {moods
                .slice(0, 14)
                .reverse()
                .map((m) => (
                  <span
                    key={m.id}
                    title={new Date(m.date).toLocaleDateString("es-ES")}
                    className="w-4 rounded-t-md bg-primary/70"
                    style={{ height: `${m.mood * 14}px` }}
                  />
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aún no has registrado tu estado de ánimo.</p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Tus cuestionarios</h2>
          {assessments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no has completado ninguno.{" "}
              <Link to="/evaluacion" className="text-primary hover:underline">
                Empezar ahora
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {assessments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card p-4"
                >
                  <div>
                    <p className="text-sm font-medium">{areaById(a.area)?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(a.date).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      · {TRIAGE_LABELS[a.triage]}
                    </p>
                  </div>
                  <span className="font-display text-lg font-semibold text-primary">
                    {a.intensity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Ejercicios guardados</h2>
          {saved.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Guarda los que quieras repetir desde{" "}
              <Link to="/recomendaciones" className="text-primary hover:underline">
                la biblioteca
              </Link>
              .
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {saved.map((id) => {
                const e = exercises.find((x) => x.id === id);
                return e ? (
                  <span
                    key={id}
                    className="rounded-full border border-border px-3.5 py-1.5 text-sm text-muted-foreground"
                  >
                    {e.title}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Consultas solicitadas</h2>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ninguna por ahora.{" "}
              <Link to="/reserva" className="text-primary hover:underline">
                Solicitar consulta
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {appointments.map((a) => (
                <div key={a.id} className="rounded-3xl border border-border bg-card p-4 text-sm">
                  <span className="font-medium">
                    {CONSULTATION_TYPES.find((t) => t.id === a.typeId)?.name}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {new Date(a.date).toLocaleDateString("es-ES")} · {a.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {user ? (
          <Button variant="soft" onClick={() => actions.signOut()}>
            Cerrar sesión
          </Button>
        ) : (
          <Button asChild>
            <Link to="/registro">Crear cuenta para guardar tu progreso</Link>
          </Button>
        )}

        <Disclaimer compact />
      </div>
    </PageShell>
  );
}