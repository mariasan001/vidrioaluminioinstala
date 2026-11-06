import { ServiceConversionPage } from "@/features/conversion/service-conversion-page";
import type { NavItem } from "@/features/home/components/home-nav/home-nav.data";

const whatsappHref =
  "https://wa.me/527293813723?text=Hola%2C%20quiero%20cotizar%20un%20barandal%20a%20la%20medida%20en%20Toluca.";

const emptyMetrics = { openness: 0, structure: 0, privacy: 0 } as const;

function typeCard(input: {
  id: string;
  label: string;
  model: string;
  src: string;
  alt: string;
  text: string;
  ideal: string;
  pendingNote?: string;
}) {
  return {
    id: input.id,
    label: input.label,
    title: input.label,
    icon: "button" as const,
    image: { src: input.src, alt: input.alt },
    description: input.text,
    ideal: input.text,
    detail: `Ideal si: ${input.ideal}`,
    features: [] as string[],
    benefits: [] as string[],
    useCase: "",
    recommendation: "",
    vibe: "",
    pendingNote: input.pendingNote,
    message: `Hola, me interesa el barandal ${input.model} para mi escalera/balcón/terraza. Mide aprox. ___ metros lineales. ¿Me pueden dar precio?`,
    metrics: emptyMetrics,
  };
}

export const barandalesConversionFaq = {
  eyebrow: "Preguntas frecuentes",
  title: "Antes de cotizar",
  accent: "tu barandal",
  description: "Si tu duda no está aquí, mándanos una foto por WhatsApp.",
  pending: 'confirmar: se quitó "¿Vidrio o metálico?" porque el catálogo no muestra barandales metálicos con fotos y datos reales',
  items: [
    {
      question: "¿Qué tan seguro es un barandal de vidrio?",
      answer:
        "Usamos cristal templado de 10 mm, sujeto con herrajes de acero inoxidable. Es firme, y si llegara a romperse se hace pedacitos sin filo.",
    },
    {
      question: "¿Se le puede poner pasamanos?",
      answer: "Sí, el modelo con poste puede llevar pasamanos de acero inoxidable arriba.",
      pending: "confirmar",
    },
    {
      question: "¿Sirve para exteriores?",
      answer: "",
      pending: "PENDIENTE: confirmar con el cliente",
    },
    {
      question: "¿A qué altura se instala?",
      answer:
        "Depende del modelo y del espacio. El de poste mide 1 m y el de miniposte llega hasta 120 cm. En la visita te recomendamos la altura adecuada.",
    },
    {
      question: "¿Cómo se limpia?",
      answer:
        "Con agua y jabón neutro o limpiavidrios, con un paño suave. Evita fibras metálicas y abrasivos.",
    },
  ],
} as const;

export const barandalesNavLinks = [
  { href: "/", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "#aplicaciones", label: "Aplicaciones", sectionId: "aplicaciones" },
  { href: "#calidad", label: "Calidad", sectionId: "calidad" },
  { href: "#tipos", label: "Tipos", sectionId: "tipos" },
  { href: "#proyectos", label: "Proyectos", sectionId: "proyectos" },
  { href: "#preguntas", label: "Preguntas", sectionId: "preguntas" },
] as const satisfies readonly NavItem[];

export const barandalesSecondaryNavLinks = [
  { href: "#contacto", label: "Contacto", sectionId: "contacto" },
] as const satisfies readonly NavItem[];

export const barandalesScrollSpyLinks = [
  ...barandalesNavLinks,
  ...barandalesSecondaryNavLinks,
].filter((item) => "sectionId" in item);

export const barandalesMobileNavLinks = [
  ...barandalesNavLinks,
  ...barandalesSecondaryNavLinks,
  { href: "#contacto", label: "Cotizar" },
] as const satisfies readonly NavItem[];

