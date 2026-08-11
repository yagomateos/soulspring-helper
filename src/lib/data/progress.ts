import { supabase } from "@/integrations/supabase/client";

export type ActivityItem = {
  id: string;
  kind: "program" | "exercise" | "content";
  label: string;
  at: string;
};

export type SeguimientoSummary = {
  programsStarted: number;
  exercisesCompleted: number;
  contentViewed: number;
  recent: ActivityItem[];
};

export async function fetchSeguimientoSummary(userId: string): Promise<SeguimientoSummary> {
  const [
    enrollmentsCount,
    exerciseCompletionsCount,
    contentCompletionsCount,
    recentEnrollments,
    recentExercises,
    recentContent,
  ] = await Promise.all([
    supabase
      .from("program_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("exercise_completions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("content_completions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("program_enrollments")
      .select("id, started_at, programs(title)")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(5),
    supabase
      .from("exercise_completions")
      .select("id, created_at, exercise_slug")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("content_completions")
      .select("id, viewed_at, content(title)")
      .eq("user_id", userId)
      .order("viewed_at", { ascending: false })
      .limit(5),
  ]);

  for (const r of [
    enrollmentsCount,
    exerciseCompletionsCount,
    contentCompletionsCount,
    recentEnrollments,
    recentExercises,
    recentContent,
  ]) {
    if (r.error) throw r.error;
  }

  const recent: ActivityItem[] = [
    ...(recentEnrollments.data ?? []).map((e) => ({
      id: e.id,
      kind: "program" as const,
      label: `Programa iniciado: ${(e.programs as { title: string } | null)?.title ?? "Programa"}`,
      at: e.started_at,
    })),
    ...(recentExercises.data ?? []).map((e) => ({
      id: e.id,
      kind: "exercise" as const,
      label: `Ejercicio completado: ${e.exercise_slug}`,
      at: e.created_at,
    })),
    ...(recentContent.data ?? []).map((c) => ({
      id: c.id,
      kind: "content" as const,
      label: `Contenido visto: ${(c.content as { title: string } | null)?.title ?? "Recurso"}`,
      at: c.viewed_at,
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  return {
    programsStarted: enrollmentsCount.count ?? 0,
    exercisesCompleted: exerciseCompletionsCount.count ?? 0,
    contentViewed: contentCompletionsCount.count ?? 0,
    recent,
  };
}
