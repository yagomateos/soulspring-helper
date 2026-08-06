import type { Question } from "./types";

const freq = [
  { label: "Nunca", value: 0 },
  { label: "Algunos días", value: 1 },
  { label: "Más de la mitad de los días", value: 2 },
  { label: "Casi cada día", value: 3 },
];

const agree = [
  { label: "Nada de acuerdo", value: 0 },
  { label: "Un poco", value: 1 },
  { label: "Bastante", value: 2 },
  { label: "Totalmente", value: 3 },
];

export const STEPS = [
  { id: 1, title: "Ansiedad", subtitle: "Cómo ha estado tu nivel de alerta" },
  { id: 2, title: "Estado de ánimo", subtitle: "Cómo te has sentido por dentro" },
  { id: 3, title: "Estrés", subtitle: "La carga de tus días" },
  { id: 4, title: "Sueño", subtitle: "Tu descanso de las últimas semanas" },
  { id: 5, title: "Relaciones", subtitle: "Tu red de apoyo" },
  { id: 6, title: "Autoestima", subtitle: "La relación contigo mismo/a" },
  { id: 7, title: "Trabajo", subtitle: "Tu día a día laboral o de estudios" },
  { id: 8, title: "Objetivos", subtitle: "Qué te gustaría conseguir" },
];

export const QUESTIONS: Question[] = [
  {
    id: "anx1",
    dimension: "ansiedad",
    step: 1,
    title: "¿Con qué frecuencia te has sentido nervioso/a o con los nervios de punta?",
    help: "Piensa en las últimas dos semanas.",
    options: freq,
  },
  {
    id: "anx2",
    dimension: "ansiedad",
    step: 1,
    title: "¿Te ha costado dejar de preocuparte o controlar la preocupación?",
    options: freq,
  },
  {
    id: "anx3",
    dimension: "ansiedad",
    step: 1,
    title: "¿Has notado síntomas físicos como taquicardia, tensión o falta de aire?",
    options: freq,
  },
  {
    id: "mood1",
    dimension: "animo",
    step: 2,
    title: "¿Has sentido poco interés o placer en hacer cosas?",
    options: freq,
  },
  {
    id: "mood2",
    dimension: "animo",
    step: 2,
    title: "¿Te has sentido decaído/a, deprimido/a o sin esperanza?",
    options: freq,
  },
  {
    id: "mood3",
    dimension: "animo",
    step: 2,
    title: "¿Has notado que te cuesta disfrutar de lo que antes te gustaba?",
    options: freq,
  },
  {
    id: "str1",
    dimension: "estres",
    step: 3,
    title: "¿Has sentido que las demandas del día superan lo que puedes gestionar?",
    options: freq,
  },
  {
    id: "str2",
    dimension: "estres",
    step: 3,
    title: "¿Te ha costado desconectar y parar durante el día?",
    options: freq,
  },
  {
    id: "str3",
    dimension: "estres",
    step: 3,
    title: "¿Has notado irritabilidad o cambios de humor por la tensión acumulada?",
    options: freq,
  },
  {
    id: "sleep1",
    dimension: "sueno",
    step: 4,
    title: "¿Has tenido dificultad para dormirte o mantener el sueño?",
    options: freq,
  },
  {
    id: "sleep2",
    dimension: "sueno",
    step: 4,
    title: "¿Te despiertas con sensación de no haber descansado?",
    options: freq,
  },
  {
    id: "sleep3",
    dimension: "sueno",
    step: 4,
    title: "¿Usas pantallas o trabajas hasta poco antes de acostarte?",
    options: freq,
  },
  {
    id: "rel1",
    dimension: "relaciones",
    step: 5,
    title: "Cuento con personas con las que puedo hablar de lo que me pasa.",
    options: agree,
  },
  {
    id: "rel2",
    dimension: "relaciones",
    step: 5,
    title: "Me siento cómodo/a expresando lo que necesito a los demás.",
    options: agree,
  },
  {
    id: "rel3",
    dimension: "relaciones",
    step: 5,
    title: "Dedico tiempo a relaciones que me hacen bien.",
    options: agree,
  },
  {
    id: "self1",
    dimension: "autoestima",
    step: 6,
    title: "Me trato con la misma amabilidad con la que trataría a un amigo.",
    options: agree,
  },
  {
    id: "self2",
    dimension: "autoestima",
    step: 6,
    title: "Reconozco mis logros sin restarles valor.",
    options: agree,
  },
  {
    id: "self3",
    dimension: "autoestima",
    step: 6,
    title: "Puedo cometer errores sin sentir que definen quién soy.",
    options: agree,
  },
  {
    id: "work1",
    dimension: "trabajo",
    step: 7,
    title: "Consigo poner límites entre el trabajo y mi vida personal.",
    options: agree,
  },
  {
    id: "work2",
    dimension: "trabajo",
    step: 7,
    title: "Termino la jornada con energía suficiente para mí.",
    options: agree,
  },
  {
    id: "work3",
    dimension: "trabajo",
    step: 7,
    title: "Siento que mi trabajo o estudios tienen sentido para mí.",
    options: agree,
  },
];

export const GOALS = [
  "Reducir la ansiedad",
  "Dormir mejor",
  "Gestionar el estrés",
  "Mejorar mi autoestima",
  "Sentirme con más energía",
  "Mejorar mis relaciones",
  "Poner límites en el trabajo",
  "Entenderme mejor",
];

export const questionsForStep = (step: number) => QUESTIONS.filter((q) => q.step === step);