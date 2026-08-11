import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Program = Tables<"programs">;
export type ProgramSession = Tables<"program_sessions"> & {
  content: Pick<Tables<"content">, "id" | "slug" | "title" | "description"> | null;
  exercise: Pick<Tables<"exercises">, "id" | "slug" | "title" | "minutes"> | null;
};

export async function fetchPrograms(): Promise<Program[]> {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchProgramBySlug(slug: string): Promise<Program | null> {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchProgramSessions(programId: string): Promise<ProgramSession[]> {
  const { data, error } = await supabase
    .from("program_sessions")
    .select(
      "*, content:content_id(id, slug, title, description), exercise:exercise_id(id, slug, title, minutes)",
    )
    .eq("program_id", programId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as ProgramSession[];
}

export async function fetchEnrollment(userId: string, programId: string) {
  const { data, error } = await supabase
    .from("program_enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("program_id", programId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function enrollInProgram(userId: string, programId: string): Promise<void> {
  const { error } = await supabase
    .from("program_enrollments")
    .upsert(
      { user_id: userId, program_id: programId },
      { onConflict: "user_id,program_id", ignoreDuplicates: true },
    );
  if (error) throw error;
}

export async function fetchSessionCompletions(
  userId: string,
  sessionIds: string[],
): Promise<Set<string>> {
  if (sessionIds.length === 0) return new Set();
  const { data, error } = await supabase
    .from("program_session_completions")
    .select("program_session_id")
    .eq("user_id", userId)
    .in("program_session_id", sessionIds);
  if (error) throw error;
  return new Set(data.map((d) => d.program_session_id));
}

export async function completeSession(userId: string, sessionId: string): Promise<void> {
  const { error } = await supabase
    .from("program_session_completions")
    .upsert(
      { user_id: userId, program_session_id: sessionId },
      { onConflict: "user_id,program_session_id", ignoreDuplicates: true },
    );
  if (error) throw error;
}

export async function fetchEnrollmentsCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("program_enrollments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw error;
  return count ?? 0;
}

// ---- Gestión desde el panel de administración ----

/** Incluye programas inactivos: solo devuelve filas si quien llama es admin (RLS). */
export async function fetchAllProgramsAdmin(): Promise<Program[]> {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export type ProgramInput = {
  slug: string;
  title: string;
  description: string;
  category_id: string | null;
  duration_label: string | null;
  access_level: "FREE" | "PREMIUM";
  is_active: boolean;
};

export async function upsertProgram(input: ProgramInput, existingId?: string): Promise<Program> {
  const payload = existingId ? { id: existingId, ...input } : input;
  const { data, error } = await supabase
    .from("programs")
    .upsert(payload, { onConflict: "slug" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function setProgramActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from("programs").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;
}

/** Sesiones sin filtrar por acceso: solo visibles para admin (RLS "admins manage sessions"). */
export async function fetchAllProgramSessionsAdmin(programId: string): Promise<ProgramSession[]> {
  const { data, error } = await supabase
    .from("program_sessions")
    .select(
      "*, content:content_id(id, slug, title, description), exercise:exercise_id(id, slug, title, minutes)",
    )
    .eq("program_id", programId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as ProgramSession[];
}

export async function createSession(input: {
  program_id: string;
  sort_order: number;
  title: string;
  content_id: string | null;
  exercise_id: string | null;
}): Promise<void> {
  const { error } = await supabase.from("program_sessions").insert(input);
  if (error) throw error;
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from("program_sessions").delete().eq("id", id);
  if (error) throw error;
}
