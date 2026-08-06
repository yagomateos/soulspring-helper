import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageShell } from "@/components/mindguide/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions } from "@/lib/mindguide/store";

const TITLE = "Crear cuenta — MindGuide AI";
const DESC =
  "Regístrate con email o Google para guardar tus evaluaciones, recomendaciones y próximas sesiones en MindGuide AI.";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: RegistroPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(80),
  email: z.string().trim().email("Introduce un email válido").max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
});

function RegistroPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    actions.signIn({ name: parsed.data.name, email: parsed.data.email, provider: "email" });
    toast.success("Cuenta creada (demo)");
    navigate({ to: "/cuestionario" });
  };

  const googleLogin = () => {
    actions.signIn({ name: "Ana Martín", email: "ana.martin@gmail.com", provider: "google" });
    toast.success("Sesión iniciada con Google (simulado)");
    navigate({ to: "/cuestionario" });
  };

  return (
    <PageShell>
      <div className="mx-auto grid max-w-md gap-6 px-5 py-16">
        <div className="animate-rise space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Crea tu espacio</h1>
          <p className="text-sm text-muted-foreground">
            Guarda tus evaluaciones, recomendaciones y citas en un solo lugar.
          </p>
        </div>

        <div className="surface-card animate-rise space-y-5 p-7">
          <Button variant="outline" size="lg" className="w-full" onClick={googleLogin}>
            <GoogleIcon /> Continuar con Google
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> o con tu email{" "}
            <span className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-4" onSubmit={submit} noValidate>
            <Field
              id="name"
              label="Nombre"
              value={values.name}
              error={errors["name"]}
              onChange={(v) => setValues((s) => ({ ...s, name: v }))}
            />
            <Field
              id="email"
              label="Email"
              type="email"
              value={values.email}
              error={errors["email"]}
              onChange={(v) => setValues((s) => ({ ...s, email: v }))}
            />
            <Field
              id="password"
              label="Contraseña"
              type="password"
              value={values.password}
              error={errors["password"]}
              onChange={(v) => setValues((s) => ({ ...s, password: v }))}
            />
            <Button type="submit" variant="hero" size="lg" className="w-full">
              Crear cuenta
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Demo sin backend: los datos se guardan solo en este navegador.
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          ¿Prefieres mirar primero?{" "}
          <Link to="/cuestionario" className="font-medium text-primary hover:underline">
            Haz la evaluación sin cuenta
          </Link>
        </p>
      </div>
    </PageShell>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  type?: string | undefined;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-2xl"
        aria-invalid={Boolean(error)}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
      />
    </svg>
  );
}