import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { Disclaimer } from "@/components/mindguide/Disclaimer";
import { PageShell } from "@/components/mindguide/PageShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GOALS, STEPS, questionsForStep } from "@/lib/mindguide/questions";
import { scoreAssessment } from "@/lib/mindguide/scoring";
import { actions } from "@/lib/mindguide/store";
import type { Answers } from "@/lib/mindguide/types";

const TITLE = "Cuestionario emocional — MindGuide AI";
const DESC =
  "Un cuestionario guiado en 8 pasos sobre ansiedad, ánimo, estrés, sueño, relaciones, autoestima, trabajo y objetivos personales.";

export const Route = createFileRoute("/cuestionario")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: CuestionarioPage,
});

function CuestionarioPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [goals, setGoals] = useState<string[]>([]);

  const current = STEPS[step - 1]!;
  const questions = useMemo(() => questionsForStep(step), [step]);
  const isGoalsStep = step === 8;
  const canContinue = isGoalsStep
    ? goals.length > 0
    : questions.every((q) => answers[q.id] !== undefined);
  const progress = Math.round(((step - 1) / STEPS.length) * 100);

  const next = () => {
    if (!isGoalsStep) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const result = scoreAssessment(answers, goals);
    actions.addAssessment(result);
    navigate({ to: "/resultado" });
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <div className="sticky top-16 z-20 -mx-5 bg-background/85 px-5 pt-2 pb-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Paso {step} de {STEPS.length}
            </span>
            <span className="text-muted-foreground">{current.title}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-all duration-500"
              style={{ width: `${Math.max(progress, 4)}%` }}
            />
          </div>
        </div>

        <div key={step} className="animate-rise mt-8 space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold">{current.title}</h1>
            <p className="text-muted-foreground">{current.subtitle}</p>
          </header>

          {isGoalsStep ? (
            <section className="space-y-4">
              <p className="text-base font-medium">
                ¿Qué te gustaría conseguir? Elige todo lo que encaje contigo.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {GOALS.map((goal) => {
                  const active = goals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() =>
                        setGoals((g) => (active ? g.filter((x) => x !== goal) : [...g, goal]))
                      }
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-3xl border px-5 py-4 text-left text-base transition-all",
                        active
                          ? "border-primary bg-primary-soft font-medium text-primary"
                          : "border-border bg-card hover:border-primary/40 hover:bg-muted",
                      )}
                    >
                      {goal}
                      {active ? <Check className="size-4 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className="space-y-8">
              {questions.map((q) => (
                <fieldset key={q.id} className="surface-card space-y-4 p-6">
                  <legend className="sr-only">{q.title}</legend>
                  <p className="text-base font-medium">{q.title}</p>
                  {q.help ? <p className="text-sm text-muted-foreground">{q.help}</p> : null}
                  <div className="grid gap-2.5">
                    {q.options.map((opt) => {
                      const active = answers[q.id] === opt.value;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.value }))}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-all",
                            active
                              ? "border-primary bg-primary-soft text-primary"
                              : "border-border bg-background hover:border-primary/40 hover:bg-muted",
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-5 shrink-0 place-items-center rounded-full border-2",
                              active ? "border-primary bg-primary" : "border-border",
                            )}
                          >
                            {active ? (
                              <Check className="size-3 text-primary-foreground" strokeWidth={3} />
                            ) : null}
                          </span>
                          <span className="text-base">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="ghost"
              size="lg"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              <ArrowLeft /> Atrás
            </Button>
            <Button variant="hero" size="lg" disabled={!canContinue} onClick={next}>
              {isGoalsStep ? "Ver mi resultado" : "Continuar"} <ArrowRight />
            </Button>
          </div>

          <Disclaimer compact />
        </div>
      </div>
    </PageShell>
  );
}