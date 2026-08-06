import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarHeart,
  ClipboardList,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";
import heroImage from "@/assets/hero-calm.jpg";
import { Disclaimer } from "@/components/mindguide/Disclaimer";
import { PageShell } from "@/components/mindguide/PageShell";
import { Button } from "@/components/ui/button";

const TITLE = "MindGuide AI — Orientación emocional con inteligencia artificial";
const DESC =
  "Evalúa tu ansiedad, estrés, sueño y autoestima en 5 minutos y recibe recomendaciones basadas en evidencia. Orientación, no diagnóstico.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Index,
});

const STEPS = [
  {
    icon: ClipboardList,
    title: "Responde el cuestionario",
    text: "8 pasos breves sobre ansiedad, ánimo, estrés, sueño, relaciones, autoestima y trabajo.",
  },
  {
    icon: Sparkles,
    title: "Recibe tu resumen",
    text: "Un mapa claro de cómo estás, con niveles estimados por área y lenguaje comprensible.",
  },
  {
    icon: MessageCircle,
    title: "Practica y conversa",
    text: "Ejercicios personalizados y un chat que te escucha antes de sugerirte nada.",
  },
  {
    icon: CalendarHeart,
    title: "Da el siguiente paso",
    text: "Si lo necesitas, reserva una sesión online con una psicóloga colegiada.",
  },
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Psicología basada en evidencia",
    text: "Cada recomendación parte de prácticas con respaldo clínico: TCC, mindfulness y activación conductual.",
  },
  {
    icon: Timer,
    title: "Cinco minutos, no cinco semanas",
    text: "Una foto honesta de tu momento actual sin listas de espera ni formularios interminables.",
  },
  {
    icon: Sparkles,
    title: "Personalizado de verdad",
    text: "Las sugerencias se ordenan según tus áreas más cargadas, no según una lista genérica.",
  },
];

function Index() {
  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-40 h-[32rem] bg-calm opacity-60 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-rise space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-xs font-medium text-primary shadow-[var(--shadow-soft)]">
              <Sparkles className="size-3.5" /> Orientación emocional con IA
            </span>
            <h1 className="text-4xl leading-[1.08] font-semibold sm:text-5xl lg:text-6xl">
              Entiende cómo te sientes,
              <span className="text-gradient-primary"> con calma y sin juicios</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              MindGuide AI te acompaña con un cuestionario guiado, un resumen emocional claro y
              prácticas diarias basadas en evidencia. Y cuando quieras hablar con una persona, te
              ponemos en contacto con una psicóloga.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/cuestionario">
                  Comenzar evaluación <ArrowRight />
                </Link>
              </Button>
              <Button variant="soft" size="xl" asChild>
                <Link to="/chat">Probar el chat</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Gratis · 5 minutos · Sin diagnóstico clínico
            </p>
          </div>

          <div className="animate-rise">
            <img
              src={heroImage}
              alt="Formas orgánicas en tonos azul claro y verde suave que evocan calma"
              width={1280}
              height={1280}
              className="w-full rounded-[2.5rem] shadow-[var(--shadow-lift)]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-2xl font-semibold sm:text-3xl">Cómo funciona</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Un recorrido sencillo, pensado para que en cada paso sepas exactamente qué estás haciendo.
        </p>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="surface-card p-6 transition-transform hover:-translate-y-1">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                <step.icon className="size-5" />
              </span>
              <p className="mt-5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                Paso {i + 1}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="rounded-[2.5rem] bg-calm p-8 sm:p-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">Por qué MindGuide</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-3xl bg-card/80 p-6 backdrop-blur">
                <b.icon className="size-5 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-8">
        <Disclaimer />
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-8 text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">¿Empezamos por cómo estás hoy?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Cinco minutos para poner nombre a lo que sientes y un plan concreto para los próximos días.
        </p>
        <Button variant="hero" size="xl" className="mt-7" asChild>
          <Link to="/cuestionario">
            Comenzar evaluación <ArrowRight />
          </Link>
        </Button>
      </section>
    </PageShell>
  );
}
