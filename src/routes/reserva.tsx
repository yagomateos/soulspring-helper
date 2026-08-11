import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Disclaimer } from "@/components/mc/Disclaimer";
import { PageHeading, PageShell } from "@/components/mc/PageShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  actions,
  CONSULTATION_TYPES,
  selectAppointments,
  selectLatest,
  selectSlots,
  useAppState,
} from "@/lib/mc/store";

export const Route = createFileRoute("/reserva")({
  head: () => ({
    meta: [
      { title: "Solicitar consulta — Mente Clara" },
      {
        name: "description",
        content:
          "Solicita una consulta online con la psicóloga colegiada de Mente Clara y elige el día y la hora que mejor te encajen.",
      },
      { property: "og:title", content: "Solicitar consulta — Mente Clara" },
      {
        property: "og:description",
        content: "Consulta online con una psicóloga colegiada, sin listas de espera.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReservaPage,
});

function nextDays(count: number) {
  const out: { value: string; label: string }[] = [];
  const base = new Date();
  for (let i = 1; out.length < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    out.push({
      value: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }),
    });
  }
  return out;
}

function ReservaPage() {
  const slots = useAppState(selectSlots);
  const appointments = useAppState(selectAppointments);
  const latest = useAppState(selectLatest);
  const days = nextDays(8);

  const [typeId, setTypeId] = useState(CONSULTATION_TYPES[0]!.id);
  const [date, setDate] = useState(days[0]!.value);
  const [time, setTime] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const confirm = () => {
    if (!time) {
      toast.error("Elige una hora para tu consulta.");
      return;
    }
    actions.addAppointment({
      id: `ap_${Date.now()}`,
      typeId,
      date,
      time,
      createdAt: new Date().toISOString(),
    });
    setTime(null);
    setNote("");
    toast.success("Solicitud enviada. Marina te confirmará por email.");
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-8 px-5 py-12">
        <PageHeading
          eyebrow="Consulta online"
          title="Habla con Marina"
          description="Una sesión online con la psicóloga colegiada que supervisa la plataforma. Eliges el tipo de consulta, el día y la hora."
        />

        {latest && (latest.triage === "HIGH" || latest.triage === "URGENT") ? (
          <div className="rounded-3xl border border-primary/30 bg-primary-soft p-5 text-sm leading-relaxed text-primary">
            Según tu última orientación, hablar con una profesional sería especialmente recomendable
            en este momento.
          </div>
        ) : null}

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Tipo de consulta</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {CONSULTATION_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeId(t.id)}
                className={`animate-rise rounded-3xl border p-5 text-left transition-transform hover:-translate-y-0.5 ${
                  typeId === t.id ? "border-primary bg-primary-soft" : "border-border bg-card"
                }`}
              >
                <h3 className="font-medium">{t.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                <p className="mt-3 flex items-center gap-3 text-sm font-medium">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3.5" /> {t.minutes} min
                  </span>
                  <span>{t.price} €</span>
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Día</h2>
          <div className="flex flex-wrap gap-2">
            {days.map((d) => (
              <button
                key={d.value}
                onClick={() => setDate(d.value)}
                className={`rounded-2xl border px-4 py-2.5 text-sm capitalize transition-colors ${
                  date === d.value
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Hora</h2>
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => setTime(s)}
                className={`rounded-2xl border px-4 py-2.5 text-sm transition-colors ${
                  time === s
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">¿Algo que quieras adelantar?</h2>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Opcional: cuéntale brevemente a Marina qué te gustaría trabajar."
            className="rounded-2xl"
          />
          <Button onClick={confirm}>Solicitar consulta</Button>
        </section>

        {appointments.length > 0 ? (
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold">Tus solicitudes</h2>
            <div className="space-y-2">
              {appointments.map((a) => {
                const type = CONSULTATION_TYPES.find((t) => t.id === a.typeId);
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-2xl bg-mint-soft text-secondary-foreground">
                        <CalendarDays className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">{type?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(a.date).toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}{" "}
                          · {a.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Check className="size-3.5" /> Pendiente
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => actions.cancelAppointment(a.id)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <Disclaimer compact />
        <p className="text-sm text-muted-foreground">
          ¿Aún no tienes tu orientación?{" "}
          <Link to="/evaluacion" className="text-primary hover:underline">
            Empieza el cuestionario
          </Link>
        </p>
      </div>
    </PageShell>
  );
}