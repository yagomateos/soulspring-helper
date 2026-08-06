import { QUESTIONS } from "./questions";
import type { Answers, AssessmentResult, Dimension, DimensionScore } from "./types";

const LABELS: Record<Dimension, string> = {
  ansiedad: "Ansiedad",
  animo: "Estado de ánimo",
  estres: "Estrés",
  sueno: "Hábitos de sueño",
  relaciones: "Relaciones",
  autoestima: "Autoestima",
  trabajo: "Trabajo",
};

// Dimensiones donde puntuar alto en las preguntas significa malestar.
const INVERSE: Dimension[] = ["ansiedad", "animo", "estres", "sueno"];

const SUMMARIES: Record<Dimension, Record<"bajo" | "moderado" | "alto", string>> = {
  ansiedad: {
    bajo: "Tu nivel de ansiedad parece elevado. Aparecen preocupación difícil de frenar y activación física.",
    moderado: "Hay señales de ansiedad puntual que aparece en momentos concretos del día.",
    alto: "Tu ansiedad parece estar en un rango manejable en estas semanas.",
  },
  animo: {
    bajo: "Tu estado de ánimo está bajo: menos disfrute y más desgana de lo habitual.",
    moderado: "Tu ánimo fluctúa; hay días buenos y días con menos energía emocional.",
    alto: "Tu estado de ánimo se mantiene estable y con capacidad de disfrute.",
  },
  estres: {
    bajo: "Tu nivel de estrés es alto y te cuesta desconectar de las demandas diarias.",
    moderado: "Notas tensión en picos concretos, pero logras recuperarte parcialmente.",
    alto: "Gestionas bien la carga diaria y encuentras momentos de pausa.",
  },
  sueno: {
    bajo: "Tu descanso está afectado: cuesta conciliar o no resulta reparador.",
    moderado: "Tu sueño es irregular; la rutina previa a dormir podría mejorar.",
    alto: "Tus hábitos de sueño son sólidos y tu descanso es reparador.",
  },
  relaciones: {
    bajo: "Sientes poca red de apoyo o dificultad para expresar lo que necesitas.",
    moderado: "Tienes apoyos, aunque no siempre te apoyas en ellos cuando lo necesitas.",
    alto: "Cuentas con vínculos de confianza y sabes recurrir a ellos.",
  },
  autoestima: {
    bajo: "Tu diálogo interno es exigente y tiende a la autocrítica.",
    moderado: "Tu autoestima es variable y depende bastante de los resultados.",
    alto: "Te tratas con amabilidad y reconoces tu valor con realismo.",
  },
  trabajo: {
    bajo: "El trabajo está invadiendo tu espacio personal y drenando tu energía.",
    moderado: "Mantienes límites parciales, con jornadas que a veces se alargan.",
    alto: "Tienes límites claros y tu actividad te aporta sentido.",
  },
};

export const levelOf = (score: number): "bajo" | "moderado" | "alto" =>
  score < 40 ? "bajo" : score < 70 ? "moderado" : "alto";

export function scoreAssessment(answers: Answers, goals: string[]): AssessmentResult {
  const dims = Object.keys(LABELS) as Dimension[];

  const scores: DimensionScore[] = dims.map((dimension) => {
    const qs = QUESTIONS.filter((q) => q.dimension === dimension);
    const max = qs.length * 3;
    const raw = qs.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
    const ratio = max === 0 ? 0 : raw / max;
    const wellbeing = INVERSE.includes(dimension) ? 1 - ratio : ratio;
    const score = Math.round(wellbeing * 100);
    const level = levelOf(score);
    return { dimension, label: LABELS[dimension], score, level, summary: SUMMARIES[dimension][level] };
  });

  const overall = Math.round(scores.reduce((s, d) => s + d.score, 0) / scores.length);
  const weakest = [...scores].sort((a, b) => a.score - b.score)[0];
  const strongest = [...scores].sort((a, b) => b.score - a.score)[0];

  const summary =
    overall >= 70
      ? `Tu bienestar general se ve equilibrado. Destaca especialmente ${strongest.label.toLowerCase()}, y aun así hay margen de cuidado en ${weakest.label.toLowerCase()}.`
      : overall >= 45
        ? `Estás en un momento de carga moderada. ${strongest.label} funciona como recurso protector, mientras que ${weakest.label.toLowerCase()} es donde más se nota el desgaste.`
        : `Pareces estar atravesando un momento exigente. El área que más atención pide ahora es ${weakest.label.toLowerCase()}; empezar por ahí, con pasos pequeños, suele aliviar al resto.`;

  return {
    id: `asm_${Date.now()}`,
    date: new Date().toISOString(),
    goals,
    overall,
    scores,
    summary,
  };
}