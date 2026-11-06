import { businessInfo } from "@/features/home/home-seo";
import { whatsappPhoneNumber } from "@/features/home/components/home-floating-quote/home-floating-quote.data";

function whatsappUrl(message: string) {
  return `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(message)}`;
}

export const barandalesServiceName = "Barandales";
export const barandalesQuoteLabel = "Cotizar mi barandal";
export const barandalesPhoneDisplay = businessInfo.phoneDisplay;
export const barandalesPhoneHref = "tel:7293813723";
export const barandalesFacebook = businessInfo.facebook;

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

export const barandalesTypes = {
  eyebrow: "Barandales a medida · Toluca",
  title: "El barandal ideal para tu espacio empieza aquí.",
  description:
    "Conoce opciones para escaleras, balcones y terrazas. Cuéntanos qué necesitas y encontremos la solución adecuada para tu proyecto.",
  closeTitle: "¿Tienes un espacio en mente?",
  closeText:
    "Compártenos qué quieres instalar y dónde. Te ayudaremos a identificar la información necesaria para cotizar.",
  cta: "Cotizar mi barandal",
  items: [
    {
      id: "vidrio",
      index: "01",
      title: "Barandales de vidrio",
      description:
        "Una apariencia ligera y contemporánea que deja pasar la luz y mantiene la continuidad visual del espacio.",
      image: {
        src: "/img/barandales/botones.webp",
        alt: "Barandal de vidrio con sujeciones tipo botón",
        width: 1448,
        height: 1086,
      },
    },
    {
      id: "metalicos",
      index: "02",
      title: "Barandales metálicos",
      description:
        "Líneas definidas y diseños que pueden complementar distintos estilos arquitectónicos.",
      image: {
        src: "/img/barandales/acero.webp",
        alt: "Barandal de acero inoxidable",
        width: 1254,
        height: 1254,
      },
    },
    {
      id: "balcones",
      index: "03",
      title: "Barandales para balcones",
      description:
        "Integra tu balcón con el diseño de tu fachada sin perder de vista las necesidades del espacio.",
      image: {
        src: "/img/trabajos/balcon-barandal-vidrio.webp",
        alt: "Balcón con barandal de vidrio instalado en una fachada residencial",
        width: 1086,
        height: 1448,
      },
    },
    {
      id: "postes",
      index: "04",
      title: "Postes y herrajes",
      description:
        "Conoce los componentes disponibles para el sistema de barandal que requiere tu proyecto.",
      image: {
        src: "/img/barandales/poste.webp",
        alt: "Barandal de vidrio con postes",
        width: 1254,
        height: 1254,
      },
    },
  ],
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

export const barandalesFaq = {
  eyebrow: "Preguntas frecuentes",
  title: "Resolvemos tus dudas",
  description: "¿No encuentras tu respuesta? Escríbenos por WhatsApp.",
  cta: "Preguntar por WhatsApp",
  items: [
    {
      question: "¿Cuánto cuesta instalar un barandal?",
      answer:
        "El precio depende del tipo de barandal, las medidas y el material: vidrio, metálico o herrería. Mándanos fotos por WhatsApp y te cotizamos sin costo.",
    },
    {
      question: "¿Cuánto tarda la instalación?",
      answer:
        "El tiempo depende del tipo de barandal y de que el espacio ya esté listo. Al cotizar te decimos el plazo de fabricación e instalación.",
    },
    {
      question: "¿Tienen que medir en mi casa?",
      answer:
        "Sí. Medimos en el domicilio para fabricar el barandal a la medida. Puedes empezar con fotos y medidas aproximadas.",
    },
    {
      question: "¿Trabajan en Toluca y sus alrededores?",
      answer:
        "Instalamos en Toluca, Metepec y alrededores. Dinos tu colonia para confirmar la visita.",
    },
    {
      question: "¿Puedo enviar fotos del espacio?",
      answer:
        "Sí. Por WhatsApp puedes mandar fotos de la escalera, el balcón o la terraza y una referencia del barandal que te gusta.",
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
