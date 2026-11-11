import { mapsHref, phoneDisplay, phoneHref, whatsappDirectUrl } from "@/content/site";

export type ContactCard = {
  title: string;
  value: string;
  detail: string;
  action: string;
  icon: "location" | "phone" | "clock" | "whatsapp";
  href?: string;
  featured?: boolean;
};

export type ContactSectionContent = {
  eyebrow: string;
  title: string;
  accentTitle: string;
  description: string;
  footer: {
    company: string;
    rights: string;
    credit: string;
  };
  cards: readonly ContactCard[];
};

export const contactContent: ContactSectionContent = {
  eyebrow: "Contacto directo",
  title: "Cuéntanos qué quieres instalar",
  accentTitle: "y aterrizamos el siguiente paso",
  description:
    "Agenda una cotización para ventanas, puertas, canceles, pérgolas, fachadas o barandales. Te atendemos en nuestra ubicación, por llamada directa o por WhatsApp.",
  footer: {
    company: "Aluminio y Vidrio Instala",
    rights: "© 2026 · Todos los derechos reservados",
    credit: "Desarrollado por Aurenna",
  },
  cards: [
    {
      title: "Ubicación",
      value: "Lago Winnipeg 101",
      detail: "El Seminario Primera Secc, 50170 Toluca de Lerdo, Méx.",
      href: mapsHref,
      action: "Ver dirección",
      icon: "location",
    },
    {
      title: "Llámanos",
      value: phoneDisplay,
      detail: "Contacto directo para atención y cotizaciones.",
      href: phoneHref,
      action: "Llamar ahora",
      icon: "phone",
    },
    {
      title: "WhatsApp",
      value: "Respuesta directa",
      detail: "Escríbenos para pedir información, resolver dudas o iniciar tu cotización.",
      href: whatsappDirectUrl,
      action: "Escribir por WhatsApp",
      icon: "whatsapp",
      featured: true,
    },
    {
      title: "Horarios",
      value: "Lunes a sábado",
      detail: "8:00 a. m. - 6:00 p. m. Domingo: No abrimos.",
      action: "Atención en tienda y llamada",
      icon: "clock",
    },
  ],
} as const;

export type ContactIconName = (typeof contactContent.cards)[number]["icon"];
