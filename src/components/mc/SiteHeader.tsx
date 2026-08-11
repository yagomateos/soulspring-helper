import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, Sparkle, User } from "lucide-react";
import { toast } from "sonner";
import { PremiumBadge } from "@/components/mc/PremiumBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { isPremium, signOut, useIsAdmin, useSession } from "@/lib/mc/session";

async function handleSignOut() {
  const error = await signOut();
  if (error) toast.error("No se ha podido cerrar la sesión. Inténtalo de nuevo.");
}

const NAV = [
  { to: "/evaluacion", label: "Evaluación" },
  { to: "/biblioteca", label: "Biblioteca" },
  { to: "/recomendaciones", label: "Ejercicios" },
  { to: "/chat", label: "Chat IA" },
  { to: "/reserva", label: "Consulta" },
  { to: "/premium", label: "Premium" },
] as const;

export function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-2xl bg-calm text-primary shadow-[var(--shadow-soft)]">
        <Sparkle className="size-4.5" strokeWidth={2.2} />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">Mente Clara</span>
    </Link>
  );
}

export function SiteHeader() {
  const { user, profile } = useSession();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-8">
          <Brand />
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground font-medium" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="soft" size="sm">
                  {(profile?.full_name || user.email || "Mi espacio").split(" ")[0]}
                  {isPremium(profile) ? <PremiumBadge className="ml-1.5" /> : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: "/perfil" })}>
                  <User /> Mi Espacio
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void handleSignOut()}>
                  <LogOut /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="soft" size="sm" className="hidden sm:inline-flex" asChild>
              <Link to="/registro">Entrar</Link>
            </Button>
          )}
          {isAdmin ? (
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
              <Link to="/admin">Panel</Link>
            </Button>
          ) : null}
          <Button size="sm" className="hidden sm:inline-flex" asChild>
            <Link to="/evaluacion">Empezar</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] max-w-xs">
              <SheetTitle className="sr-only">Navegación</SheetTitle>
              <nav className="mt-10 flex flex-col gap-1 px-4">
                {[
                  ...NAV,
                  ...(isAdmin ? [{ to: "/admin", label: "Panel de administración" } as const] : []),
                  { to: "/perfil", label: "Mi espacio" } as const,
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-2xl px-4 py-3 text-base font-medium transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
                {user ? (
                  <button
                    onClick={() => void handleSignOut()}
                    className="rounded-2xl px-4 py-3 text-left text-base text-muted-foreground"
                  >
                    Cerrar sesión
                  </button>
                ) : (
                  <Link
                    to="/registro"
                    className="rounded-2xl px-4 py-3 text-base font-medium hover:bg-muted"
                  >
                    Crear cuenta
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
