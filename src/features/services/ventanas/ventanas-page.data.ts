export const ventanasPageContent = {
  slug: "ventanas",
  eyebrow: "Ventanas de aluminio y cristal",
  title: "Luz natural",
  accentTitle: "con mejor confort interior",
  description:
    "Diseñamos e instalamos ventanas a medida para mejorar iluminación, ventilación y aislamiento sin perder una lectura visual limpia.",
  image: {
    src: "/img/ventanas/hero_web.webp",
    mobileSrc: "/img/ventanas/hero_movil.webp",
    alt: "Ventana moderna de aluminio y cristal instalada en espacio residencial",
  },
  details: [
    {
      title: "Para tu recámara",
      icon: "balcony" as const,
      description: "Luz y ventilación para descansar, con la privacidad que el espacio pida.",
    },
    {
      title: "Para la sala",
      icon: "deck" as const,
      description: "Una abertura amplia para que entre la luz y se vea hacia afuera.",
    },
    {
      title: "Para trabajar",
      icon: "stairs" as const,
      description: "Más luz natural y aire durante el día.",
    },
  ],
  quality: {
    eyebrow: "Calidad",
    title: "Lo que no se ve en la foto",
    accentTitle: "y sí se nota al usarlo",
    description: "Buen ajuste y una instalación bien hecha.",
    image: {
      src: "/img/ventanas/calidad.webp",
      alt: "Detalle de ventana de aluminio y cristal con instalación precisa",
    },
    points: [
      {
        title: "Hecho a tu medida",
        icon: "height" as const,
        description: "Medimos el claro para que la ventana cierre bien, aunque el hueco no esté parejo.",
      },
      {
        title: "Luz y ventilación",
        icon: "sparkles" as const,
        description: "La apertura se define según la luz y el aire que necesita cada espacio.",
      },
      {
        title: "Perfiles de aluminio",
        icon: "wrench" as const,
        description: "Línea española o nacional.",
        pending: "PENDIENTE: diferencia real entre Serie 1400, 3500, 4600 y línea nacional",
      },
      {
        title: "Instalación completa",
        icon: "check" as const,
        description: "Lo dejamos nivelado, sellado y listo para usarse.",
      },
    ],
  },
  types: {
    eyebrow: "Tipos de ventana",
    title: "¿Cuál va con tu espacio?",
    accentTitle: "4 líneas de aluminio",
    description: "Si no sabes cuál elegir, mándanos una foto del claro y te recomendamos.",
    photoMessage:
      "Hola, no sé qué ventana me conviene. Les mando una foto del claro para que me recomienden.",
    titleId: "ventanas-types-title",
    trackLabel: "Tipos de ventana",
    items: [
      {
        id: "serie-1400",
        label: "Serie 1400",
        title: "Línea Española Serie 1400",
        icon: "profile",
        image: {
          src: "/img/ventanas/serie_1400.webp",
          alt: "Ventana Línea Española Serie 1400 de aluminio y cristal",
        },
        ideal: "Línea española de aluminio, a la medida del claro.",
        pendingNote: 'PENDIENTE: descripción real e "ideal si..." de la Serie 1400',
        message:
          "Hola, me interesa la Serie 1400 para mi recámara/sala/área de trabajo. El claro mide aprox. ___ de ancho por ___ de alto. ¿Me pueden dar precio?",
        description: "Línea española de aluminio, a la medida del claro.",
        features: ["Apertura funcional", "Diseño sobrio", "Integración a medida"],
        benefits: ["Luz natural", "Ventilación cómoda", "Vista ligera"],
        useCase: "Recámaras, salas y espacios residenciales de uso diario",
        recommendation:
          "Buena opción cuando el proyecto necesita una ventana clara, funcional y fácil de integrar.",
        vibe: "Se percibe ligera, práctica y ordenada.",
        metrics: {
          openness: 4,
          structure: 3,
          privacy: 3,
        },
      },
      {
        id: "serie-3500",
        label: "Serie 3500",
        title: "Línea Española Serie 3500",
        icon: "steel",
        image: {
          src: "/img/ventanas/serie_3500.webp",
          alt: "Ventana Línea Española Serie 3500 para proyecto moderno",
        },
        ideal: "Línea española de aluminio, a la medida del claro.",
        pendingNote: 'PENDIENTE: descripción real e "ideal si..." de la Serie 3500',
        message:
          "Hola, me interesa la Serie 3500 para mi recámara/sala/área de trabajo. El claro mide aprox. ___ de ancho por ___ de alto. ¿Me pueden dar precio?",
        description: "Línea española de aluminio, a la medida del claro.",
        features: ["Mayor presencia", "Apertura estable", "Acabado moderno"],
        benefits: ["Más firmeza", "Buena entrada de luz", "Confort interior"],
        useCase: "Salas, áreas sociales y ventanas con claros medios",
        recommendation:
          "Conviene cuando la ventana necesita sentirse más firme sin perder elegancia visual.",
        vibe: "Se siente estable, moderna y luminosa.",
        metrics: {
          openness: 4,
          structure: 4,
          privacy: 3,
        },
      },
      {
        id: "serie-4600",
        label: "Serie 4600",
        title: "Línea Española Serie 4600",
        icon: "button",
        image: {
          src: "/img/ventanas/serie_4600.webp",
          alt: "Ventana Línea Española Serie 4600 para claro amplio",
        },
        ideal: "Línea española de aluminio, a la medida del claro.",
        pendingNote: 'PENDIENTE: descripción real e "ideal si..." de la Serie 4600',
        message:
          "Hola, me interesa la Serie 4600 para mi recámara/sala/área de trabajo. El claro mide aprox. ___ de ancho por ___ de alto. ¿Me pueden dar precio?",
        description: "Línea española de aluminio, a la medida del claro.",
        features: ["Claro amplio", "Estructura robusta", "Vista moderna"],
        benefits: ["Mayor estabilidad", "Mejor aislamiento", "Presencia arquitectónica"],
        useCase: "Ventanas amplias, fachadas residenciales y espacios principales",
        recommendation:
          "Ideal cuando el tamaño del claro pide una solución más firme y bien resuelta.",
        vibe: "Se percibe sólida, amplia y arquitectónica.",
        metrics: {
          openness: 5,
          structure: 5,
          privacy: 3,
        },
      },
      {
        id: "linea-nacional",
        label: "Nacional",
        title: "Línea Nacional 2\" y 3\"",
        icon: "mesh",
        image: {
          src: "/img/ventanas/linea_nacional.webp",
          alt: "Ventana Línea Nacional de aluminio y cristal",
        },
        ideal: "Línea nacional de aluminio, en perfiles de 2 y 3 pulgadas.",
        pendingNote: 'PENDIENTE: descripción real e "ideal si..." de la línea nacional',
        message:
          "Hola, me interesa la Línea Nacional para mi recámara/sala/área de trabajo. El claro mide aprox. ___ de ancho por ___ de alto. ¿Me pueden dar precio?",
        description: "Línea nacional de aluminio, en perfiles de 2 y 3 pulgadas.",
        features: ["Sistema versátil", "Ajuste a medida", "Uso residencial"],
        benefits: ["Buena ventilación", "Instalación práctica", "Estilo adaptable"],
        useCase: "Ventanas residenciales, áreas de servicio y espacios de uso frecuente",
        recommendation:
          "Funciona bien cuando el proyecto necesita una solución directa, durable y bien instalada.",
        vibe: "Se siente funcional, clara y confiable.",
        metrics: {
          openness: 3,
          structure: 4,
          privacy: 3,
        },
      },
    ],
  },
  cta: {
    label: "Cotizar ventana",
    href: "https://wa.me/527293813723?text=Hola%2C%20quiero%20cotizar%20ventanas%20a%20medida.",
  },
  heroUseCases: ["Luz natural", "Ventilación", "Aislamiento"],
} as const;

