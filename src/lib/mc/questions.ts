import type { AreaId, Question } from "./types";

const freq = [
  { label: "Nunca o casi nunca", value: 0 },
  { label: "Algunos días", value: 1 },
  { label: "Más de la mitad de los días", value: 2 },
  { label: "Casi cada día", value: 3 },
];

const intensity = [
  { label: "Leve", value: 0 },
  { label: "Moderada", value: 1 },
  { label: "Intensa", value: 2 },
  { label: "Muy intensa", value: 3 },
];

const duration = [
  { label: "Menos de 2 semanas", value: 0 },
  { label: "Entre 2 semanas y 1 mes", value: 1 },
  { label: "Entre 1 y 6 meses", value: 2 },
  { label: "Más de 6 meses", value: 3 },
];

const impact = [
  { label: "Apenas me afecta", value: 0 },
  { label: "Me afecta un poco", value: 1 },
  { label: "Me afecta bastante", value: 2 },
  { label: "Me afecta mucho", value: 3 },
];

const events = [
  { label: "Cambio o pérdida de trabajo", value: 1 },
  { label: "Ruptura o conflicto de pareja", value: 1 },
  { label: "Pérdida de un ser querido", value: 1 },
  { label: "Problema de salud propio o cercano", value: 1 },
  { label: "Mudanza o cambio vital importante", value: 1 },
  { label: "Dificultades económicas", value: 1 },
  { label: "Nada de lo anterior", value: 0 },
];

/** Preguntas de señales de alarma comunes a todas las áreas. */
const alarmQuestions = (area: AreaId, step: number): Question[] => [
  {
    id: `${area}_al1`,
    area,
    step,
    factor: "alarma",
    type: "single",
    title: "En las últimas semanas, ¿has tenido pensamientos de hacerte daño o de no querer seguir viviendo?",
    help: "Responder con sinceridad nos ayuda a orientarte mejor. Esta información es confidencial.",
    options: [
      { label: "No", value: 0 },
      { label: "Han pasado por mi cabeza de forma puntual", value: 2 },
      { label: "Sí, con frecuencia", value: 3 },
    ],
    alarmAt: 2,
  },
  {
    id: `${area}_al2`,
    area,
    step,
    factor: "alarma",
    type: "single",
    title: "¿Has aumentado el consumo de alcohol u otras sustancias para sobrellevar cómo te sientes?",
    options: [
      { label: "No", value: 0 },
      { label: "Algo más de lo habitual", value: 1 },
      { label: "Bastante más de lo habitual", value: 2 },
    ],
  },
  {
    id: `${area}_al3`,
    area,
    step,
    factor: "alarma",
    type: "single",
    title: "¿Sientes que ahora mismo no puedes gestionar la situación por ti mismo/a?",
    options: [
      { label: "No, voy manejándolo", value: 0 },
      { label: "A veces me supera", value: 1 },
      { label: "Sí, me siento sobrepasado/a", value: 2 },
    ],
  },
];

const common = (area: AreaId): Question[] => [
  {
    id: `${area}_dur`,
    area,
    step: 3,
    factor: "duracion",
    type: "single",
    title: "¿Desde cuándo te ocurre esto?",
    options: duration,
  },
  {
    id: `${area}_imp1`,
    area,
    step: 4,
    factor: "impacto",
    type: "single",
    title: "¿Cuánto está afectando a tu día a día (trabajo, estudios, tareas)?",
    options: impact,
  },
  {
    id: `${area}_imp2`,
    area,
    step: 4,
    factor: "impacto",
    type: "single",
    title: "¿Cuánto está afectando a tus relaciones y a tu tiempo libre?",
    options: impact,
  },
  {
    id: `${area}_ev`,
    area,
    step: 5,
    factor: "eventos",
    type: "multi",
    title: "¿Ha ocurrido algo de esto en los últimos meses?",
    help: "Puedes seleccionar varias opciones.",
    options: events,
  },
  ...alarmQuestions(area, 6),
];

