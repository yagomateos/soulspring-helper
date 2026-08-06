import { useCallback, useSyncExternalStore } from "react";
import type { Appointment, AssessmentResult, User } from "./types";

export type AppState = {
  user: User | null;
  assessments: AssessmentResult[];
  savedRecommendations: string[];
  appointments: Appointment[];
};

const KEY = "mindguide.state.v1";

const EMPTY: AppState = {
  user: null,
  assessments: [],
  savedRecommendations: [],
  appointments: [],
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

export const actions = {
  signIn(user: User) {
    setState((s) => ({ ...s, user }));
  },
  signOut() {
    setState((s) => ({ ...s, user: null }));
  },
  addAssessment(result: AssessmentResult) {
    setState((s) => ({ ...s, assessments: [result, ...s.assessments] }));
  },
  toggleRecommendation(id: string) {
    setState((s) => ({
      ...s,
      savedRecommendations: s.savedRecommendations.includes(id)
        ? s.savedRecommendations.filter((r) => r !== id)
        : [...s.savedRecommendations, id],
    }));
  },
  addAppointment(appointment: Appointment) {
    setState((s) => ({ ...s, appointments: [...s.appointments, appointment] }));
  },
  cancelAppointment(id: string) {
    setState((s) => ({ ...s, appointments: s.appointments.filter((a) => a.id !== id) }));
  },
};

export function useAppState<T>(selector: (s: AppState) => T): T {
  const getSnapshot = useCallback(() => selector(state), [selector]);
  const getServerSnapshot = useCallback(() => selector(EMPTY), [selector]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const selectUser = (s: AppState) => s.user;
export const selectAssessments = (s: AppState) => s.assessments;
export const selectLatest = (s: AppState) => s.assessments[0] ?? null;
export const selectSaved = (s: AppState) => s.savedRecommendations;
export const selectAppointments = (s: AppState) => s.appointments;