import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_RULES } from "./ai";
import { DEFAULT_EXERCISES } from "./exercises";
import { DEFAULT_QUESTIONS } from "./questions";
import type {
  Appointment,
  AreaId,
  AssessmentResult,
  ChatMessage,
  ChatThread,
  ConsultationType,
  Exercise,
  ExerciseLog,
  MoodEntry,
  Question,
  User,
} from "./types";

export const CONSULTATION_TYPES: ConsultationType[] = [
  {
    id: "primera",
    name: "Primera consulta de orientación",
    minutes: 50,
    price: 55,
    description: "Una sesión inicial para revisar tu situación y decidir juntos los siguientes pasos.",
  },
  {
    id: "seguimiento",
    name: "Sesión de seguimiento",
    minutes: 50,
    price: 65,
    description: "Continuidad del trabajo iniciado, con objetivos y herramientas concretas.",
  },
  {
    id: "breve",
    name: "Consulta breve",
    minutes: 25,
    price: 35,
    description: "Espacio corto para resolver una duda puntual o revisar un ejercicio.",
  },
];

export const DEFAULT_SLOTS = ["09:00", "10:00", "11:00", "16:00", "17:00", "18:00", "19:00"];

/** Usuarios ficticios visibles solo en el panel de la psicóloga. */
export type PanelUser = {
  id: string;
  name: string;
  email: string;
  area: AreaId;
  triage: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  intensity: number;
  lastActivity: string;
  notes: string;
};

export const DEMO_USERS: PanelUser[] = [
  {
    id: "u1",
    name: "Laura M.",
    email: "laura.m@ejemplo.com",
    area: "ansiedad",
    triage: "HIGH",
    intensity: 78,
    lastActivity: "Hace 2 horas",
    notes: "Preocupación persistente y despertares nocturnos. Solicitó consulta.",
  },
  {
    id: "u2",
    name: "Diego R.",
    email: "diego.r@ejemplo.com",
    area: "animo",
    triage: "MEDIUM",
    intensity: 54,
    lastActivity: "Ayer",
    notes: "Baja energía tras cambio laboral. Realizando ejercicios de activación.",
  },
  {
    id: "u3",
    name: "Nerea S.",
    email: "nerea.s@ejemplo.com",
    area: "relaciones",
    triage: "LOW",
    intensity: 31,
    lastActivity: "Hace 3 días",
    notes: "Conflictos puntuales de pareja. Buena red de apoyo.",
  },
  {
    id: "u4",
    name: "Álvaro T.",
    email: "alvaro.t@ejemplo.com",
    area: "ansiedad",
    triage: "URGENT",
    intensity: 88,
    lastActivity: "Hace 30 minutos",
    notes: "Señal de alarma activada en el cuestionario. Derivación inmediata mostrada.",
  },
];

export type AppState = {
  user: User | null;
  selectedArea: AreaId | null;
  assessments: AssessmentResult[];
  savedExercises: string[];
  exerciseLogs: ExerciseLog[];
  moods: MoodEntry[];
  threads: ChatThread[];
  appointments: Appointment[];
  /** Contenido gestionable por la psicóloga */
  questions: Record<AreaId, Question[]>;
  exercises: Exercise[];
  rules: string[];
  slots: string[];
};

const KEY = "menteclara.state.v1";

const EMPTY: AppState = {
  user: null,
  selectedArea: null,
  assessments: [],
  savedExercises: [],
  exerciseLogs: [],
  moods: [],
  threads: [],
  appointments: [],
  questions: DEFAULT_QUESTIONS,
  exercises: DEFAULT_EXERCISES,
  rules: DEFAULT_RULES,
  slots: DEFAULT_SLOTS,
};

let state: AppState = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* almacenamiento no disponible */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...EMPTY, ...(JSON.parse(raw) as Partial<AppState>) };
  } catch {
    /* datos corruptos: se ignoran */
  }
}

