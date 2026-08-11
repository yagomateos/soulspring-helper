import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Disclaimer } from "@/components/mc/Disclaimer";
import { PageShell } from "@/components/mc/PageShell";
import { Button } from "@/components/ui/button";
import { areaById, isAreaId } from "@/lib/mc/areas";
import { STEP_TITLES, stepsOf } from "@/lib/mc/questions";
import { actions, selectExercises, selectQuestions, useAppState } from "@/lib/mc/store";
import { evaluate } from "@/lib/mc/triage";
import type { Answers, AreaId, Question } from "@/lib/mc/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cuestionario/$area")({
  head: () => ({
    meta: [
      { title: "Cuestionario de orientación — Mente Clara" },
      {
        name: "description",
        content:
          "Un cuestionario por pasos sobre frecuencia, intensidad, duración e impacto de lo que estás viviendo.",
      },
      { property: "og:title", content: "Cuestionario de orientación — Mente Clara" },
      { property: "og:description", content: "Responde por pasos y recibe tu orientación personalizada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CuestionarioPage,
});

function CuestionarioPage() {
  const { area } = Route.useParams();
  const navigate = useNavigate();
  const questionBank = useAppState(selectQuestions);
  const exercises = useAppState(selectExercises);
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);

  // Sube al principio de la página en cada cambio de paso (adelante o atrás),
  // una vez que el nuevo paso ya se ha pintado — evita que el scroll-al-foco
  // del navegador (al pulsar el botón) deje la página a mitad de camino.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex]);

  const valid = isAreaId(area);
  const areaId = (valid ? area : "ansiedad") as AreaId;
  const meta = areaById(areaId);
  const questions = questionBank[areaId] ?? [];
  const steps = useMemo(() => stepsOf(questions), [questions]);
  const currentStep = steps[stepIndex] ?? 1;
  const stepQuestions = questions.filter((q) => q.step === currentStep);
  const progress = Math.round(((stepIndex + 1) / Math.max(1, steps.length)) * 100);

  const answeredAll = stepQuestions.every((q) => answers[q.id] !== undefined);

  if (!valid) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold">Área no encontrada</h1>
          <Button className="mt-6" asChild>
            <Link to="/evaluacion">Elegir un área</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const setSingle = (q: Question, value: number) =>
    setAnswers((prev) => ({ ...prev, [q.id]: value }));

  const toggleMulti = (q: Question, index: number, value: number) =>
    setAnswers((prev) => {
      const current = Array.isArray(prev[q.id]) ? [...(prev[q.id] as number[])] : [];
      const key = `${index}`;
      const exists = current.includes(index);
      const next = exists ? current.filter((i) => i !== index) : [...current, index];
      void key;
      void value;
      return { ...prev, [q.id]: next };
    });

  const multiValues = (q: Question): number[] =>
    Array.isArray(answers[q.id]) ? (answers[q.id] as number[]) : [];

  const finish = () => {
    // Las respuestas múltiples se traducen a la suma de sus valores.
    const normalized: Answers = { ...answers };
    questions
      .filter((q) => q.type === "multi")
      .forEach((q) => {
        const picked = multiValues(q);
        normalized[q.id] = picked.map((i) => q.options[i]?.value ?? 0);
      });

    const result = evaluate(areaId, questions, normalized, exercises);
    actions.selectArea(areaId);
    actions.addAssessment(result);
    navigate({ to: result.triage === "URGENT" ? "/urgente" : "/resultado" });
  };

  const next = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      finish();
    }
  };

  const stepMeta = STEP_TITLES[currentStep];

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{meta?.name}</span>
            <span>
              Paso {stepIndex + 1} de {steps.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div key={currentStep} className="animate-rise space-y-2">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">{stepMeta?.title}</h1>
          <p className="text-muted-foreground">{stepMeta?.subtitle}</p>
        </div>

        <div className="space-y-5">
          {stepQuestions.map((q) => (
            <div
              key={q.id}
              className="animate-rise rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
            >
              <h2 className="font-medium">{q.title}</h2>
              {q.help ? <p className="mt-1 text-sm text-muted-foreground">{q.help}</p> : null}

              <div className="mt-4 grid gap-2">
                {q.options.map((opt, index) => {
                  const selected =
                    q.type === "multi"
                      ? multiValues(q).includes(index)
                      : answers[q.id] === opt.value;
                  return (
                    <button
                      key={`${q.id}_${index}`}
                      type="button"
                      onClick={() =>
                        q.type === "multi" ? toggleMulti(q, index, opt.value) : setSingle(q, opt.value)
                      }
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary-soft text-foreground"
                          : "border-border bg-background hover:bg-muted",
                      )}
                    >
                      {opt.label}
                      {selected ? <Check className="size-4 text-primary" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Disclaimer compact />

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => (stepIndex === 0 ? navigate({ to: "/evaluacion" }) : setStepIndex((i) => i - 1))}
          >
            <ArrowLeft className="size-4" /> Atrás
          </Button>
          <Button onClick={next} disabled={!answeredAll}>
            {stepIndex === steps.length - 1 ? "Ver mi orientación" : "Continuar"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </PageShell>
  );
}