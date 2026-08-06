import type { AssessmentResult, Recommendation } from "./types";

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "respiracion",
    title: "Respiración 4-7-8",
    icon: "wind",
    minutes: 5,
    description:
      "Inhala 4 segundos, retén 7 y suelta el aire en 8. Activa el sistema parasimpático y baja la activación fisiológica de la ansiedad en pocos minutos.",
    dimensions: ["ansiedad", "estres"],
  },
  {
    id: "mindfulness",
    title: "Mindfulness guiado",
    icon: "brain",
    minutes: 10,
    description:
      "Una práctica breve de atención plena al cuerpo y la respiración. Reduce la rumiación y entrena volver al presente cuando la mente se dispara.",
    dimensions: ["ansiedad", "animo", "estres"],
  },
  {
    id: "diario",
    title: "Diario emocional",
    icon: "notebook-pen",
    minutes: 8,
    description:
      "Escribe qué has sentido, en qué situación y qué pensamiento apareció. Poner palabras a la emoción reduce su intensidad y ayuda a detectar patrones.",
    dimensions: ["animo", "autoestima", "relaciones"],
  },
  {
    id: "paseo",
    title: "Paseo activador",
    icon: "footprints",
    minutes: 20,
    description:
      "Camina a ritmo cómodo, preferiblemente con luz natural. La activación conductual es una de las intervenciones con más evidencia frente al ánimo bajo.",
    dimensions: ["animo", "estres", "sueno"],
  },
  {
    id: "organizacion",
    title: "Organización del día",
    icon: "list-checks",
    minutes: 10,
    description:
      "Elige tres prioridades reales y bloquea tiempo para ellas. Reduce la sensación de sobrecarga y el coste mental de decidir sobre la marcha.",
    dimensions: ["estres", "trabajo"],
  },
  {
    id: "sueno",
    title: "Higiene del sueño",
    icon: "moon",
    minutes: 15,
    description:
      "Horario estable, luz tenue y sin pantallas la última hora. Prepara al cuerpo para dormir y mejora la calidad del descanso profundo.",
    dimensions: ["sueno", "ansiedad"],
  },
  {
    id: "autocompasion",
    title: "Pausa de autocompasión",
    icon: "heart-handshake",
    minutes: 6,
    description:
      "Detecta la autocrítica y responde con la frase que le dirías a alguien que quieres. Suaviza el diálogo interno exigente.",
    dimensions: ["autoestima", "animo"],
  },
  {
    id: "limites",
    title: "Cierre de jornada",
    icon: "door-closed",
    minutes: 5,
    description:
      "Un ritual corto para marcar el final del trabajo: revisar lo hecho, anotar lo pendiente y desconectar avisos. Protege tu tiempo personal.",
    dimensions: ["trabajo", "estres"],
  },
  {
    id: "conexion",
    title: "Contacto significativo",
    icon: "message-circle-heart",
    minutes: 15,
    description:
      "Escribe o llama a una persona de confianza y comparte algo real de tu semana. El apoyo social percibido amortigua el impacto del estrés.",
    dimensions: ["relaciones", "animo"],
  },
];

export function recommendFor(result: AssessmentResult): Recommendation[] {
  const weight = new Map(result.scores.map((s) => [s.dimension, 100 - s.score]));
  return [...RECOMMENDATIONS]
    .map((r) => ({
      rec: r,
      score: r.dimensions.reduce((sum, d) => sum + (weight.get(d) ?? 0), 0) / r.dimensions.length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.rec);
}