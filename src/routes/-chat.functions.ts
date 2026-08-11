import { createServerFn } from "@tanstack/react-start";
import { SYSTEM_PROMPT, type AiContext } from "@/lib/mc/ai";

type GenerateAiReplyInput = {
  message: string;
  context: AiContext;
};

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
};

/**
 * Único punto que habla con Gemini: la clave vive solo en el servidor
 * (GEMINI_API_KEY, sin prefijo VITE_) y nunca llega al bundle del cliente.
 * La comprobación de riesgo (isRiskMessage) se hace antes, en el cliente,
 * y no depende de esta llamada.
 */
export const generateAiReply = createServerFn({ method: "POST" })
  .validator((data: GenerateAiReplyInput) => data)
  .handler(async ({ data }): Promise<{ text: string }> => {
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY no configurada en el servidor.");
    }
    const model = process.env["GEMINI_MODEL"] || "gemini-2.5-flash";

    // Ventana acotada de historial para no disparar el coste/latencia en conversaciones largas.
    const recentHistory = data.context.history.slice(-12);
    const contents = recentHistory.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT(data.context) }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Gemini respondió ${res.status}: ${errText.slice(0, 300)}`);
    }

    const json = (await res.json()) as GeminiResponse;
    const text = (json.candidates?.[0]?.content?.parts ?? [])
      .map((p) => p.text ?? "")
      .join("")
      .trim();

    if (!text) throw new Error("Gemini devolvió una respuesta vacía.");
    return { text };
  });
