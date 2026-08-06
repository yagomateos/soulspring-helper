export type Dimension =
  | "ansiedad"
  | "animo"
  | "estres"
  | "sueno"
  | "relaciones"
  | "autoestima"
  | "trabajo";

export type Question = {
  id: string;
  dimension: Dimension;
  step: number;
  title: string;
  help?: string;
  options: { label: string; value: number }[];
};

export type Answers = Record<string, number>;

export type DimensionScore = {
  dimension: Dimension;
  label: string;
  score: number; // 0-100, mayor = mejor bienestar
  level: "bajo" | "moderado" | "alto";
  summary: string;
};

export type AssessmentResult = {
  id: string;
  date: string;
  goals: string[];
  overall: number;
  scores: DimensionScore[];
  summary: string;
};

export type Recommendation = {
  id: string;
  title: string;
  icon: string;
  minutes: number;
  description: string;
  dimensions: Dimension[];
};

export type Appointment = {
  id: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  therapist: string;
};

export type User = { name: string; email: string; provider: "email" | "google" };