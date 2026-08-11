import { createFileRoute, Link } from "@tanstack/react-router";
import { Send, Sparkle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Disclaimer } from "@/components/mc/Disclaimer";
import { PageShell } from "@/components/mc/PageShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateReply, SUGGESTIONS } from "@/lib/mc/ai";
import {
  actions,
  selectArea,
  selectExercises,
  selectLatest,
  selectRules,
  selectThreads,
  useAppState,
} from "@/lib/mc/store";
import type { ChatMessage } from "@/lib/mc/types";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat de orientación — Mente Clara" },
      {
        name: "description",
        content:
          "Conversa con el asistente de orientación de Mente Clara: escucha empática, preguntas aclaratorias y ejercicios autorizados por la psicóloga.",
      },
      { property: "og:title", content: "Chat de orientación — Mente Clara" },
      {
        property: "og:description",
        content: "Un espacio para poner palabras a lo que sientes, con orientación supervisada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

const uid = () => `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

function ChatPage() {
  const threads = useAppState(selectThreads);
  const area = useAppState(selectArea);
  const latest = useAppState(selectLatest);
  const exercises = useAppState(selectExercises);
  const rules = useAppState(selectRules);

  const [threadId, setThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const thread = useMemo(
    () => threads.find((t) => t.id === threadId) ?? threads[0] ?? null,
    [threads, threadId],
  );
  const messages = thread?.messages ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typing]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;

    let id = thread?.id ?? null;
    if (!id) id = actions.createThread(area, text.slice(0, 40));
    setThreadId(id);

    const userMessage: ChatMessage = {
      id: uid(),
      role: "user",
      text,
      createdAt: new Date().toISOString(),
    };
    actions.appendMessage(id, userMessage);
    setInput("");
    setTyping(true);

    const history = [...messages, userMessage];
    const reply = generateReply(text, {
      area,
      lastAssessment: latest,
      history,
      allowedExercises: exercises,
      clinicalRules: rules,
    });

    window.setTimeout(() => {
      actions.appendMessage(id!, {
        id: uid(),
        role: "assistant",
        text: reply.text,
        createdAt: new Date().toISOString(),
      });
      setTyping(false);
    }, 700);
  };

  return (
    <PageShell>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 py-10">
        <div className="animate-rise space-y-2">
          <span className="inline-flex rounded-full bg-primary-soft px-3.5 py-1 text-xs font-medium tracking-wide text-primary uppercase">
            Orientación conversacional
          </span>
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Habla con calma</h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            El asistente escucha, pregunta antes de recomendar y solo sugiere ejercicios revisados por
            la psicóloga. No diagnostica ni sustituye una consulta.
          </p>
        </div>

        <div className="flex min-h-[22rem] flex-col gap-4 rounded-[2rem] border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
              <span className="grid size-12 place-items-center rounded-3xl bg-calm text-primary">
                <Sparkle className="size-5" />
              </span>
              <p className="max-w-sm text-sm text-muted-foreground">
                Cuéntame qué te preocupa hoy. Puedes empezar por una de estas frases:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <p
                    className={`animate-rise max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.text}
                  </p>
                </div>
              ))}
              {typing ? (
                <p className="text-sm text-muted-foreground">Escribiendo…</p>
              ) : null}
              <div ref={endRef} />
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 border-t border-border pt-4"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Escribe cómo te sientes…"
              rows={2}
              className="resize-none rounded-2xl"
            />
            <Button type="submit" size="icon" aria-label="Enviar" disabled={typing}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>

        <Disclaimer compact />

        <p className="text-center text-sm text-muted-foreground">
          ¿Prefieres hablar con una persona?{" "}
          <Link to="/reserva" className="text-primary hover:underline">
            Solicita una consulta
          </Link>
        </p>
      </div>
    </PageShell>
  );
}