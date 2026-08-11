import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ExerciseRow = Tables<"exercises">;

export async function fetchAllExercisesAdmin(): Promise<ExerciseRow[]> {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("title", { ascending: true });
  if (error) throw error;
  return data;
}

export type ExerciseInput = {
  slug: string;
  title: string;
  category: string;
  minutes: number;
  description: string;
  instructions: string[];
  areas: string[];
  is_active: boolean;
};

export async function upsertExercise(input: ExerciseInput, existingId?: string): Promise<void> {
  const payload = existingId ? { id: existingId, ...input } : input;
  const { error } = await supabase.from("exercises").upsert(payload, { onConflict: "slug" });
  if (error) throw error;
}

export async function setExerciseActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from("exercises").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;
}
