import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Disclaimer({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-3xl border border-border bg-mint-soft/60 px-5 py-4",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-secondary-foreground" />
      <p className="text-sm leading-relaxed text-secondary-foreground">
        {compact
          ? "Esto es orientación, no un diagnóstico clínico."
          : "Esta información es una orientación basada en tus respuestas, no un diagnóstico clínico. Mente Clara no sustituye la valoración ni el acompañamiento de un psicólogo colegiado."}
      </p>
    </div>
  );
}