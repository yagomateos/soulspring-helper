import type { AreaId, AssessmentResult, ChatMessage, Exercise } from "./types";

/**
 * Contexto que se enviará al proveedor de IA (OpenAI u otro) cuando se conecte.
 * De momento la respuesta se genera localmente con datos simulados.
 */
export type AiContext = {
  area: AreaId | null;
  lastAssessment: AssessmentResult | null;
  history: ChatMessage[];
  allowedExercises: Exercise[];
  /** Reglas definidas por la psicóloga desde el panel. */
  clinicalRules: string[];
};

export const DEFAULT_RULES = [
  "No diagnosticar ni nombrar trastornos.",
  "No prescribir medicación ni sugerir cambios de tratamiento.",
  "Responder siempre con empatía y validar la emoción antes de orientar.",
  "Hacer al menos una pregunta aclaratoria antes de recomendar un ejercicio.",
  "Recomendar únicamente ejercicios de la biblioteca autorizada.",
  "Ante señales de riesgo, recomendar atención profesional inmediata y no continuar con ejercicios.",
  "Recordar que la orientación no sustituye a un profesional cuando el malestar es alto.",
];

export const SYSTEM_PROMPT = (ctx: AiContext) =>
  [
    "Eres el asistente de orientación de Mente Clara, supervisado por una psicóloga colegiada.",
    "Nunca diagnosticas, no prescribes medicación y no tomas decisiones clínicas.",
    `Área seleccionada: ${ctx.area ?? "sin definir"}.`,
    ctx.lastAssessment
      ? `Resultado del último cuestionario: intensidad ${ctx.lastAssessment.intensity}/100, nivel interno ${ctx.lastAssessment.triage}.`
      : "El usuario aún no ha completado un cuestionario.",
    `Ejercicios autorizados: ${ctx.allowedExercises.map((e) => e.title).join(", ")}.`,
    `Reglas: ${ctx.clinicalRules.join(" ")}`,
  ].join("\n");

const RISK = /suicid|matarme|quitarme la vida|no quiero vivir|hacerme daño|acabar con todo/i;

const RULES: { match: RegExp; reply: string }[] = [
  {
    match: /ansied|nervios|angustia|p[áa]nico/i,
    reply:
      "Entiendo que la ansiedad esté ocupando mucho espacio ahora mismo. Antes de proponerte nada me ayudaría saber: ¿en qué momentos del día la notas con más fuerza y qué sueles estar haciendo justo antes?",
  },
  {
    match: /dorm|sue[ñn]o|insomnio|descans/i,
    reply:
      "El descanso condiciona todo lo demás, así que tiene sentido que lo notes. ¿Te cuesta más conciliar el sueño o te despiertas durante la noche? ¿Cómo suele ser tu última hora antes de acostarte?",
  },
  {
    match: /trist|deprim|vac[íi]o|desanim|sin ganas|apat/i,
    reply:
      "Gracias por ponerlo en palabras, no siempre es fácil. ¿Hay algo que antes te aportaba y que ahora te cuesta hacer? ¿Desde cuándo lo notas así?",
  },
  {
    match: /pareja|relaci|ruptura|discut|amor|celos/i,
    reply:
      "Las relaciones nos atraviesan mucho. Para entenderlo mejor: ¿qué te gustaría que fuera distinto en ese vínculo y has podido decírselo a esa persona?",
  },
  {
    match: /trabaj|jefe|estudi|oficina|examen/i,
    reply:
      "Suena a que esa área te está pesando más de lo que quisieras. ¿Qué parte concreta te desgasta más: la carga, las relaciones o la dificultad para desconectar?",
  },
  {
    match: /estr[eé]s|saturad|desbordad|agobi/i,
    reply:
      "Cuando todo se acumula, el cuerpo lo nota antes que la cabeza. ¿Qué tres cosas están ocupando ahora la mayor parte de tu energía?",
  },
];

const FOLLOW_UPS = [
  "Te escucho. ¿Cómo se siente eso en tu cuerpo cuando aparece?",
  "Tiene sentido lo que cuentas. ¿Ha habido algún momento reciente en el que te sintieras algo mejor? ¿Qué era distinto ahí?",
  "Gracias por compartirlo. ¿Qué te gustaría que fuera diferente dentro de un mes?",
  "Si tuvieras que ponerle un nombre a esta emoción, ¿cuál sería?",
];

export const RISK_REPLY =
  "Lo que me cuentas es importante y merece atención profesional ahora mismo. Esta plataforma no puede acompañarte adecuadamente en esta situación. Si estás en peligro, llama al 024 (línea de atención a la conducta suicida en España) o al 112. Si puedes, avisa a alguien de confianza para no estar solo/a.";

export type AiReply = { text: string; risk: boolean; exerciseId?: string };

/**
 * Punto único de generación de respuesta. Cuando se conecte la API real,
 * basta con sustituir esta implementación por la llamada al proveedor
 * manteniendo la misma firma.
 */
export function generateReply(input: string, ctx: AiContext): AiReply {
  if (RISK.test(input)) return { text: RISK_REPLY, risk: true };

  const turn = ctx.history.filter((m) => m.role === "user").length;
  const rule = RULES.find((r) => r.match.test(input));
  const exercise = ctx.allowedExercises.find((e) => (ctx.area ? e.areas.includes(ctx.area) : true));

  if (rule && turn < 2) return { text: rule.reply, risk: false };

  if (rule && exercise) {
    return {
      text: `${rule.reply}\n\nMientras tanto, un ejercicio que suele ayudar es «${exercise.title}» (${exercise.minutes} min). Recuerda que esto es orientación general y no sustituye a un profesional.`,
      risk: false,
      exerciseId: exercise.id,
    };
  }

  const escalate =
    ctx.lastAssessment && (ctx.lastAssessment.triage === "HIGH" || ctx.lastAssessment.triage === "URGENT");

  return {
    text: escalate
      ? `${FOLLOW_UPS[turn % FOLLOW_UPS.length]}\n\nPor lo que respondiste en el cuestionario, también puede serte útil hablar con la psicóloga en una consulta.`
      : FOLLOW_UPS[turn % FOLLOW_UPS.length]!,
    risk: false,
  };
}

export const SUGGESTIONS = [
  "Me cuesta parar de darle vueltas a todo",
  "Duermo mal desde hace semanas",
  "No tengo ganas de hacer nada",
  "Discuto mucho con mi pareja",
];