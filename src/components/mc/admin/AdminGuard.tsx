import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useIsAdmin, useSession } from "@/lib/mc/session";

/** Protección de UI del panel de Marina; la seguridad real es la RLS de cada tabla. */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const isAdmin = useIsAdmin();

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando…</p>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="animate-rise flex flex-col items-center gap-3 rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <p className="text-sm text-muted-foreground">
          Esta sección es solo para el equipo profesional.
        </p>
        <Button asChild variant="soft">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
