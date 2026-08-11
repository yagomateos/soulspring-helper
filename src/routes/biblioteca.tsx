import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ContentCard } from "@/components/mc/ContentCard";
import { Disclaimer } from "@/components/mc/Disclaimer";
import { PageHeading, PageShell } from "@/components/mc/PageShell";
import { fetchContentCategories, fetchContentList } from "@/lib/data/content";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca — Mente Clara" },
      {
        name: "description",
        content:
          "Recursos por temas: ansiedad y estrés, relaciones y pareja, estado de ánimo, sueño y bienestar emocional.",
      },
      { property: "og:title", content: "Biblioteca — Mente Clara" },
      {
        property: "og:description",
        content: "Contenidos gratuitos y Premium organizados por tema.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BibliotecaPage,
});

function BibliotecaPage() {
  const { data: categories = [] } = useQuery({
    queryKey: ["content-categories"],
    queryFn: fetchContentCategories,
  });
  const { data: content = [], isLoading } = useQuery({
    queryKey: ["content-list"],
    queryFn: fetchContentList,
  });
  const [categoryId, setCategoryId] = useState<string | "todos">("todos");

  const list =
    categoryId === "todos" ? content : content.filter((c) => c.category_id === categoryId);
  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name;

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-8 px-5 py-12">
        <PageHeading
          eyebrow="Biblioteca"
          title="Recursos"
          description="Guías y materiales por temas, revisados por la psicóloga. Los contenidos Premium se marcan con una insignia y se desbloquean con la suscripción."
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryId("todos")}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              categoryId === "todos"
                ? "border-primary bg-primary-soft text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                categoryId === c.id
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay contenidos en esta categoría.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <ContentCard key={c.id} content={c} categoryName={categoryName(c.category_id)} />
            ))}
          </div>
        )}

        <Disclaimer compact />
      </div>
    </PageShell>
  );
}
