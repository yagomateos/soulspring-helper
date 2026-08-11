import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { useEffect, useRef } from "react";
import { Disclaimer } from "@/components/mc/Disclaimer";
import { PageShell } from "@/components/mc/PageShell";
import { PaywallCard } from "@/components/mc/PaywallCard";
import { PremiumBadge } from "@/components/mc/PremiumBadge";
import { fetchContentBody, fetchContentBySlug, markContentViewed } from "@/lib/data/content";
import { useSession } from "@/lib/mc/session";

export const Route = createFileRoute("/biblioteca/$slug")({
  head: () => ({
    meta: [{ title: "Recurso — Mente Clara" }, { name: "robots", content: "noindex" }],
  }),
  component: ContentDetailPage,
});

function ContentDetailPage() {
  const { slug } = Route.useParams();
  const { user } = useSession();

  const { data: content, isLoading: loadingContent } = useQuery({
    queryKey: ["content-item", slug],
    queryFn: () => fetchContentBySlug(slug),
  });

  const { data: body, isLoading: loadingBody } = useQuery({
    queryKey: ["content-body", content?.id],
    queryFn: () => fetchContentBody(content!.id),
    enabled: !!content,
  });

  const loggedView = useRef(false);
  useEffect(() => {
    if (!user || !content || !body || loggedView.current) return;
    loggedView.current = true;
    void markContentViewed(user.id, content.id);
  }, [user, content, body]);

  if (loadingContent) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-5 py-16 text-sm text-muted-foreground">Cargando…</div>
      </PageShell>
    );
  }

  if (!content) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl space-y-3 px-5 py-16 text-center">
          <h1 className="font-display text-xl font-semibold">No hemos encontrado este recurso</h1>
          <Link to="/biblioteca" className="text-sm text-primary hover:underline">
            Volver a la biblioteca
          </Link>
        </div>
      </PageShell>
    );
  }

  const locked = content.access_level === "PREMIUM" && !loadingBody && !body;

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-12">
        <div className="animate-rise space-y-3">
          <Link to="/biblioteca" className="text-sm text-muted-foreground hover:text-foreground">
            ← Biblioteca
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">{content.title}</h1>
            {content.access_level === "PREMIUM" ? <PremiumBadge /> : null}
          </div>
          <p className="text-base text-muted-foreground">{content.description}</p>
          {content.duration_minutes ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> {content.duration_minutes} min
            </span>
          ) : null}
        </div>

        {locked ? (
          <PaywallCard />
        ) : loadingBody ? (
          <p className="text-sm text-muted-foreground">Cargando contenido…</p>
        ) : (
          <div className="animate-rise whitespace-pre-line rounded-3xl border border-border bg-card p-6 text-sm leading-relaxed shadow-[var(--shadow-soft)]">
            {body}
          </div>
        )}

        <Disclaimer compact />
      </div>
    </PageShell>
  );
}
