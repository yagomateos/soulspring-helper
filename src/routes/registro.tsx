import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Disclaimer } from "@/components/mc/Disclaimer";
import { PageShell } from "@/components/mc/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions } from "@/lib/mc/store";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — Mente Clara" },
      {
        name: "description",
        content: "Crea tu cuenta para guardar tu evaluación, tus ejercicios y tu seguimiento.",
      },
      { property: "og:title", content: "Crear cuenta — Mente Clara" },
      { property: "og:description", content: "Guarda tu evaluación y tu seguimiento en Mente Clara." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegistroPage,
});

function RegistroPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Necesitamos tu email y una contraseña.");
      return;
    }
    actions.signIn({
      name: name.trim() || email.split("@")[0] || "Invitado",
      email: email.trim(),
      provider: "email",
    });
    toast.success(mode === "signup" ? "Cuenta creada" : "Sesión iniciada");
    navigate({ to: "/evaluacion" });
  };

  const google = () => {
    actions.signIn({ name: "Usuario Google", email: "usuario@gmail.com", provider: "google" });
    toast.success("Sesión iniciada con Google");
    navigate({ to: "/evaluacion" });
  };

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-md px-5 py-16">
        <div className="animate-rise rounded-[2rem] border border-border bg-card p-7 shadow-[var(--shadow-soft)]">
          <h1 className="font-display text-2xl font-semibold">
            {mode === "signup" ? "Crear cuenta" : "Iniciar sesión"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Guarda tus cuestionarios, ejercicios y conversaciones. Solo para personas adultas.
          </p>

          <Button variant="soft" className="mt-6 w-full" onClick={google}>
            Continuar con Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> o con tu email <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" ? (
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full">
              {mode === "signup" ? "Crear cuenta" : "Entrar"}
            </Button>
          </form>

          <button
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            className="mt-5 w-full text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "signup" ? "Ya tengo cuenta" : "Quiero crear una cuenta"}
          </button>
        </div>

        <Disclaimer className="mt-6" compact />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          ¿Prefieres probar antes?{" "}
          <Link to="/evaluacion" className="text-primary hover:underline">
            Empieza la evaluación
          </Link>
        </p>
      </div>
    </PageShell>
  );
}