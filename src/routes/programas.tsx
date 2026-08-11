import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Disclaimer } from "@/components/mc/Disclaimer";
import { PageHeading, PageShell } from "@/components/mc/PageShell";
import { ProgramCard } from "@/components/mc/ProgramCard";
import { fetchContentCategories } from "@/lib/data/content";
import { fetchPrograms } from "@/lib/data/programs";

export const Route = createFileRoute("/programas")({
  head: () => ({
    meta: [
      { title: "Programas — Mente Clara" },
      {
        name: "description",
        content: "Recorridos guiados de varias sesiones, con contenido y ejercicios en cada paso.",
      },
      { property: "og:title", content: "Programas — Mente Clara" },
      { property: "og:description", content: "Trabaja paso a paso con un programa guiado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProgramasPage,
});

function ProgramasPage() {
  const { data: categories = [] } = useQuery({
    queryKey: ["content-categories"],
    queryFn: fetchContentCategories,
  });
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["programs-list"],
    queryFn: fetchPrograms,
  });

  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name;

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-8 px-5 py-12">
        <PageHeading
          eyebrow="Programas"
          title="Recorridos guiados"
          description="Cada programa combina contenido y ejercicios en sesiones ordenadas, para trabajar un tema paso a paso."
        />

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : programs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay programas publicados.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <ProgramCard key={p.id} program={p} categoryName={categoryName(p.category_id)} />
            ))}
          </div>
        )}

        <Disclaimer compact />
      </div>
    </PageShell>
  );
}