const ANSIEDAD: Question[] = [
  {
    id: "ansiedad_f1",
    area: "ansiedad",
    step: 1,
    factor: "frecuencia",
    type: "single",
    title: "¿Con qué frecuencia te has sentido nervioso/a o con los nervios de punta?",
    help: "Piensa en las dos últimas semanas.",
    options: freq,
  },
  {
    id: "ansiedad_f2",
    area: "ansiedad",
    step: 1,
    factor: "frecuencia",
    type: "single",
    title: "¿Con qué frecuencia te ha costado dejar de preocuparte?",
    options: freq,
  },
  {
    id: "ansiedad_i1",
    area: "ansiedad",
    step: 2,
    factor: "intensidad",
    type: "single",
    title: "Cuando aparece, ¿cómo describirías la intensidad de esa ansiedad?",
    options: intensity,
  },
  {
    id: "ansiedad_i2",
    area: "ansiedad",
    step: 2,
    factor: "intensidad",
    type: "single",
    title: "¿Con qué intensidad notas síntomas físicos (taquicardia, tensión, falta de aire)?",
    options: intensity,
  },
  ...common("ansiedad"),
];

const ANIMO: Question[] = [
  {
    id: "animo_f1",
    area: "animo",
    step: 1,
    factor: "frecuencia",
    type: "single",
    title: "¿Con qué frecuencia te has sentido decaído/a, triste o sin esperanza?",
    help: "Piensa en las dos últimas semanas.",
    options: freq,
  },
  {
    id: "animo_f2",
    area: "animo",
    step: 1,
    factor: "frecuencia",
    type: "single",
    title: "¿Con qué frecuencia has sentido poco interés o placer en hacer cosas?",
    options: freq,
  },
  {
    id: "animo_i1",
    area: "animo",
    step: 2,
    factor: "intensidad",
    type: "single",
    title: "¿Cómo describirías la intensidad de ese malestar emocional?",
    options: intensity,
  },
  {
    id: "animo_i2",
    area: "animo",
    step: 2,
    factor: "intensidad",
    type: "single",
    title: "¿Con qué intensidad notas cansancio, falta de energía o problemas de sueño?",
    options: intensity,
  },
  ...common("animo"),
];

const RELACIONES: Question[] = [
  {
    id: "relaciones_f1",
    area: "relaciones",
    step: 1,
    factor: "frecuencia",
    type: "single",
    title: "¿Con qué frecuencia aparecen conflictos o malestar en esa relación?",
    options: freq,
  },
  {
    id: "relaciones_f2",
    area: "relaciones",
    step: 1,
    factor: "frecuencia",
    type: "single",
    title: "¿Con qué frecuencia te cuesta expresar lo que sientes o necesitas?",
    options: freq,
  },
  {
    id: "relaciones_i1",
    area: "relaciones",
    step: 2,
    factor: "intensidad",
    type: "single",
    title: "¿Cómo describirías el malestar que te genera esta situación?",
    options: intensity,
  },
  {
    id: "relaciones_i2",
    area: "relaciones",
    step: 2,
    factor: "intensidad",
    type: "single",
    title: "¿Con qué intensidad piensas o le das vueltas a esta relación a lo largo del día?",
    options: intensity,
  },
  ...common("relaciones"),
];

/** Banco de preguntas por defecto. La psicóloga puede editarlo desde el panel. */
export const DEFAULT_QUESTIONS: Record<AreaId, Question[]> = {
  ansiedad: ANSIEDAD,
  animo: ANIMO,
  relaciones: RELACIONES,
};

export const STEP_TITLES: Record<number, { title: string; subtitle: string }> = {
  1: { title: "Frecuencia", subtitle: "Con qué asiduidad aparece" },
  2: { title: "Intensidad", subtitle: "Con qué fuerza lo vives" },
  3: { title: "Duración", subtitle: "Desde cuándo te ocurre" },
  4: { title: "Impacto", subtitle: "Cómo afecta a tu vida diaria" },
  5: { title: "Contexto", subtitle: "Acontecimientos relacionados" },
  6: { title: "Bienestar", subtitle: "Algunas preguntas de seguridad" },
};

export const stepsOf = (questions: Question[]) =>
  [...new Set(questions.map((q) => q.step))].sort((a, b) => a - b);