export const barandalesPageContent = {
  slug: "barandales",
  eyebrow: "Barandales en aluminio y vidrio",
  title: "Seguridad ligera",
  accentTitle: "sin cerrar la vista",
  description:
    "Diseñamos e instalamos barandales para escaleras, balcones y terrazas con medidas claras, perfiles limpios y una presencia visual que acompaña el espacio.",
  image: {
    src: "/img/img_hero_barandales_web.png",
    mobileSrc: "/img/img_hero_barandales_movil.png",
    alt: "Barandal de vidrio y aluminio instalado en terraza residencial",
  },
  details: [
    {
      title: "Para escaleras",
      icon: "stairs",
      description:
        "Seguridad en el recorrido diario sin hacer pesado el espacio ni cerrar la vista.",
    },
    {
      title: "Para balcones",
      icon: "balcony",
      description:
        "Protección perimetral que conserva luz, amplitud y una lectura limpia hacia el exterior.",
    },
    {
      title: "Para terrazas",
      icon: "deck",
      description:
        "Una presencia ligera para exterior, convivencia y uso constante con acabados sobrios.",
    },
  ],
  quality: {
    eyebrow: "Calidad del barandal",
    title: "Materiales pensados",
    accentTitle: "para verse bien y durar",
    description:
      "Cada barandal se define según el uso del espacio, el tipo de sujeción y el acabado que mejor acompaña el proyecto.",
    image: {
      src: "/img/img_barandal_calidad1.png",
      alt: "Detalle de barandal de vidrio y aluminio para terraza",
    },
    points: [
      {
        title: "Vista limpia",
        icon: "shield",
        description: "Conserva luz, amplitud y conexión visual sin cerrar el espacio.",
      },
      {
        title: "Sujeción adecuada",
        icon: "height",
        description: "Botones, postes, minipostes o perfiles según el proyecto.",
      },
      {
        title: "Acero inoxidable",
        icon: "sparkles",
        description: "Herrajes, botones, postes o minipostes con presencia sobria.",
      },
      {
        title: "Aluminio anticorrosivo",
        icon: "wrench",
        description: "Perfiles ligeros, firmes y pensados para bajo mantenimiento.",
      },
      {
        title: "Acabados a elegir",
        icon: "swatch",
        description: "Opciones en negro, satinado, cristal claro o esmerilado.",
      },
      {
        title: "Instalación alineada",
        icon: "check",
        description: "Medidas claras, fijación correcta y revisión final del resultado.",
      },
    ],
  },
  types: {
    eyebrow: "Tipos de barandales",
    title: "Encuentra el sistema",
    accentTitle: "que mejor aterriza tu espacio",
    description:
      "Explora cada solución como una mesa de decisión visual: qué tan abierta queda la vista, qué tanta estructura se percibe y qué tipo de proyecto la aprovecha mejor.",
    items: [
      {
        id: "botones",
        label: "Botones",
        title: "Barandal con botones",
        icon: "button",
        image: {
          src: "/img/barandales/botones.png",
          alt: "Barandal de vidrio con sujeciones tipo botón",
        },
        description:
          "Una opción minimalista donde el cristal se sujeta con herrajes laterales tipo botón. Ayuda a mantener el espacio abierto, con una lectura visual limpia y elegante.",
        features: ["Sin postes visibles", "Sujeción lateral discreta", "Ideal para escaleras modernas"],
        benefits: ["Más amplitud visual", "Aprovecha mejor la luz", "Diseño sobrio y contemporáneo"],
        useCase: "Proyecto contemporáneo con vista abierta",
        recommendation:
          "Ideal para terrazas, balcones y escaleras donde la vista merece quedarse libre.",
        vibe: "Se siente limpio, ligero y muy arquitectónico.",
        metrics: {
          openness: 5,
          structure: 2,
          privacy: 1,
        },
      },
      {
        id: "miniposte",
        label: "Miniposte",
        title: "Barandal con miniposte",
        icon: "post",
        image: {
          src: "/img/barandales/miniposte.png",
          alt: "Barandal con cristal y minipostes metálicos",
        },
        description:
          "Sistema con cristal sujeto a minipostes. Funciona muy bien cuando se busca estabilidad, orden visual y una presencia ligera en balcones, terrazas o pasillos.",
        features: ["Apoyo puntual", "Estructura ligera", "Acabado limpio"],
        benefits: ["Buena estabilidad", "No satura la vista", "Mantenimiento sencillo"],
        useCase: "Pasillos, balcones y terrazas de uso diario",
        recommendation:
          "Buena opción para recorridos lineales con uso frecuente y presencia discreta.",
        vibe: "Se ve ordenado, técnico y balanceado.",
        metrics: {
          openness: 4,
          structure: 3,
          privacy: 1,
        },
      },
      {
        id: "poste",
        label: "Poste",
        title: "Barandal con poste",
        icon: "post",
        image: {
          src: "/img/barandales/poste.png",
          alt: "Barandal exterior con cristal y estructura metálica",
        },
        description:
          "Combina cristal con postes para lograr una estructura firme y visualmente ordenada. Es una alternativa versátil para recorridos, balcones y espacios exteriores.",
        features: ["Postes visibles", "Sujeción firme", "Uso interior o exterior"],
        benefits: ["Mayor sensación de seguridad", "Buena resistencia", "Estilo adaptable"],
        useCase: "Escaleras, balcones amplios y exteriores",
        recommendation:
          "Conviene cuando se busca una lectura estructural más evidente sin perder transparencia.",
        vibe: "Se percibe firme, claro y funcional.",
        metrics: {
          openness: 4,
          structure: 4,
          privacy: 1,
        },
      },
      {
        id: "acero",
        label: "Acero",
        title: "Barandal de acero inoxidable",
        icon: "steel",
        image: {
          src: "/img/barandales/acero.png",
          alt: "Barandal de acero inoxidable para exterior",
        },
        description:
          "Alternativa resistente y sobria para proyectos que buscan seguridad sin cristal. Su apariencia limpia lo vuelve útil en zonas de alto uso o espacios exteriores.",
        features: ["Sin cristal", "Acero inoxidable", "Diseño atemporal"],
        benefits: ["Alta durabilidad", "Bajo mantenimiento", "Buena opción para alto tráfico"],
        useCase: "Áreas exteriores y recorridos de alto tráfico",
        recommendation:
          "Funciona mejor cuando el mantenimiento simple y la resistencia pesan más que la apertura visual.",
        vibe: "Se siente sobrio, durable y directo.",
        metrics: {
          openness: 2,
          structure: 5,
          privacy: 2,
        },
      },
      {
        id: "curvo",
        label: "Curvo",
        title: "Barandal curvo",
        icon: "curve",
        image: {
          src: "/img/barandales/curvo.png",
          alt: "Barandal curvo con cristal para escalera",
        },
        description:
          "Solución pensada para escaleras o recorridos con líneas curvas. Acompaña la arquitectura del espacio y crea una presencia más fluida y especial.",
        features: ["Adaptado a curvas", "Cristal con recorrido fluido", "Presencia sofisticada"],
        benefits: ["Continuidad visual", "Resultado más personalizado", "Mayor impacto estético"],
        useCase: "Escaleras escultóricas y proyectos singulares",
        recommendation:
          "Es la mejor ruta cuando la arquitectura ya tiene curvas y merece una solución a medida.",
        vibe: "Se siente fluido, especial y hecho para ese lugar.",
        metrics: {
          openness: 5,
          structure: 3,
          privacy: 1,
        },
      },
      {
        id: "servilletero",
        label: "Servilletero",
        title: "Barandal servilletero",
        icon: "profile",
        image: {
          src: "/img/barandales/servilletero.png",
          alt: "Barandal con base tipo servilletero",
        },
        description:
          "Sistema con base o perfil que sostiene el cristal de forma continua. Da una lectura moderna, firme y muy limpia cuando se busca evitar herrajes expuestos.",
        features: ["Perfil continuo", "Fijación discreta", "Acabado moderno"],
        benefits: ["Soporte estable", "Menos tornillería visible", "Excelente limpieza visual"],
        useCase: "Terrazas y balcones con lenguaje contemporáneo",
        recommendation:
          "Muy recomendable cuando quieres una base continua y una imagen técnica más refinada.",
        vibe: "Se ve preciso, elegante y muy limpio.",
        metrics: {
          openness: 5,
          structure: 3,
          privacy: 1,
        },
      },
      {
        id: "herreria",
        label: "Herrería",
        title: "Barandal de herrería",
        icon: "fence",
        image: {
          src: "/img/barandales/herreria.png",
          alt: "Barandal de herrería para escalera o terraza",
        },
        description:
          "Opción robusta y personalizable para quienes buscan estructura, carácter y color a medida. Puede adaptarse a estilos clásicos, modernos o decorativos.",
        features: ["Diseño personalizable", "Estructura resistente", "Acabados a elección"],
        benefits: ["Máxima firmeza", "Gran versatilidad estética", "Buena vida útil"],
        useCase: "Escaleras, terrazas y fachadas con personalidad",
        recommendation:
          "Conviene cuando el proyecto pide carácter, dibujo y una presencia más expresiva.",
        vibe: "Se siente firme, artesanal y con presencia.",
        metrics: {
          openness: 2,
          structure: 5,
          privacy: 3,
        },
      },
      {
        id: "celosia",
        label: "Celosía",
        title: "Barandal con celosía metálica",
        icon: "mesh",
        image: {
          src: "/img/barandales/celocia.png",
          alt: "Barandal con celosía metálica decorativa",
        },
        description:
          "Propuesta decorativa y protectora con patrones metálicos. Aporta privacidad, personalidad y un lenguaje visual más arquitectónico.",
        features: ["Patrones personalizados", "Protección visual", "Diseño decorativo"],
        benefits: ["Más privacidad", "Identidad propia", "Buena presencia exterior"],
        useCase: "Fachadas, balcones y exteriores con identidad propia",
        recommendation:
          "La mejor alternativa cuando además de proteger quieres filtrar visuales o dar más privacidad.",
        vibe: "Se percibe arquitectónico, gráfico y protector.",
        metrics: {
          openness: 2,
          structure: 4,
          privacy: 5,
        },
      },
    ],
  },
  cta: {
    label: "Cotizar barandal",
    href: "https://wa.me/527293813723?text=Hola%2C%20quiero%20cotizar%20un%20barandal%20de%20aluminio%20y%20vidrio.",
  },
  heroUseCases: ["Escaleras", "Balcones", "Terrazas"],
} as const;

export const barandalesNavLinks = [
  { href: "/", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "#aplicaciones", label: "Aplicaciones", sectionId: "aplicaciones" },
  { href: "#calidad", label: "Calidad", sectionId: "calidad" },
  { href: "#tipos", label: "Tipos", sectionId: "tipos" },
  { href: "#proyectos", label: "Proyectos", sectionId: "proyectos" },
] as const;

export const barandalesSecondaryNavLinks = [
  { href: "#ubicacion", label: "Ubicación", sectionId: "ubicacion" },
] as const;

export const barandalesScrollSpyLinks = [
  ...barandalesNavLinks,
  ...barandalesSecondaryNavLinks,
].filter((item) => "sectionId" in item);

export const barandalesMobileNavLinks = [
  ...barandalesNavLinks,
  ...barandalesSecondaryNavLinks,
  { href: "#cotizacion", label: "Crear cotización" },
] as const;
