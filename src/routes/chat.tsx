import { createFileRoute } from "@tanstack/react-router";
import { Send, Sparkle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Disclaimer } from "@/components/mindguide/Disclaimer";
import { PageShell } from "@/components/mindguide/PageShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SEED_MESSAGES, SUGGESTIONS, generateReply, type ChatMessage } from "@/lib/mindguide/chat";
import { cn } from "@/lib/utils";

const TITLE = "Chat de apoyo emocional — MindGuide AI";
const DESC =
  "Conversa con MindGuide AI: escucha con empatía, hace preguntas antes de sugerir y te orienta hacia prácticas con evidencia.";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const turns = useRef(0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  const send = (raw: string) => {
    const text = raw.trim().slice(0, 1000);
    if (!text || typing) return;
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", text }]);
    setInput("");
    setTyping(true);
    const turn = turns.current++;
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: `a${Date.now()}`, role: "assistant", text: generateReply(text, turn) },
      ]);
      setTyping(false);
    }, 900);
  };

  return (
    <PageShell>
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-5 py-8 sm:py-12">
        <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-calm text-primary">
            <Sparkle className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold">MindGuide AI</h1>
            <p className="text-sm text-muted-foreground">
              Escucha primero, sugiere después · Respuestas simuladas en esta demo
            </p>
          </div>
        </header>

        <div className="surface-card flex h-[60vh] min-h-100 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-3xl px-5 py-3.5 text-[0.95rem] leading-relaxed whitespace-pre-line",
                    m.role === "user"
                      ? "rounded-br-lg bg-primary text-primary-foreground"
                      : "rounded-bl-lg bg-muted text-foreground",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing ? (
              <div className="flex justify-start">
                <div className="rounded-3xl rounded-bl-lg bg-muted px-5 py-3.5 text-sm text-muted-foreground">
                  Escribiendo…
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full bg-primary-soft px-3.5 py-1.5 text-xs text-primary transition-colors hover:bg-primary-soft/70"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
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
                rows={1}
                maxLength={1000}
                placeholder="Cuéntame cómo te sientes hoy…"
                className="max-h-32 min-h-11 resize-none rounded-2xl"
              />
              <Button
                type="submit"
                variant="hero"
                size="icon"
                disabled={!input.trim() || typing}
                aria-label="Enviar mensaje"
              >
                <Send />
              </Button>
            </form>
          </div>
        </div>

        <Disclaimer />
      </div>
    </PageShell>
  );
}