function setState(update: (prev: AppState) => AppState) {
  state = update(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  listener();
  return () => listeners.delete(listener);
}

const uid = (p: string) => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const actions = {
  signIn(user: User) {
    setState((s) => ({ ...s, user }));
  },
  signOut() {
    setState((s) => ({ ...s, user: null }));
  },
  selectArea(area: AreaId) {
    setState((s) => ({ ...s, selectedArea: area }));
  },
  addAssessment(result: AssessmentResult) {
    setState((s) => ({ ...s, assessments: [result, ...s.assessments] }));
  },
  toggleSavedExercise(id: string) {
    setState((s) => ({
      ...s,
      savedExercises: s.savedExercises.includes(id)
        ? s.savedExercises.filter((x) => x !== id)
        : [...s.savedExercises, id],
    }));
  },
  logExercise(exerciseId: string) {
    setState((s) => ({
      ...s,
      exerciseLogs: [{ id: uid("log"), exerciseId, date: new Date().toISOString() }, ...s.exerciseLogs],
    }));
  },
  addMood(mood: number, note?: string) {
    setState((s) => ({
      ...s,
      moods: [{ id: uid("mood"), date: new Date().toISOString(), mood, note }, ...s.moods],
    }));
  },
  createThread(area: AreaId | null, title: string): string {
    const id = uid("th");
    setState((s) => ({
      ...s,
      threads: [
        { id, title, area, createdAt: new Date().toISOString(), messages: [] },
        ...s.threads,
      ],
    }));
    return id;
  },
  appendMessage(threadId: string, message: ChatMessage) {
    setState((s) => ({
      ...s,
      threads: s.threads.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, message] } : t,
      ),
    }));
  },
  addAppointment(appointment: Appointment) {
    setState((s) => ({ ...s, appointments: [appointment, ...s.appointments] }));
  },
  cancelAppointment(id: string) {
    setState((s) => ({ ...s, appointments: s.appointments.filter((a) => a.id !== id) }));
  },
  // ---- Gestión desde el panel de la psicóloga ----
  updateQuestionTitle(area: AreaId, questionId: string, title: string) {
    setState((s) => ({
      ...s,
      questions: {
        ...s.questions,
        [area]: s.questions[area].map((q) => (q.id === questionId ? { ...q, title } : q)),
      },
    }));
  },
  updateExercise(id: string, patch: Partial<Exercise>) {
    setState((s) => ({
      ...s,
      exercises: s.exercises.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  },
  removeExercise(id: string) {
    setState((s) => ({ ...s, exercises: s.exercises.filter((e) => e.id !== id) }));
  },
  setRules(rules: string[]) {
    setState((s) => ({ ...s, rules }));
  },
  toggleSlot(slot: string) {
    setState((s) => ({
      ...s,
      slots: s.slots.includes(slot) ? s.slots.filter((x) => x !== slot) : [...s.slots, slot].sort(),
    }));
  },
};

export function useAppState<T>(selector: (s: AppState) => T): T {
  const getSnapshot = useCallback(() => selector(state), [selector]);
  const getServerSnapshot = useCallback(() => selector(EMPTY), [selector]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const selectUser = (s: AppState) => s.user;
export const selectArea = (s: AppState) => s.selectedArea;
export const selectAssessments = (s: AppState) => s.assessments;
export const selectLatest = (s: AppState) => s.assessments[0] ?? null;
export const selectSaved = (s: AppState) => s.savedExercises;
export const selectExercises = (s: AppState) => s.exercises;
export const selectQuestions = (s: AppState) => s.questions;
export const selectThreads = (s: AppState) => s.threads;
export const selectMoods = (s: AppState) => s.moods;
export const selectLogs = (s: AppState) => s.exerciseLogs;
export const selectAppointments = (s: AppState) => s.appointments;
export const selectRules = (s: AppState) => s.rules;
export const selectSlots = (s: AppState) => s.slots;