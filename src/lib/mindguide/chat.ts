export type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

export const SEED_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    text: "Hola, soy MindGuide. Este es un espacio tranquilo para pensar en voz alta. ¿Cómo has estado estos últimos días?",
  },
  {
    id: "m2",
    role: "user",
    text: "Últimamente me cuesta dormir y me despierto con la cabeza acelerada.",
  },
  {
    id: "m3",
    role: "assistant",
    text: "Gracias por contármelo, no debe ser fácil empezar el día así. Para entenderlo mejor: ¿esa aceleración aparece con algún tema concreto, como el trabajo o algo personal? ¿Y desde cuándo la notas?",
  },
];

export const SUGGESTIONS = [
  "Me siento con mucha ansiedad",
  "No consigo desconectar del trabajo",
  "Duermo mal desde hace semanas",
  "Me critico demasiado",
];

const RULES: { match: RegExp; reply: string }[] = [
  {
    match: /ansied|nervios|angustia|panico|pánico/i,
    reply:
      "Entiendo que la ansiedad esté ocupando mucho espacio ahora mismo. Antes de sugerirte nada, me ayudaría saber: ¿en qué momentos del día la notas con más fuerza y qué sueles estar haciendo justo antes?",
  },
  {
    match: /dorm|sueñ|insomnio|descans/i,
    reply:
      "El descanso afecta a todo lo demás, así que tiene sentido que lo notes. ¿Te cuesta más conciliar el sueño al acostarte o te despiertas durante la noche? ¿Cómo suele ser la última hora antes de dormir?",
  },
  {
    match: /trabaj|jefe|oficina|estudi/i,
    reply:
      "Suena a que el trabajo te está pesando más de lo que quisieras. ¿Qué parte concreta te desgasta más: la carga, las relaciones con el equipo o la dificultad para desconectar al terminar?",
  },
  {
    match: /trist|deprim|vacío|vacio|desanim|solo|sola/i,
    reply:
      "Siento que estés atravesando esto. Que lo pongas en palabras ya es un paso. ¿Hay algo que antes te aportaba y que ahora te cuesta hacer? ¿Cuánto tiempo llevas sintiéndote así?",
  },
  {
    match: /autoestima|critic|inútil|inutil|no valgo|culpa/i,
    reply:
      "Ese diálogo interno tan exigente cansa mucho. ¿Podrías contarme una situación reciente en la que apareciera esa voz crítica y qué te dijo exactamente?",
  },
  {
    match: /pareja|familia|amig|relaci/i,
    reply:
      "Las relaciones influyen muchísimo en cómo nos sentimos. ¿Qué te gustaría que fuera distinto en esa relación? ¿Has podido decirle a esa persona cómo te sientes?",
  },
  {
    match: /estr[eé]s|saturad|desbordad|agobi/i,
    reply:
      "Cuando todo se acumula, el cuerpo lo nota antes que la cabeza. ¿Qué tres cosas están ocupando ahora la mayor parte de tu energía? Vamos a mirarlas de una en una.",
  },
];

const FOLLOW_UPS = [
  "Gracias por compartirlo. ¿Cómo se siente eso en tu cuerpo cuando aparece?",
  "Te escucho. ¿Qué te gustaría que fuera diferente dentro de un mes?",
  "Tiene sentido lo que cuentas. ¿Ha habido algún momento reciente en el que te sintieras un poco mejor? ¿Qué era distinto ahí?",
  "Aprecio tu honestidad. Si tuvieras que ponerle un nombre a esta emoción, ¿cuál sería?",
];

export function generateReply(text: string, turn: number): string {
  const rule = RULES.find((r) => r.match.test(text));
  if (rule && turn < 3) return rule.reply;
  if (rule) {
    return `${rule.reply}\n\nMientras tanto, algo que suele ayudar es una práctica breve de respiración 4-7-8 durante cinco minutos. Recuerda que esto es orientación y no sustituye a un psicólogo: si quieres, puedes reservar una sesión con nuestra psicóloga.`;
  }
  return FOLLOW_UPS[turn % FOLLOW_UPS.length]!;
}