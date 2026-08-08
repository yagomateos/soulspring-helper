import type {
  Answers,
  AreaId,
  AssessmentResult,
  Exercise,
  Factor,
  FactorScore,
  Question,
  TriageLevel,
} from "./types";

export const FACTOR_LABELS: Record<Factor, string> = {
  intensidad: "Intensidad",
  duracion: "Duración",
  frecuencia: "Frecuencia",
  impacto: "Impacto en tu vida diaria",
  eventos: "Acontecimientos vitales",
  alarma: "Señales de alerta",
};

export const TRIAGE_LABELS: Record<TriageLevel, string> = {
  LOW: "Orientación general",
  MEDIUM: "Seguimiento recomendado",
  HIGH: "Valoración profesional recomendada",
  URGENT: "Atención profesional inmediata",
};

const answerValue = (answers: Answers, q: Question): number => {
  const raw = answers[q.id];
  if (Array.isArray(raw)) return raw.reduce((s, v) => s + v, 0);
  return typeof raw === "number" ? raw : 0;
};

/** Puntúa un factor de 0 a 100 (mayor = mayor malestar/carga). */
function factorScore(questions: Question[], answers: Answers, factor: Factor): number {
  const qs = questions.filter((q) => q.factor === factor);
  if (qs.length === 0) return 0;
  const max = qs.reduce(
    (sum, q) =>
      sum +
      (q.type === "multi"
        ? Math.max(3, q.options.filter((o) => o.value > 0).length)
        : Math.max(...q.options.map((o) => o.value))),
    0,
  );
  const raw = qs.reduce((sum, q) => sum + answerValue(answers, q), 0);
  return max === 0 ? 0 : Math.min(100, Math.round((raw / max) * 100));
}

export function hasUrgentSignal(questions: Question[], answers: Answers): boolean {
  return questions.some((q) => q.alarmAt !== undefined && answerValue(answers, q) >= q.alarmAt);
}

const ASPECTS: Record<AreaId, Record<Factor, string>> = {
  ansiedad: {
    frecuencia: "La preocupación y los nervios aparecen de forma habitual en tu día a día.",
    intensidad: "Cuando la ansiedad aparece, la vives con bastante intensidad, también en el cuerpo.",
    duracion: "La situación se mantiene desde hace tiempo y no parece puntual.",
    impacto: "La ansiedad está condicionando tus rutinas, tu trabajo o tu tiempo libre.",
    eventos: "Hay acontecimientos recientes que pueden estar alimentando esta activación.",
    alarma: "Aparecen señales que conviene revisar con una profesional.",
  },
  animo: {
    frecuencia: "El ánimo bajo o la falta de interés aparecen la mayoría de los días.",
    intensidad: "El malestar emocional y el cansancio se viven con fuerza.",
    duracion: "Llevas un periodo largo sintiéndote así.",
    impacto: "El estado de ánimo está afectando a tus rutinas y a tus relaciones.",
    eventos: "Hay cambios vitales recientes que pueden estar influyendo.",
    alarma: "Aparecen señales que conviene revisar con una profesional.",
  },
  relaciones: {
    frecuencia: "Los conflictos o la dificultad para expresarte se repiten con frecuencia.",
    intensidad: "La situación relacional te genera un malestar importante.",
    duracion: "Es un patrón que se mantiene en el tiempo.",
    impacto: "Lo que ocurre en la relación se traslada a otras áreas de tu vida.",
    eventos: "Hay circunstancias recientes que pueden estar tensando el vínculo.",
    alarma: "Aparecen señales que conviene revisar con una profesional.",
  },
};

const RELATED: Record<AreaId, string[]> = {
  ansiedad: [
    "Anticipación constante de escenarios negativos.",
    "Descanso insuficiente o de mala calidad.",
    "Dificultad para desconectar de las obligaciones.",
  ],
  animo: [
    "Reducción de actividades que antes resultaban gratificantes.",
    "Autoexigencia y diálogo interno crítico.",
    "Alteraciones en el sueño o en la energía.",
  ],
  relaciones: [
    "Dificultad para expresar necesidades de forma clara.",
    "Patrones de comunicación que se repiten en el conflicto.",
    "Miedo al rechazo o a la pérdida del vínculo.",
  ],
};

const BASE_RECS: Record<AreaId, string[]> = {
  ansiedad: [
    "Introduce una práctica breve de respiración pausada dos veces al día.",
    "Acota el tiempo que dedicas a las preocupaciones a una franja concreta.",
    "Reduce estimulantes y pantallas en las dos horas previas a dormir.",
  ],
  animo: [
    "Recupera una actividad agradable al día, aunque sea breve.",
    "Mantén horarios regulares de sueño y comidas.",
    "Sal a caminar con luz natural al menos 20 minutos.",
  ],
  relaciones: [
    "Escribe qué necesitas del vínculo antes de conversarlo.",
    "Elige un momento tranquilo para plantear una petición concreta.",
    "Diferencia lo que depende de ti de lo que depende de la otra persona.",
  ],
};

export function triageOf(intensity: number, urgent: boolean): TriageLevel {
  if (urgent) return "URGENT";
  if (intensity >= 70) return "HIGH";
  if (intensity >= 45) return "MEDIUM";
  return "LOW";
}

export function evaluate(
  area: AreaId,
  questions: Question[],
  answers: Answers,
  exercises: Exercise[],
): AssessmentResult {
  const factors: FactorScore[] = (
    ["frecuencia", "intensidad", "duracion", "impacto", "eventos"] as Factor[]
  ).map((factor) => ({
    factor,
    label: FACTOR_LABELS[factor],
    score: factorScore(questions, answers, factor),
  }));

  const weights: Partial<Record<Factor, number>> = {
    frecuencia: 0.3,
    intensidad: 0.3,
    duracion: 0.15,
    impacto: 0.2,
    eventos: 0.05,
  };
  const intensity = Math.round(
    factors.reduce((sum, f) => sum + f.score * (weights[f.factor] ?? 0), 0),
  );

  const alarmLoad = factorScore(questions, answers, "alarma");
  const urgent = hasUrgentSignal(questions, answers);
  let triage = triageOf(intensity, urgent);
  if (!urgent && alarmLoad >= 50 && triage === "LOW") triage = "MEDIUM";
  if (!urgent && alarmLoad >= 60 && triage === "MEDIUM") triage = "HIGH";

  const aspects = factors
    .filter((f) => f.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((f) => ASPECTS[area][f.factor]);

  const recommendations = BASE_RECS[area];
  const exerciseIds = exercises
    .filter((e) => e.areas.includes(area))
    .slice(0, 4)
    .map((e) => e.id);

  const summary =
    triage === "URGENT"
      ? "Por lo que nos cuentas, esta plataforma no puede valorar adecuadamente tu situación."
      : triage === "HIGH"
        ? "Tus respuestas describen un malestar sostenido que está afectando a tu día a día. Una valoración profesional puede ayudarte a ordenarlo."
        : triage === "MEDIUM"
          ? "Tus respuestas apuntan a un malestar presente pero manejable. Un seguimiento y algunos hábitos concretos pueden marcar diferencia."
          : "Tus respuestas describen un malestar leve o puntual. Las recomendaciones generales pueden serte suficientes por ahora.";

  return {
    id: `ev_${Date.now()}`,
    area,
    date: new Date().toISOString(),
    answers,
    factors,
    intensity,
    triage,
    aspects: aspects.length > 0 ? aspects : ["No destacan aspectos con especial carga en este momento."],
    related: RELATED[area],
    recommendations,
    exerciseIds,
    summary,
  };
}