export const ventanasNavLinks = [
  { href: "/", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "#aplicaciones", label: "Aplicaciones", sectionId: "aplicaciones" },
  { href: "#calidad", label: "Calidad", sectionId: "calidad" },
  { href: "#tipos", label: "Tipos", sectionId: "tipos" },
  { href: "#proyectos", label: "Proyectos", sectionId: "proyectos" },
  { href: "#preguntas", label: "Preguntas", sectionId: "preguntas" },
] as const;

export const ventanasSecondaryNavLinks = [
  { href: "#contacto", label: "Contacto", sectionId: "contacto" },
] as const;

export const ventanasScrollSpyLinks = [
  ...ventanasNavLinks,
  ...ventanasSecondaryNavLinks,
].filter((item) => "sectionId" in item);

export const ventanasMobileNavLinks = [
  ...ventanasNavLinks,
  ...ventanasSecondaryNavLinks,
  { href: "#contacto", label: "Cotizar" },
] as const;

export const ventanasFaq = {
  eyebrow: "Preguntas frecuentes",
  title: "Antes de cotizar",
  accent: "tus ventanas",
  description: "Si tu duda no está aquí, mándanos una foto por WhatsApp.",
  items: [
    {
      question: "¿Cuánto cuesta instalar ventanas de aluminio?",
      answer:
        "El precio depende de las medidas, la línea de aluminio y el tipo de cristal. Mándanos fotos y medidas aproximadas por WhatsApp y te cotizamos sin costo.",
    },
    {
      question: "¿Cuánto tarda la instalación?",
      answer:
        "El tiempo depende de la cantidad de ventanas y de que el claro ya esté listo. Al cotizar te decimos el plazo de fabricación e instalación.",
    },
    {
      question: "¿Tienen que medir en mi casa?",
      answer:
        "Sí. Medimos en el domicilio para fabricar cada ventana a la medida. Puedes empezar con fotos y medidas aproximadas.",
    },
    {
      question: "¿Llegan a mi zona?",
      answer:
        "Instalamos en Toluca, Metepec y alrededores. Dinos tu colonia para confirmar la visita.",
    },
    {
      question: "¿Puedo enviar fotos del espacio?",
      answer:
        "Sí. Por WhatsApp puedes mandar fotos del claro y, si quieres, una referencia de la ventana que buscas.",
    },
  ],
} as const;
