export const quoteFormOptions = {
  services: [
    "Ventanas",
    "Puertas",
    "Canceles de ba\u00f1o",
    "P\u00e9rgolas",
    "Fachadas",
    "Barandales",
  ],
  timings: ["Urgente", "Este mes", "M\u00e1s adelante", "Solo cotizo"],
  workTypes: [
    "Instalaci\u00f3n nueva",
    "Reemplazo / remodelaci\u00f3n",
    "No estoy seguro",
  ],
  photoStatuses: ["La enviar\u00e9 por WhatsApp", "No tengo foto todav\u00eda"],
} as const;

export { whatsappPhoneNumber, whatsappDirectUrl } from "@/content/site";
export const whatsappReturnStorageKey = "aluminio-vidrio-whatsapp-return";

export function extractWhatsappTextFromHref(href?: string) {
  if (!href) {
    return "";
  }

  try {
    const url = new URL(href);
    return url.searchParams.get("text") ?? "";
  } catch {
    return "";
  }
}
