import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type ContentItem = Tables<"content">;
export type ContentCategory = Tables<"content_categories">;

export async function fetchContentCategories(): Promise<ContentCategory[]> {
  const { data, error } = await supabase
    .from("content_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Devuelve el contenido visible para el usuario actual. RLS ya filtra las
 * filas PREMIUM si el usuario no es premium/admin — esto no es solo un
 * filtro de UI, la API no devuelve esas filas en absoluto.
 */
export async function fetchContentList(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchContentBySlug(slug: string): Promise<ContentItem | null> {
  const { data, error } = await supabase.from("content").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Devuelve el cuerpo real del contenido, o null si es PREMIUM y el usuario no
 * tiene acceso: en ese caso la fila de content_bodies no existe para su RLS,
 * no es un ocultamiento de UI — la API no la entrega.
 */
export async function fetchContentBody(contentId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("content_bodies")
    .select("body")
    .eq("content_id", contentId)
    .maybeSingle();
  if (error) throw error;
  return data?.body ?? null;
}

export async function markContentViewed(userId: string, contentId: string): Promise<void> {
  const { error } = await supabase
    .from("content_completions")
    .insert({ user_id: userId, content_id: contentId });
  if (error) throw error;
}

export async function fetchContentCompletionsCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("content_completions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw error;
  return count ?? 0;
}

// ---- Gestión desde el panel de administración ----

/** Incluye contenido inactivo: solo devuelve filas si quien llama es admin (RLS). */
export async function fetchAllContentAdmin(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from("content")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export type ContentInput = {
  slug: string;
  title: string;
  description: string;
  category_id: string | null;
  duration_minutes: number | null;
  access_level: "FREE" | "PREMIUM";
  is_active: boolean;
  body: string;
};

export async function upsertContent(input: ContentInput, existingId?: string): Promise<void> {
  const { body, ...contentFields } = input;
  const payload: TablesInsert<"content"> = { ...contentFields };
  if (existingId) payload.id = existingId;
  const { data, error } = await supabase
    .from("content")
    .upsert(payload, { onConflict: "slug" })
    .select("id")
    .single();
  if (error) throw error;

  const { error: bodyError } = await supabase
    .from("content_bodies")
    .upsert({ content_id: data.id, body }, { onConflict: "content_id" });
  if (bodyError) throw bodyError;
}

export async function setContentActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from("content").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;
}
