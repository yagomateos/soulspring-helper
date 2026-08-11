import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CircleDashed } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Disclaimer } from "@/components/mc/Disclaimer";
import { PageShell } from "@/components/mc/PageShell";
import { PaywallCard } from "@/components/mc/PaywallCard";
import { PremiumBadge } from "@/components/mc/PremiumBadge";
import { Button } from "@/components/ui/button";
import {
  completeSession,
  enrollInProgram,
  fetchProgramBySlug,
  fetchProgramSessions,
  fetchSessionCompletions,
} from "@/lib/data/programs";
import { useSession } from "@/lib/mc/session";

export const Route = createFileRoute("/programas/$slug")({
  head: () => ({
    meta: [{ title: "Programa — Mente Clara" }, { name: "robots", content: "noindex" }],
  }),
  component: ProgramDetailPage,
});

function ProgramDetailPage() {
  const { slug } = Route.useParams();
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: program, isLoading: loadingProgram } = useQuery({
    queryKey: ["program", slug],
    queryFn: () => fetchProgramBySlug(slug),
  });

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ["program-sessions", program?.id],
    queryFn: () => fetchProgramSessions(program!.id),
    enabled: !!program,
  });

  const sessionIds = sessions.map((s) => s.id);
  const { data: completed = new Set<string>() } = useQuery({
    queryKey: ["program-session-completions", user?.id, program?.id],
    queryFn: () => fetchSessionCompletions(user!.id, sessionIds),
    enabled: !!user && sessionIds.length > 0,
  });

  const locked = program?.access_level === "PREMIUM" && !loadingSessions && sessions.length === 0;

  const enrolledOnce = useRef(false);
  useEffect(() => {
    if (!user || !program || locked || enrolledOnce.current) return;
    enrolledOnce.current = true;
    void enrollInProgram(user.id, program.id);
  }, [user, program, locked]);

  const completeMutation = useMutation({
    mutationFn: (sessionId: string) => completeSession(user!.id, sessionId),
    onSuccess: () => {
      toast.success("Sesión marcada como hecha");
      void queryClient.invalidateQueries({
        queryKey: ["program-session-completions", user?.id, program?.id],
      });
    },
  });

  if (loadingProgram) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-5 py-16 text-sm text-muted-foreground">Cargando…</div>
      </PageShell>
    );
  }

  if (!program) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl space-y-3 px-5 py-16 text-center">
          <h1 className="font-display text-xl font-semibold">No hemos encontrado este programa</h1>
          <Link to="/programas" className="text-sm text-primary hover:underline">
            Volver a programas
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-12">
        <div className="animate-rise space-y-3">
          <Link to="/programas" className="text-sm text-muted-foreground hover:text-foreground">
            ← Programas
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">{program.title}</h1>
            {program.access_level === "PREMIUM" ? <PremiumBadge /> : null}
          </div>
          <p className="text-base text-muted-foreground">{program.description}</p>
        </div>

        {locked ? (
          <PaywallCard title="Este programa está disponible para miembros Premium" />
        ) : (
          <ol className="space-y-3">
            {sessions.map((s, i) => {
              const done = completed.has(s.id);
              return (
                <li
                  key={s.id}
                  className="animate-rise flex items-start gap-3 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-medium text-primary">
                    {i + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-display text-base font-semibold">{s.title}</h3>
                    {s.content ? (
                      <Link
                        to="/biblioteca/$slug"
                        params={{ slug: s.content.slug }}
                        className="block text-sm text-muted-foreground hover:text-foreground"
                      >
                        📄 {s.content.title}
                      </Link>
                    ) : null}
                    {s.exercise ? (
                      <Link
                        to="/recomendaciones"
                        className="block text-sm text-muted-foreground hover:text-foreground"
                      >
                        🧘 {s.exercise.title} ({s.exercise.minutes} min)
                      </Link>
                    ) : null}
                  </div>
                  {user ? (
                    <Button
                      size="sm"
                      variant={done ? "ghost" : "soft"}
                      disabled={done || completeMutation.isPending}
                      onClick={() => completeMutation.mutate(s.id)}
                    >
                      {done ? (
                        <>
                          <Check className="size-4" /> Hecha
                        </>
                      ) : (
                        <>
                          <CircleDashed className="size-4" /> Marcar como hecha
                        </>
                      )}
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}

        <Disclaimer compact />
      </div>
    </PageShell>
  );
}
