import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type RecommendationRow = Tables<"recommendations">;

export async function fetchAllRecommendationsAdmin(): Promise<RecommendationRow[]> {
  const { data, error } = await supabase
    .from("recommendations")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export type RecommendationInput = {
  area: string;
  triage: string | null;
  text: string;
  is_active: boolean;
};

export async function upsertRecommendation(
  input: RecommendationInput,
  existingId?: string,
): Promise<void> {
  const payload = existingId ? { id: existingId, ...input } : input;
  const { error } = await supabase.from("recommendations").upsert(payload);
  if (error) throw error;
}

export async function setRecommendationActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from("recommendations")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw error;
}
