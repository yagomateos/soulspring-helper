import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isPremium, type Profile } from "@/lib/mc/session";

export function PremiumStatusCard({ profile }: { profile: Profile | null }) {
  const premium = isPremium(profile);

  return (
    <div className="animate-rise flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Sparkles className="size-4.5" />
        </span>
        <div>
          <p className="font-display text-base font-semibold">
            {premium ? "Miembro Premium" : "Cuenta gratuita"}
          </p>
          <p className="text-sm text-muted-foreground">
            {premium
              ? profile?.subscription_end
                ? `Activa hasta el ${new Date(profile.subscription_end).toLocaleDateString("es-ES")}`
                : "Tienes acceso a la biblioteca, programas y seguimiento Premium."
              : "Accede a contenido y ejercicios básicos. Pasa a Premium para desbloquear todo."}
          </p>
        </div>
      </div>
      {!premium ? (
        <Button asChild>
          <Link to="/premium">Pasar a Premium</Link>
        </Button>
      ) : (
        <Button variant="soft" asChild>
          <Link to="/seguimiento">Ver mi seguimiento</Link>
        </Button>
      )}
    </div>
  );
}
