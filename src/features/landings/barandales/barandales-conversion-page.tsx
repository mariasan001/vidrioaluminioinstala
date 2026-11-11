import { whatsappUrl } from "@/content/site";
import { barandalesFaq, barandalesSharedTypes } from "@/content/services/barandales";
import { ServiceConversionPage } from "@/features/conversion/service-conversion-page";
import type { NavItem } from "@/components/site/nav/site-nav.data";

const whatsappHref = whatsappUrl("Hola, quiero cotizar un barandal a la medida en Toluca.");

const emptyMetrics = { openness: 0, structure: 0, privacy: 0 } as const;

function typeCard(input: {
  base: (typeof barandalesSharedTypes)[keyof typeof barandalesSharedTypes];
  text: string;
  ideal: string;
}) {
  const { base } = input;
  return {
    id: base.id,
    label: base.title,
    title: base.title,
    icon: "button" as const,
    image: { src: base.image.src, alt: base.image.alt },
    description: input.text,
    ideal: input.text,
    detail: `Ideal si: ${input.ideal}`,
    features: [] as string[],
    benefits: [] as string[],
    useCase: "",
    recommendation: "",
    vibe: "",
    message: `Hola, me interesa el barandal ${base.model} para mi escalera/balcón/terraza. Mide aprox. ___ metros lineales. ¿Me pueden dar precio?`,
    metrics: emptyMetrics,
  };
}

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
              base: barandalesSharedTypes.botones,
                            text: "Cristal templado de 10 mm sujeto con botones de acero inoxidable al costado de la escalera o la losa. Sin postes.",
              ideal: "Quieres el look más limpio y que el escalón quede libre a todo lo ancho.",
            }),
            typeCard({
              base: barandalesSharedTypes.miniposte,
                            text: "Cristal templado de 10 mm sobre postes cortos de acero inoxidable de 25 o 50 cm. Hasta 120 cm de alto.",
              ideal: "Quieres que el cristal se vea casi flotando, con apoyos que apenas se notan.",
            }),
            typeCard({
              base: barandalesSharedTypes.poste,
                            text: "Cristal templado de 10 mm con postes de acero inoxidable de 1 m de alto y clips que sujetan el cristal.",
              ideal: "Buscas la opción más firme, o la quieres con pasamanos para apoyarte al subir.",
            }),
          ],
        },
      }}
      useCasesHeading={{
        title: "Instalamos el barandal",
        accent: "según tu espacio",
        description: "Escalera, balcón o terraza. Lo medimos en tu casa y lo dejamos instalado.",
      }}
      faq={barandalesFaq}
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
