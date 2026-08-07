import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Heart,
  Lock,
  Sun,
  Wind,
} from "lucide-react";
import heroImage from "@/assets/hero-calm.jpg";
import psicologaImage from "@/assets/psicologa.jpg";
import { Disclaimer } from "@/components/mc/Disclaimer";
import { PageShell } from "@/components/mc/PageShell";
import { Button } from "@/components/ui/button";
import { AREAS } from "@/lib/mc/areas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mente Clara — Orientación psicológica online" },
      {
        name: "description",
        content:
          "Responde unas preguntas, recibe una orientación personalizada y descubre cuándo puede ser útil hablar con un profesional. Información orientativa, no diagnóstico.",
      },
      { property: "og:title", content: "Mente Clara — Orientación psicológica online" },
      {
        property: "og:description",
        content:
          "Una primera orientación para entender cómo te sientes, con IA supervisada por una psicóloga colegiada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const AREA_ICONS = { wind: Wind, sun: Sun, heart: Heart } as const;

const STEPS = [
  { n: "1", title: "Responde unas preguntas", text: "Un cuestionario por pasos, breve y sin tecnicismos." },
  { n: "2", title: "Recibe una primera orientación", text: "Un resumen claro de qué parece estar afectándote." },
  { n: "3", title: "Obtén recomendaciones", text: "Pautas y ejercicios ajustados a tu situación." },
  { n: "4", title: "Solicita una consulta", text: "Si lo necesitas, habla con la psicóloga del equipo." },
];

function LandingPage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="animate-rise space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
              <Lock className="size-3.5" /> Privado y confidencial
            </span>
            <h1 className="font-display text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Una primera orientación para entender cómo te sientes.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Responde unas preguntas, recibe orientación personalizada y descubre cuándo puede ser
              útil hablar con un profesional.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/evaluacion">
                  Comenzar evaluación <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="soft" asChild>
                <Link to="/chat">Hablar con el asistente</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Solo para personas adultas · Sin diagnósticos · Puedes parar cuando quieras
            </p>
          </div>

          <div className="animate-rise relative">
            <div className="overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-[var(--shadow-lift)]">
              <img
                src={heroImage}
                alt="Ilustración abstracta en tonos suaves que evoca calma"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Cómo funciona</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
            >
              <span className="grid size-9 place-items-center rounded-2xl bg-primary-soft font-display text-sm font-semibold text-primary">
                {s.n}
              </span>
              <h3 className="mt-4 font-display text-base font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">¿Con qué podemos ayudarte?</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Elige el área que mejor describe lo que estás viviendo ahora mismo.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {AREAS.map((area) => {
            const Icon = AREA_ICONS[area.icon];
            return (
              <Link
                key={area.id}
                to="/cuestionario/$area"
                params={{ area: area.id }}
                className="group rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-mint-soft text-secondary-foreground">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{area.name}</h3>
                <p className="text-sm text-muted-foreground">{area.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{area.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Empezar <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid items-center gap-10 rounded-[2.5rem] border border-border bg-card p-8 shadow-[var(--shadow-soft)] sm:p-12 lg:grid-cols-[auto_minmax(0,1fr)]">
          <img
            src={psicologaImage}
            alt="Retrato de la psicóloga responsable de la supervisión clínica"
            className="size-40 rounded-[2rem] object-cover sm:size-52"
            loading="lazy"
          />
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-mint-soft px-3 py-1 text-xs font-medium text-secondary-foreground">
              <BadgeCheck className="size-3.5" /> Supervisión profesional
            </span>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Una IA supervisada por una psicóloga colegiada
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Las preguntas, las recomendaciones y los ejercicios de la plataforma están definidos y
              revisados por una profesional de la psicología. El asistente sigue reglas clínicas
              estrictas: no diagnostica, no prescribe medicación y deriva a atención profesional
              cuando detecta que es lo indicado.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-6">
        <Disclaimer />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="rounded-[2.5rem] bg-[image:var(--gradient-calm)] p-8 text-center sm:p-14">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Da el primer paso, sin compromiso
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            En unos minutos tendrás una orientación clara sobre lo que te está ocurriendo y qué
            puedes hacer a continuación.
          </p>
          <Button size="lg" className="mt-7" asChild>
            <Link to="/evaluacion">
              Comenzar evaluación <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}