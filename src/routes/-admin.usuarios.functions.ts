import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Único punto capaz de escribir profiles.subscription_status: usa el cliente
 * service_role (client.server.ts) para superar el trigger
 * protect_subscription_columns definido en la migración de premium tier.
 * Placeholder temporal para el futuro webhook de Stripe.
 */
export const setPremiumStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { userId: string; premium: boolean }) => data)
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) {
      throw new Error("Forbidden: solo un administrador puede cambiar el estado Premium.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: data.premium ? "PREMIUM" : "FREE",
        subscription_start: data.premium ? now : null,
        subscription_end: null,
      })
      .eq("id", data.userId);
    if (error) throw error;

    return { ok: true as const };
  });
