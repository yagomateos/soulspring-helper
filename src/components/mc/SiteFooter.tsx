import { Link } from "@tanstack/react-router";
import { Brand } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-[minmax(0,1.4fr)_auto]">
        <div className="max-w-md space-y-3">
          <Brand />
          <p className="text-sm leading-relaxed text-muted-foreground">
            MindGuide AI ofrece orientación basada en psicología con evidencia. No realiza
            diagnósticos ni sustituye la atención de un profesional de la salud mental.
          </p>
          <p className="text-xs text-muted-foreground">
            Si estás en una situación de crisis, contacta con el 024 (España) o los servicios de
            emergencia de tu país.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground sm:flex-col">
          <Link to="/cuestionario" className="hover:text-foreground">
            Evaluación
          </Link>
          <Link to="/chat" className="hover:text-foreground">
            Chat IA
          </Link>
          <Link to="/reserva" className="hover:text-foreground">
            Reservar consulta
          </Link>
          <Link to="/perfil" className="hover:text-foreground">
            Mi perfil
          </Link>
        </nav>
      </div>
    </footer>
  );
}