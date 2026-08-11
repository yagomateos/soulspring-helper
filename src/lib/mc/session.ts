import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type AuthUser = { id: string; email: string | null };

let state: { known: boolean; user: AuthUser | null } = { known: false, user: null };
const listeners = new Set<() => void>();
let initialized = false;

function toAuthUser(session: Session | null): AuthUser | null {
  return session?.user ? { id: session.user.id, email: session.user.email ?? null } : null;
}

function setState(next: { known: boolean; user: AuthUser | null }) {
  state = next;
  listeners.forEach((l) => l());
}

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  supabase.auth.getSession().then(({ data }) => {
    setState({ known: true, user: toAuthUser(data.session) });
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    setState({ known: true, user: toAuthUser(session) });
  });
}

function subscribe(listener: () => void) {
  init();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return { known: false, user: null } as const;
}

/** Estado bruto de autenticación (sin el perfil). */
export function useAuthUser() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const profileQueryKey = (userId: string | undefined) => ["profile", userId] as const;

/**
 * Fuente de verdad para identidad + perfil (incluye subscription_status).
 * El resto del estado de la app (moods, ejercicios guardados, hilos de chat,
 * citas) sigue viviendo en src/lib/mc/store.ts, sin cambios.
 */
export function useSession() {
  const { known, user } = useAuthUser();

  const profileQuery = useQuery({
    queryKey: profileQueryKey(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return {
    loading: !known || (!!user && profileQuery.isLoading),
    user,
    profile: user ? (profileQuery.data ?? null) : null,
  };
}

export function isPremium(profile: Profile | null | undefined) {
  return profile?.subscription_status === "PREMIUM";
}

/** Solo protege la UI (mostrar/ocultar el panel); la seguridad real es la RLS de cada tabla. */
export function useIsAdmin() {
  const { user } = useAuthUser();

  const { data } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
    enabled: !!user,
  });

  return !!data;
}
