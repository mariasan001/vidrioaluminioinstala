export const fachadasPageContent = {
  slug: "fachadas-de-cristal",
  eyebrow: "Fachadas de cristal templado",
  title: "Fachadas de cristal",
  accentTitle: "con presencia ligera",
  description:
    "Diseñamos e instalamos fachadas de cristal pensadas para dar presencia, entrada de luz y una lectura moderna al frente del proyecto.",
  image: {
    src: "/img/fachadas/hero_web.webp",
    mobileSrc: "/img/fachadas/hero_movil.webp",
    alt: "Fachada de cristal templado instalada en proyecto moderno",
  },
  details: [
    {
      title: "Para residencias",
      icon: "stairs",
      description:
        "Frentes de cristal que conservan luz, amplitud y una conexión visual limpia con el exterior.",
    },
    {
      title: "Para comercios",
      icon: "balcony",
      description:
        "Fachadas con presencia clara para mostrar el interior y reforzar la imagen del negocio.",
    },
    {
      title: "Para proyectos modernos",
      icon: "deck",
      description:
        "Soluciones a medida que integran aluminio, cristal templado y una instalación precisa.",
    },
  ],
  quality: {
    eyebrow: "Calidad de la fachada",
    title: "Materiales pensados",
    accentTitle: "para luz, vista y presencia",
    description:
      "Cada fachada se define según la apertura visual, la resistencia que requiere el proyecto y el acabado que mejor acompaña la arquitectura.",
    image: {
      src: "/img/fachadas/calidad.webp",
      alt: "Detalle de fachada de cristal templado con aluminio",
    },
    points: [
      {
        title: "Cristal templado",
        icon: "shield",
        description:
          "Aporta resistencia, transparencia y una presencia ligera en el frente del proyecto.",
      },
      {
        title: "Medidas claras",
        icon: "height",
        description:
          "Tomamos en cuenta alturas, claros y encuentros para que la fachada se integre correctamente.",
      },
      {
        title: "Vista limpia",
        icon: "sparkles",
        description:
          "La fachada permite entrada de luz y una lectura visual moderna desde el exterior.",
      },
      {
        title: "Estructura adecuada",
        icon: "wrench",
        description:
          "Aluminio y puntos de sujeción definidos según el tamaño, la ubicación y el uso del proyecto.",
      },
      {
        title: "Acabados a elegir",
        icon: "swatch",
        description:
          "Perfiles y tonos que acompañan el estilo arquitectónico sin saturar la fachada.",
      },
      {
        title: "Instalación profesional",
        icon: "check",
        description:
          "Alineación, fijación y revisión final para entregar una solución completa y bien integrada.",
      },
    ],
  },
  types: {
    eyebrow: "Tipos de fachadas",
    title: "Sistema principal",
    accentTitle: "para una fachada ligera",
    description:
      "Trabajamos la fachada como una solución arquitectónica completa: vista, luz, resistencia e instalación pensadas desde el espacio.",
    items: [
      {
        id: "aranas-cristal-templado",
        label: "Arañas de cristal",
        title: "Fachadas con arañas de cristal templado",
        icon: "button",
        image: {
          src: "/img/fachadas/arana_de_cristal.webp",
          alt: "Fachada con arañas de cristal templado",
        },
        description:
          "Sistema con cristal templado sujeto por puntos tipo araña. Permite una fachada amplia, luminosa y moderna, con una lectura visual limpia para proyectos residenciales o comerciales.",
        features: ["Sujeción puntual", "Cristal templado", "Diseño moderno"],
        benefits: ["Más entrada de luz", "Vista amplia", "Presencia arquitectónica"],
        useCase: "Fachadas residenciales y comerciales con imagen moderna",
        recommendation:
          "Ideal cuando el proyecto necesita una fachada transparente, resistente y con protagonismo visual.",
        vibe: "Se siente amplia, luminosa y muy arquitectónica.",
        metrics: {
          openness: 5,
          structure: 4,
          privacy: 1,
        },
      },
    ],
  },
  cta: {
    label: "Cotizar fachada",
    href: "https://wa.me/527293813723?text=Hola%2C%20quiero%20cotizar%20una%20fachada%20de%20cristal%20templado.",
  },
  heroUseCases: ["Residencial", "Comercial", "Cristal templado"],
} as const;

export const fachadasNavLinks = [
  { href: "/", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "#aplicaciones", label: "Aplicaciones", sectionId: "aplicaciones" },
  { href: "#calidad", label: "Calidad", sectionId: "calidad" },
  { href: "#tipos", label: "Tipos", sectionId: "tipos" },
  { href: "#proyectos", label: "Proyectos", sectionId: "proyectos" },
] as const;

export const fachadasSecondaryNavLinks = [
  { href: "#ubicacion", label: "Ubicación", sectionId: "ubicacion" },
] as const;

export const fachadasScrollSpyLinks = [
  ...fachadasNavLinks,
  ...fachadasSecondaryNavLinks,
].filter((item) => "sectionId" in item);

export const fachadasMobileNavLinks = [
  ...fachadasNavLinks,
  ...fachadasSecondaryNavLinks,
  { href: "#cotizacion", label: "Crear cotización" },
] as const;
