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

export const whatsappPhoneNumber = "527293813723";
export const whatsappReturnStorageKey = "aluminio-vidrio-whatsapp-return";
export const whatsappDirectUrl =
  "https://wa.me/527293813723?text=Hola%2C%20quiero%20pedir%20informaci%C3%B3n%20y%20cotizar%20un%20proyecto%20de%20aluminio%20y%20vidrio.";

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
