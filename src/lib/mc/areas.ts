import type { AreaId } from "./types";

export type AreaMeta = {
  id: AreaId;
  name: string;
  tagline: string;
  description: string;
  icon: "wind" | "sun" | "heart";
};

export const AREAS: AreaMeta[] = [
  {
    id: "ansiedad",
    name: "Ansiedad",
    tagline: "Preocupación, tensión o nervios",
    description:
      "Para cuando la mente va acelerada, la preocupación cuesta de frenar o el cuerpo vive en alerta.",
    icon: "wind",
  },
  {
    id: "animo",
    name: "Estado de ánimo",
    tagline: "Tristeza, desgana o falta de energía",
    description:
      "Para cuando cuesta disfrutar, la energía está baja o los días se sienten más pesados de lo habitual.",
    icon: "sun",
  },
  {
    id: "relaciones",
    name: "Relaciones y pareja",
    tagline: "Vínculos, pareja o rupturas",
    description:
      "Para cuando una relación duele, los conflictos se repiten o cuesta poner palabras a lo que necesitas.",
    icon: "heart",
  },
];

export const areaById = (id: string): AreaMeta | undefined => AREAS.find((a) => a.id === id);

export const isAreaId = (id: string): id is AreaId => AREAS.some((a) => a.id === id);