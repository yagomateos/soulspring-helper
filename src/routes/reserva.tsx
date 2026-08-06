import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarCheck, Clock, Euro, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import psicologaImg from "@/assets/psicologa.jpg";
import { Disclaimer } from "@/components/mindguide/Disclaimer";
import { PageHeading, PageShell } from "@/components/mindguide/PageShell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { actions } from "@/lib/mindguide/store";
import { cn } from "@/lib/utils";

const TITLE = "Reservar consulta con psicóloga — MindGuide AI";
const DESC =
  "Reserva una sesión online de 30 o 50 minutos con una psicóloga colegiada. Elige día, hora y confirma en un clic.";

export const Route = createFileRoute("/reserva")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: ReservaPage,
});

const DURATIONS = [
  { duration: 30, price: 40, label: "Sesión breve", detail: "Seguimiento o primera toma de contacto" },
  { duration: 50, price: 60, label: "Sesión completa", detail: "Formato estándar de terapia online" },
];

const SLOTS = ["09:00", "10:30", "12:00", "16:00", "17:30", "19:00"];
const THERAPIST = "Laura Vidal · Psicóloga sanitaria (col. M-12345)";

function ReservaPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | null>(null);
  const [plan, setPlan] = useState(DURATIONS[1]!);

  const confirm = () => {
    if (!date || !time) return;
    actions.addAppointment({
      id: `apt_${Date.now()}`,
      date: date.toISOString(),
      time,
      duration: plan.duration,
      price: plan.price,
      therapist: THERAPIST,
    });
    toast.success(
      `Sesión reservada para el ${format(date, "d 'de' MMMM", { locale: es })} a las ${time}`,
    );
    setTime(null);
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-10 px-5 py-12 sm:py-16">
        <PageHeading
          eyebrow="Consulta online"
          title="Reserva una sesión con una psicóloga"
          description="Videollamada privada y segura. Puedes cancelar o cambiar la cita hasta 24 horas antes."
        />

        <section className="surface-card grid gap-6 p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <img
            src={psicologaImg}
            alt="Retrato de Laura Vidal, psicóloga sanitaria"
            width={640}
            height={640}
            loading="lazy"
            className="size-24 shrink-0 rounded-3xl object-cover"
          />
          <div className="min-w-0 space-y-1.5">
            <h2 className="text-lg font-semibold">Laura Vidal</h2>
            <p className="text-sm text-muted-foreground">
              Psicóloga sanitaria colegiada (M-12345). Terapia cognitivo-conductual, ansiedad,
              estrés laboral y autoestima. 9 años de experiencia.
            </p>
            <p className="inline-flex items-center gap-1.5 text-sm text-primary">
              <Video className="size-4" /> Sesiones por videollamada
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)]">
          <div className="surface-card p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={es}
              disabled={{ before: new Date() }}
              className={cn("pointer-events-auto p-2")}
            />
          </div>

          <div className="space-y-6">
            <div className="surface-card space-y-3 p-6">
              <h3 className="font-semibold">Duración y precio</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {DURATIONS.map((d) => {
                  const active = plan.duration === d.duration;
                  return (
                    <button
                      key={d.duration}
                      onClick={() => setPlan(d)}
                      className={cn(
                        "rounded-3xl border px-5 py-4 text-left transition-all",
                        active
                          ? "border-primary bg-primary-soft"
                          : "border-border hover:border-primary/40 hover:bg-muted",
                      )}
                    >
                      <p className="font-medium">{d.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{d.detail}</p>
                      <p className="mt-3 flex items-center gap-3 text-sm">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" /> {d.duration} min
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-primary">
                          <Euro className="size-3.5" /> {d.price}
                        </span>
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="surface-card space-y-3 p-6">
              <h3 className="font-semibold">
                Horas disponibles
                {date ? (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {format(date, "EEEE d 'de' MMMM", { locale: es })}
                  </span>
                ) : null}
              </h3>
              <div className="grid grid-cols-3 gap-2.5">
                {SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={cn(
                      "rounded-2xl border py-3 text-sm font-medium transition-all",
                      time === slot
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/40 hover:bg-muted",
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-card grid gap-4 bg-calm p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <p className="font-medium">
                  {date && time
                    ? `${format(date, "d 'de' MMMM", { locale: es })} · ${time} · ${plan.duration} min`
                    : "Elige día y hora para continuar"}
                </p>
                <p className="text-sm text-muted-foreground">Total: {plan.price} € · Pago seguro</p>
              </div>
              <Button
                variant="hero"
                size="lg"
                className="shrink-0"
                disabled={!date || !time}
                onClick={confirm}
              >
                <CalendarCheck /> Reservar
              </Button>
            </div>
          </div>
        </section>

        <Disclaimer compact />
      </div>
    </PageShell>
  );
}