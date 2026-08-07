export type AreaId = "ansiedad" | "animo" | "relaciones";

export type Factor =
  | "intensidad"
  | "duracion"
  | "frecuencia"
  | "impacto"
  | "eventos"
  | "alarma";

export type QuestionOption = { label: string; value: number };

export type Question = {
  id: string;
  area: AreaId;
  step: number;
  factor: Factor;
  title: string;
  help?: string;
  /** multi = varias respuestas (acontecimientos vitales) */
  type: "single" | "multi";
  options: QuestionOption[];
  /** Si la respuesta iguala o supera este valor se activa una señal de alarma. */
  alarmAt?: number;
};

export type Answers = Record<string, number | number[]>;

export type TriageLevel = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type FactorScore = { factor: Factor; label: string; score: number };

export type AssessmentResult = {
  id: string;
  area: AreaId;
  date: string;
  answers: Answers;
  factors: FactorScore[];
  /** 0-100, mayor = mayor malestar percibido */
  intensity: number;
  triage: TriageLevel;
  aspects: string[];
  related: string[];
  recommendations: string[];
  exerciseIds: string[];
  summary: string;
};

export type ExerciseCategory =
  | "respiracion"
  | "ansiedad"
  | "desescalada"
  | "sueno"
  | "diario"
  | "relaciones";

export type Exercise = {
  id: string;
  title: string;
  category: ExerciseCategory;
  minutes: number;
  description: string;
  instructions: string[];
  areas: AreaId[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
};

export type ChatThread = {
  id: string;
  title: string;
  area: AreaId | null;
  createdAt: string;
  messages: ChatMessage[];
};

export type MoodEntry = {
  id: string;
  date: string;
  mood: number; // 1-5
  note?: string | undefined;
};

export type ExerciseLog = { id: string; exerciseId: string; date: string };

export type ConsultationType = {
  id: string;
  name: string;
  minutes: number;
  price: number;
  description: string;
};

export type Appointment = {
  id: string;
  typeId: string;
  date: string;
  time: string;
  createdAt: string;
};

export type User = { name: string; email: string; provider: "email" | "google" };