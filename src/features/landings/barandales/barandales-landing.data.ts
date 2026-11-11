import { phoneDisplay, phoneHref, site, whatsappPhoneNumber } from "@/content/site";

function whatsappUrl(message: string) {
  return `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(message)}`;
}

export const barandalesServiceName = "Barandales";
export const barandalesQuoteLabel = "Cotizar mi barandal";
export const barandalesPhoneDisplay = phoneDisplay;
export const barandalesPhoneHref = phoneHref;
export const barandalesFacebook = site.facebook;

export const barandalesWhatsapp = {
  quote: whatsappUrl(
    "Hola, quiero cotizar un barandal para mi escalera, balcón o terraza.",
  ),
  question: whatsappUrl("Hola, tengo una duda sobre barandales."),
  photo: whatsappUrl(
    "Hola, te envío una fotografía de mi espacio para cotizar un barandal.",
  ),
} as const;

export const barandalesSpaces = ["Escalera", "Balcón", "Terraza", "Otro"] as const;

export const barandalesNav = [
  { href: "#tipos", label: "Barandales" },
  { href: "#preguntas", label: "Preguntas frecuentes" },
  { href: "#contacto", label: "Contacto" },
] as const;

export const barandalesHero = {
  eyebrow: "Instalación en Toluca y Metepec",
  title: "Barandales en Toluca y Metepec",
  accent: "Vidrio, metálicos y herrería.",
  description:
    "Instalamos barandales de vidrio, metálicos y de herrería a la medida. Cotización sin costo.",
  note: "Lunes a sábado 8:00–18:00. Domingo cerrado.",
  image: {
    src: "/img/img_hero_barandales_lcp.webp",
    alt: "Barandal de vidrio y aluminio instalado en una terraza residencial",
    width: 1600,
    height: 854,
  },
  portrait: {
    src: "/img/img_hero_barandales_lcp.webp",
    alt: "Barandal de vidrio y aluminio instalado en una terraza residencial",
    width: 1600,
    height: 854,
    badge: "Terraza con barandal de vidrio",
  },
} as const;

export const barandalesWork = {
  eyebrow: "Cómo trabajamos",
  title: "Tu proyecto merece atención desde el primer paso.",
  description:
    "Sabemos que elegir un barandal implica pensar en el diseño, las medidas y la manera en que se integrará a tu espacio. Por eso, el primer paso es conocer lo que necesitas.",
  items: [
    {
      title: "Una solución para tu espacio",
      description:
        "Revisamos las características de tu proyecto para identificar las opciones que pueden adaptarse a él.",
    },
    {
      title: "Atención directa",
      description:
        "Cuéntanos tus ideas, dudas y necesidades para avanzar hacia una cotización.",
    },
    {
      title: "Opciones para cada proyecto",
      description:
        "Revisamos materiales, medidas y acabados según las alternativas que tengamos disponibles.",
    },
  ],
} as const;

export const barandalesFinalCta = {
  eyebrow: "Vamos a dar el siguiente paso",
  title: "Cuéntanos cómo imaginas tu barandal.",
  description:
    "No necesitas tener todo resuelto para empezar. Explícanos qué espacio quieres mejorar y te ayudaremos a identificar la información necesaria para cotizar.",
  whatsappCta: "Solicitar cotización por WhatsApp",
  photoNote:
    "También puedes enviarnos una fotografía de tu espacio o una referencia del diseño que tienes en mente.",
  formTitle: "Solicita tu cotización",
  formNote: "Te responderemos para revisar los detalles de tu proyecto.",
  submit: "Enviar solicitud de cotización",
  privacy: "Al enviar aceptas el aviso de privacidad.",
} as const;

export const barandalesFooter = {
  zone: "Barandales en Toluca, Metepec y alrededores.",
  servicesPrompt:
    "¿Buscas ventanas, canceles, herrería u otra solución en vidrio y aluminio? Consulta nuestros otros servicios",
  servicesHref: "/#servicios",
  copyright: "© Aluminio y Vidrio Instala",
  privacy: "Aviso de privacidad",
} as const;

export const barandalesSeo = {
  title: "Barandales en Toluca y Metepec",
  description:
    "Instalamos barandales de vidrio, metálicos y de herrería en Toluca y Metepec. Cotización sin costo por WhatsApp.",
} as const;