export function BarandalesConversionPage() {
  return (
    <ServiceConversionPage
      servicio="barandales"
      quoteService="Barandales"
      whatsappHref={whatsappHref}
      compactNav
      revealSticky
      useCasesLink
      qualityColumns
      hero={{
        eyebrow: "Barandales a la medida",
        title: "Barandales en Toluca y Metepec",
        titleMain: "Barandales",
        titleAccent: "en Toluca y Metepec",
        description:
          "De vidrio templado o metálicos, para escaleras, balcones y terrazas. Lo medimos en tu casa y lo dejamos instalado.",
        fullScreen: true,
        chips: ["Cotización sin costo", "Vidrio templado o metálico", "Lun a sáb · 8:00–18:00"],
        image: {
          src: "/img/img_hero_barandales_lcp.webp",
          mobileSrc: "/img/img_hero_barandales_movil.webp",
          alt: "Barandal de vidrio instalado en una terraza",
          width: 1600,
          height: 854,
        },
      }}
      content={{
        details: [
          {
            title: "Para tu escalera",
            icon: "stairs",
            description: "Seguridad al subir y bajar sin cerrar el espacio. Con vidrio, la luz sigue pasando.",
          },
          {
            title: "Para balcones",
            icon: "balcony",
            description: "Protección sin tapar la vista hacia afuera.",
          },
          {
            title: "Para terrazas",
            icon: "deck",
            description: "Delimita el área y la hace más segura sin perder la vista.",
          },
        ],
        quality: {
          eyebrow: "Calidad",
          title: "Lo que no se ve en la foto",
          accentTitle: "y sí se nota al usarlo",
          description: "Cristal templado de 10 mm y herrajes de acero inoxidable.",
          image: {
            src: "/img/img_barandal_calidad1.webp",
            alt: "Barandal de vidrio instalado",
          },
          points: [
            {
              title: "Vidrio templado",
              icon: "shield",
              description: "Si llegara a romperse, se hace pedacitos sin filo.",
            },
            {
              title: "Hecho a tu medida",
              icon: "height",
              description: "Se ajusta a escaleras con giro, desniveles y medidas fuera de lo común.",
            },
            {
              title: "Herrajes de acero inoxidable",
              icon: "wrench",
              description: "Botones, postes y clips que no se oxidan y aguantan el uso diario.",
            },
            {
              title: "Instalación firme",
              icon: "check",
              description: "Lo dejamos bien anclado, nivelado y listo para usarse.",
            },
          ],
        },
        types: {
          eyebrow: "Tipos de barandal",
          title: "¿Cuál va con tu espacio?",
          accentTitle: "tipos de barandal",
          description: "Si no sabes cuál elegir, mándanos una foto y te recomendamos.",
          photoMessage:
            "Hola, no sé qué barandal me conviene. Les mando una foto de mi escalera, balcón o terraza para que me recomienden.",
          titleId: "barandales-types-title",
          trackLabel: "Tipos de barandal",
          items: [
            typeCard({
              id: "botones",
              label: "Barandal con botones",
              model: "con botones",
              src: "/img/barandales/botones.webp",
              alt: "Barandal de vidrio con sujeciones tipo botón",
              text: "Cristal templado de 10 mm sujeto con botones de acero inoxidable al costado de la escalera o la losa. Sin postes.",
              ideal: "Quieres el look más limpio y que el escalón quede libre a todo lo ancho.",
            }),
            typeCard({
              id: "miniposte",
              label: "Barandal con miniposte",
              model: "con miniposte",
              src: "/img/barandales/miniposte.webp",
              alt: "Barandal de cristal sobre postes cortos",
              text: "Cristal templado de 10 mm sobre postes cortos de acero inoxidable de 25 o 50 cm. Hasta 120 cm de alto.",
              ideal: "Quieres que el cristal se vea casi flotando, con apoyos que apenas se notan.",
            }),
            typeCard({
              id: "poste",
              label: "Barandal con poste",
              model: "con poste",
              src: "/img/barandales/poste.webp",
              alt: "Barandal de vidrio con postes",
              text: "Cristal templado de 10 mm con postes de acero inoxidable de 1 m de alto y clips que sujetan el cristal.",
              ideal: "Buscas la opción más firme, o la quieres con pasamanos para apoyarte al subir.",
              pendingNote: "confirmar con el cliente que incluye o permite pasamanos",
            }),
          ],
        },
      }}
      useCasesHeading={{
        title: "Instalamos el barandal",
        accent: "según tu espacio",
        description: "Escalera, balcón o terraza. Lo medimos en tu casa y lo dejamos instalado.",
      }}
      faq={barandalesConversionFaq}
      contact={{
        title: "Cotiza tu barandal",
        accent: "sin costo",
        description: "Te respondemos de lunes a sábado, de 8:00 a 18:00.",
        whatsappNote: "Mándanos medidas o una foto de tu escalera, balcón o terraza",
        callbackSubject: "un barandal",
      }}
      gallery={{
        title: "Trabajos",
        accent: "que ya instalamos",
        description: "Fotos reales de instalaciones en Toluca y Metepec.",
        match: (category) => category.startsWith("Barandales"),
      }}
      navLinks={barandalesNavLinks}
      secondaryNavLinks={barandalesSecondaryNavLinks}
      mobileNavLinks={barandalesMobileNavLinks}
      scrollSpyLinks={barandalesScrollSpyLinks}
    />
  );
}
