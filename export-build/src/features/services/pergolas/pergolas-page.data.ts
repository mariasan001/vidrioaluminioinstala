export const pergolasPageContent = {
  slug: "pergolas",
  eyebrow: "Pérgolas de aluminio y cristal",
  title: "Sombra ligera",
  accentTitle: "para vivir el exterior",
  description:
    "Diseñamos e instalamos pérgolas, domos y techos pensados para dar sombra, filtrar la luz y hacer más habitable el espacio exterior.",
  image: {
    src: "/img/pergolas/hero_web.webp",
    mobileSrc: "/img/pergolas/hero_movil.webp",
    alt: "Pérgola moderna instalada en terraza residencial",
  },
  details: [
    {
      title: "Para terrazas",
      icon: "deck",
      description:
        "Sombra y presencia para convivir al exterior sin perder luz ni amplitud visual.",
    },
    {
      title: "Para patios",
      icon: "balcony",
      description:
        "Soluciones que protegen el área abierta y vuelven más cómodo el uso diario del espacio.",
    },
    {
      title: "Para accesos",
      icon: "stairs",
      description:
        "Cubiertas ligeras que acompañan la entrada, protegen el recorrido y elevan la fachada.",
    },
  ],
  quality: {
    eyebrow: "Calidad de la pérgola",
    title: "Materiales pensados",
    accentTitle: "para exterior y uso constante",
    description:
      "Cada solución se define según la orientación del espacio, la entrada de luz, el nivel de sombra y el acabado que mejor acompaña el proyecto.",
    image: {
      src: "/img/pergolas/calidad.webp",
      alt: "Detalle de pérgola de aluminio y cristal para exterior",
    },
    points: [
      {
        title: "Sombra adecuada",
        icon: "shield",
        description:
          "Ayuda a proteger el área exterior y hacerla más cómoda durante el día.",
      },
      {
        title: "Medición precisa",
        icon: "height",
        description:
          "Tomamos en cuenta claros, alturas y pendientes para integrar la cubierta al espacio.",
      },
      {
        title: "Luz controlada",
        icon: "sparkles",
        description:
          "El diseño permite filtrar o conservar luz según el uso y la sensación buscada.",
      },
      {
        title: "Estructura adecuada",
        icon: "wrench",
        description:
          "Aluminio, cristal o celosía se definen según la escala y el lenguaje del proyecto.",
      },
      {
        title: "Acabados a elegir",
        icon: "swatch",
        description:
          "Perfiles, tonos y soluciones de cubierta que acompañan la arquitectura existente.",
      },
      {
        title: "Instalación profesional",
        icon: "check",
        description:
          "Alineación, fijación y revisión final para entregar una solución completa y estable.",
      },
    ],
  },
  types: {
    eyebrow: "Tipos de pérgolas",
    title: "Encuentra el sistema",
    accentTitle: "que mejor cubre tu exterior",
    description:
      "Cada sistema responde a una forma distinta de sombra, luz y uso del espacio exterior, sin separar la solución de su instalación.",
    items: [
      {
        id: "celosia",
        label: "Celosía",
        title: "Pérgola con celosía metálica",
        icon: "mesh",
        image: {
          src: "/img/pergolas/celosia_metalica.webp",
          alt: "Pérgola con celosía metálica para exterior",
        },
        description:
          "Solución con patrón metálico para filtrar luz, generar sombra y sumar identidad al exterior. Funciona bien cuando el espacio pide protección visual y diseño.",
        features: ["Patrón metálico", "Luz filtrada", "Diseño personalizado"],
        benefits: ["Más sombra", "Mayor identidad", "Privacidad visual"],
        useCase: "Patios, terrazas y fachadas con necesidad de sombra y carácter",
        recommendation:
          "Buena alternativa cuando además de cubrir se busca dar textura visual al proyecto.",
        vibe: "Se siente gráfica, protectora y arquitectónica.",
        metrics: {
          openness: 3,
          structure: 4,
          privacy: 4,
        },
      },
      {
        id: "tradicional",
        label: "Tradicional",
        title: "Pérgola tradicional",
        icon: "post",
        image: {
          src: "/img/pergolas/tradicional.webp",
          alt: "Pérgola tradicional para patio o terraza",
        },
        description:
          "Sistema sobrio para cubrir áreas exteriores con una presencia clara y atemporal. Se adapta a patios, terrazas y zonas de convivencia cotidiana.",
        features: ["Diseño atemporal", "Estructura firme", "Uso versátil"],
        benefits: ["Sombra constante", "Exterior más cómodo", "Estilo adaptable"],
        useCase: "Patios, terrazas y áreas exteriores de uso frecuente",
        recommendation:
          "Funciona bien cuando el proyecto necesita una solución clara, durable y fácil de integrar.",
        vibe: "Se percibe estable, sobria y familiar.",
        metrics: {
          openness: 3,
          structure: 5,
          privacy: 3,
        },
      },
      {
        id: "domos-techos",
        label: "Domos y techos",
        title: "Domos y techos",
        icon: "button",
        image: {
          src: "/img/pergolas/domos_techos.webp",
          alt: "Domo o techo de cristal para exterior",
        },
        description:
          "Cubiertas pensadas para proteger sin perder entrada de luz. Resuelven patios, pasillos y áreas abiertas donde se busca mayor uso durante el año.",
        features: ["Cubierta a medida", "Entrada de luz", "Protección exterior"],
        benefits: ["Uso más continuo", "Luz natural", "Área mejor protegida"],
        useCase: "Patios, pasillos, accesos y áreas exteriores cubiertas",
        recommendation:
          "Recomendable cuando el espacio necesita protección superior sin quedar visualmente cerrado.",
        vibe: "Se siente luminoso, práctico y bien resuelto.",
        metrics: {
          openness: 4,
          structure: 4,
          privacy: 2,
        },
      },
      {
        id: "spider-glass",
        label: "Spider Glass",
        title: "Domo Spider Glass",
        icon: "curve",
        image: {
          src: "/img/pergolas/spider_glass.webp",
          alt: "Domo Spider Glass con cristal para proyecto exterior",
        },
        description:
          "Sistema de cubierta con una presencia más ligera y arquitectónica. Permite cubrir claros con cristal y sujeciones puntuales para conservar una vista limpia.",
        features: ["Sujeción puntual", "Cristal integrado", "Lectura ligera"],
        benefits: ["Mayor entrada de luz", "Vista limpia", "Presencia contemporánea"],
        useCase: "Accesos, patios y proyectos donde la cubierta forma parte del diseño",
        recommendation:
          "Ideal cuando el proyecto necesita protección superior con una imagen más transparente y refinada.",
        vibe: "Se siente luminoso, preciso y muy arquitectónico.",
        metrics: {
          openness: 5,
          structure: 3,
          privacy: 1,
        },
      },
    ],
  },
  cta: {
    label: "Cotizar pérgola",
    href: "https://wa.me/527293813723?text=Hola%2C%20quiero%20cotizar%20una%20p%C3%A9rgola%20o%20domo%20a%20medida.",
  },
  heroUseCases: ["Terrazas", "Patios", "Accesos"],
} as const;

export const pergolasNavLinks = [
  { href: "/", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "#aplicaciones", label: "Aplicaciones", sectionId: "aplicaciones" },
  { href: "#calidad", label: "Calidad", sectionId: "calidad" },
  { href: "#tipos", label: "Tipos", sectionId: "tipos" },
  { href: "#proyectos", label: "Proyectos", sectionId: "proyectos" },
] as const;

export const pergolasSecondaryNavLinks = [
  { href: "#ubicacion", label: "Ubicación", sectionId: "ubicacion" },
] as const;

export const pergolasScrollSpyLinks = [
  ...pergolasNavLinks,
  ...pergolasSecondaryNavLinks,
].filter((item) => "sectionId" in item);

export const pergolasMobileNavLinks = [
  ...pergolasNavLinks,
  ...pergolasSecondaryNavLinks,
  { href: "#cotizacion", label: "Crear cotización" },
] as const;
