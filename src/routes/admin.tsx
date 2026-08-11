import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarClock, ListChecks, MessageSquareQuote, Users } from "lucide-react";
import { AdminGuard } from "@/components/mc/admin/AdminGuard";
import { PageHeading, PageShell } from "@/components/mc/PageShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Panel — Mente Clara" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

const SECTIONS = [
  {
    to: "/admin/contenido" as const,
    icon: BookOpen,
    title: "Contenidos",
    description: "Biblioteca gratuita y Premium.",
  },
  {
    to: "/admin/programas" as const,
    icon: CalendarClock,
    title: "Programas",
    description: "Recorridos guiados con sesiones.",
  },
  {
    to: "/admin/ejercicios" as const,
    icon: ListChecks,
    title: "Ejercicios",
    description: "Prácticas de la biblioteca de ejercicios.",
  },
  {
    to: "/admin/recomendaciones" as const,
    icon: MessageSquareQuote,
    title: "Recomendaciones",
    description: "Textos que acompañan los resultados.",
  },
  {
    to: "/admin/usuarios" as const,
    icon: Users,
    title: "Usuarios",
    description: "Consultar cuentas y estado Premium.",
  },
];

function AdminPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-8 px-5 py-12">
        <PageHeading
          eyebrow="Panel profesional"
          title="Panel de administración"
          description="Gestiona contenidos, programas, ejercicios y recomendaciones sin tocar código."
        />
        <AdminGuard>
          <div className="grid gap-4 sm:grid-cols-2">
            {SECTIONS.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="animate-rise flex items-start gap-3 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <s.icon className="size-4.5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </AdminGuard>
      </div>
    </PageShell>
  );
}
