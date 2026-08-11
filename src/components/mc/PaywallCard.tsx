import { Link } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const BENEFITS = [
  "Biblioteca Premium completa, sin límites",
  "Programas guiados paso a paso",
  "Seguimiento de tu progreso",
];

export function PaywallCard({ title }: { title?: string }) {
  return (
    <div className="animate-rise flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-soft)]">
      <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
        <Lock className="size-5" />
      </span>
      <div className="space-y-1.5">
        <h3 className="font-display text-lg font-semibold">
          {title ?? "Este contenido está disponible para miembros Premium"}
        </h3>
        <p className="text-sm text-muted-foreground">
          Con Premium desbloqueas la biblioteca completa, programas guiados y tu seguimiento.
        </p>
      </div>
      <ul className="space-y-1.5 text-left text-sm text-muted-foreground">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-center gap-2">
            <Sparkles className="size-3.5 shrink-0 text-primary" />
            {b}
          </li>
        ))}
      </ul>
      <Button asChild className="mt-1">
        <Link to="/premium">Ver Premium</Link>
      </Button>
    </div>
  );
}
