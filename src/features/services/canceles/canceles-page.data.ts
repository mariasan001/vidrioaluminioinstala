export const cancelesPageContent = {
  slug: "canceles-de-bano",
  eyebrow: "Canceles de baño en cristal templado",
  title: "Canceles de baño",
  accentTitle: "sin saturar el espacio",
  description:
    "Diseñamos e instalamos canceles de baño pensados para aprovechar mejor la distribución, mantener una vista ligera y resolver la zona de regadera con una instalación precisa.",
  image: {
    src: "/img/cancel_bano/hero_web.webp",
    mobileSrc: "/img/cancel_bano/hero_movil.webp",
    alt: "Cancel de baño de cristal templado instalado en baño moderno",
  },
  details: [
    {
      title: "Para tu regadera",
      icon: "shower" as const,
      description:
        "Adiós a la cortina. El agua se queda dentro y tu baño se ve más limpio y amplio.",
    },
    {
      title: "Para baños chicos",
      icon: "sliding" as const,
      description:
        "Puertas corredizas que no ocupan espacio al abrir. Ideal si tu baño es angosto.",
    },
    {
      title: "Para el baño principal",
      icon: "gem" as const,
      description:
        "Cristal claro o esmerilado y el tipo de apertura que mejor quede con tus acabados.",
    },
  ],
  quality: {
    eyebrow: "Cómo lo instalamos",
    title: "Lo que no se ve en la foto",
    accentTitle: "y sí se nota al usarlo",
    description: "Seguridad, buen ajuste y una instalación bien hecha.",
    image: {
      src: "/img/cancel_bano/calidad.webp",
      alt: "Detalle de cancel de baño con cristal templado y perfiles limpios",
    },
    points: [
      {
        title: "Cristal templado",
        icon: "shield",
        description:
          "Si llegara a romperse, se hace pedacitos sin filo. Más seguro para tu familia.",
      },
      {
        title: "Hecho a tu medida",
        icon: "height",
        description:
          "Aunque tus muros o tu piso no estén parejos, el cancel cierra bien y el agua no se sale.",
      },
      {
        title: "Perfiles discretos",
        icon: "sparkles",
        description: "Líneas delgadas que no se roban la vista y se limpian fácil.",
      },
      {
        title: "Instalación completa",
        icon: "check",
        description: "Lo dejamos nivelado, sellado y listo para usarse.",
      },
    ],
  },
  types: {
    eyebrow: "Tipos de cancel",
    title: "¿Cuál va con tu baño?",
    accentTitle: "6 tipos de cancel",
    description:
      "Si no sabes cuál elegir, mándanos una foto de tu regadera y te recomendamos.",
    items: [
      {
        id: "doble-corredizo",
        label: "Doble corredizo Río Bravo",
        title: "Cancel doble corredizo Río Bravo",
        icon: "profile",
        image: {
          src: "/img/cancel_bano/doble_corredizo.webp",
          alt: "Cancel doble corredizo Río Bravo con marco de aluminio",
        },
        ideal:
          "Dos hojas corredizas con marco de aluminio. Ideal si tu baño es angosto: abre sin ocupar espacio.",
        detail: "Cristal de 6 o 10 mm · recto o en escuadra",
        message:
          "Hola, me interesa el cancel doble corredizo Río Bravo. Mi regadera mide aprox. ___ (tienen 1.85×1.50, 1.85×1.80, 2.00×1.50 y 2.00×2.00 m). ¿Me pueden dar precio?",
        description:
          "Sistema corredizo para baños donde la apertura debe sentirse suave y práctica. Sus hojas se desplazan sobre el mismo frente para conservar circulación y ligereza visual.",
        features: ["Apertura corrediza", "Paso despejado", "Diseño funcional"],
        benefits: ["Uso cómodo", "Más circulación", "Vista ligera del baño"],
        useCase: "Baños compactos o compartidos con circulación limitada",
        recommendation:
          "Muy recomendable cuando el baño necesita una apertura sencilla sin ocupar espacio adicional.",
        vibe: "Se siente práctico, ligero y fácil de usar.",
        metrics: {
          openness: 4,
          structure: 3,
          privacy: 3,
        },
      },
      {
        id: "bacalar",
        label: "Bacalar",
        title: "Cancel Bacalar",
        icon: "post",
        image: {
          src: "/img/cancel_bano/bacalar.webp",
          alt: "Cancel Bacalar para baño con cristal templado",
        },
        ideal:
          "Un cristal fijo y una puerta corrediza de 10 mm, con herrajes de acero inoxidable. Se puede hacer en escuadra.",
        detail: "Herrajes satinado o negro · claro o esmerilado",
        description:
          "Propuesta de líneas sobrias para baños que necesitan una presencia firme y visualmente equilibrada. Se adapta a la medida del claro y al estilo del proyecto.",
        features: ["Perfiles definidos", "Ajuste a medida", "Presencia sobria"],
        benefits: ["Lectura ordenada", "Buena estabilidad", "Acabado limpio"],
        useCase: "Baños residenciales con diseño moderno y uso frecuente",
        recommendation:
          "Funciona bien cuando el baño pide un cancel firme, discreto y fácil de integrar.",
        vibe: "Se percibe estable, limpio y contemporáneo.",
        metrics: {
          openness: 4,
          structure: 4,
          privacy: 3,
        },
      },
      {
        id: "cozumel",
        label: "Cozumel",
        title: "Cancel Cozumel",
        icon: "button",
        image: {
          src: "/img/cancel_bano/cozumel.webp",
          alt: "Cancel Cozumel instalado en baño moderno",
        },
        ideal: "Cristal fijo y puerta corrediza de 10 mm con herrajes de acero inoxidable.",
        detail: "Herrajes satinado o negro · transparente o esmerilado",
        description:
          "Sistema pensado para una apariencia ligera y elegante. Acompaña baños claros, modernos y bien iluminados con una presencia discreta.",
        features: ["Imagen ligera", "Acabado elegante", "Integración a medida"],
        benefits: ["Más amplitud visual", "Mejor paso de luz", "Acabado más refinado"],
        useCase: "Baños modernos donde la vista abierta es prioridad",
        recommendation:
          "Conviene cuando el baño tiene acabados protagonistas y el cancel debe integrarse con sutileza.",
        vibe: "Se siente luminoso, fino y sereno.",
        metrics: {
          openness: 5,
          structure: 3,
          privacy: 2,
        },
      },
      {
        id: "cielo",
        label: "Cielo",
        title: "Cancel Cielo",
        icon: "steel",
        image: {
          src: "/img/cancel_bano/cielo.webp",
          alt: "Cancel Cielo para baño con presencia ligera",
        },
        ideal: "Ideal si buscas un cancel ligero que no tape el baño.",
        description:
          "Alternativa de presencia ligera para baños que buscan continuidad visual. Se desarrolla a medida para conservar amplitud y proteger la zona de regadera.",
        features: ["Continuidad visual", "Presencia ligera", "Ajuste preciso"],
        benefits: ["Mayor amplitud", "Vista despejada", "Acabado contemporáneo"],
        useCase: "Baños con diseño abierto y acabados claros",
        recommendation:
          "Ideal cuando el objetivo es que el cancel se sienta integrado, discreto y moderno.",
        vibe: "Se ve abierto, sereno y elegante.",
        metrics: {
          openness: 5,
          structure: 2,
          privacy: 2,
        },
      },
      {
        id: "curvo",
        label: "Curvo",
        title: "Cancel curvo",
        icon: "curve",
        image: {
          src: "/img/cancel_bano/curvo.webp",
          alt: "Cancel curvo de cristal para baño",
        },
        ideal: "Ideal si tu regadera es curva.",
        description:
          "Solución para regaderas curvas o baños donde la geometría pide una respuesta más fluida. Acompaña la forma del área y hace que la circulación se sienta natural.",
        features: ["Diseño curvo", "Adaptado al espacio", "Trazo fluido"],
        benefits: ["Circulación cómoda", "Aprovecha mejor la forma", "Resultado más personalizado"],
        useCase: "Regaderas curvas o baños con distribución especial",
        recommendation:
          "Es la ruta adecuada cuando la arquitectura del baño merece una solución diseñada para su forma.",
        vibe: "Se siente fluido, especial y hecho para ese baño.",
        metrics: {
          openness: 4,
          structure: 4,
          privacy: 3,
        },
      },
      {
        id: "escuadra",
        label: "Escuadra",
        title: "Cancel en escuadra",
        icon: "mesh",
        image: {
          src: "/img/cancel_bano/escuadra.webp",
          alt: "Cancel de baño en escuadra con cristal templado",
        },
        ideal: "Ideal si la regadera está en esquina.",
        description:
          "Proyecto a medida para regaderas en esquina. Cubre dos frentes con una lectura continua y ayuda a definir la zona de baño sin perder amplitud.",
        features: ["Configuración en esquina", "Dos frentes de protección", "Medidas precisas"],
        benefits: ["Área mejor definida", "Vista continua", "Aprovecha la esquina"],
        useCase: "Regaderas en esquina y baños con área húmeda definida",
        recommendation:
          "Recomendable cuando la distribución del baño necesita resolver dos lados con una presencia unificada.",
        vibe: "Se percibe completo, ordenado y bien resuelto.",
        metrics: {
          openness: 4,
          structure: 4,
          privacy: 4,
        },
      },
    ],
  },
  cta: {
    label: "Cotizar cancel",
    href: "https://wa.me/527293813723?text=Hola%2C%20quiero%20cotizar%20un%20cancel%20de%20ba%C3%B1o%20a%20medida.",
  },
  heroUseCases: ["Regaderas", "Baños compactos", "Proyectos a medida"],
} as const;

export const cancelesNavLinks = [
  { href: "/", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "#aplicaciones", label: "Aplicaciones", sectionId: "aplicaciones" },
  { href: "#calidad", label: "Calidad", sectionId: "calidad" },
  { href: "#tipos", label: "Tipos", sectionId: "tipos" },
  { href: "#proyectos", label: "Proyectos", sectionId: "proyectos" },
  { href: "#preguntas", label: "Preguntas", sectionId: "preguntas" },
] as const;

export const cancelesSecondaryNavLinks = [
  { href: "#contacto", label: "Contacto", sectionId: "contacto" },
] as const;

export const cancelesScrollSpyLinks = [
  ...cancelesNavLinks,
  ...cancelesSecondaryNavLinks,
].filter((item) => "sectionId" in item);

export const cancelesMobileNavLinks = [
  ...cancelesNavLinks,
  ...cancelesSecondaryNavLinks,
  { href: "#contacto", label: "Cotizar" },
] as const;

export const cancelesFaq = {
  eyebrow: "Preguntas frecuentes",
  title: "Antes de cotizar",
  accent: "tu cancel",
  description: "Si tu duda no está aquí, mándanos una foto por WhatsApp.",
  items: [
    {
      question: "¿Qué diferencia hay entre cristal templado y vidrio normal?",
      answer:
        "El templado es varias veces más resistente a golpes y cambios de temperatura. Si llegara a romperse, se hace pedacitos sin filo en vez de picos cortantes. Por eso es el indicado para la regadera.",
    },
    {
      question: "¿Me conviene corredizo o abatible?",
      answer:
        "Si tu baño es angosto o la puerta choca con el lavabo o el escusado, el corredizo es mejor porque no ocupa espacio al abrir. Si tienes espacio libre frente a la regadera, el abatible da una entrada más amplia.",
    },
    {
      question: "¿Cristal claro o esmerilado?",
      answer:
        "El claro hace que el baño se vea más grande y luminoso. El esmerilado da más privacidad y disimula mejor las marcas de agua y el sarro.",
    },
    {
      question: "¿Qué grosor de cristal usan?",
      answer:
        "Depende del modelo. El doble corredizo con marco de aluminio puede llevar cristal de 6 o 10 mm. Los modelos con puerta colgada de herrajes de acero inoxidable, como Bacalar y Cozumel, llevan 10 mm, porque necesitan más firmeza.",
    },
    {
      question: "¿Hay que romper azulejo para instalarlo?",
      answer:
        "Depende de cómo esté tu baño. En la visita de medición revisamos muros y piso, y te decimos si hace falta algún ajuste antes de instalar.",
    },
    {
      question: "¿Cómo lo limpio para que no se ponga opaco?",
      answer:
        "Después de bañarte, pasa un jalador de agua para que no se seque el sarro. Una vez a la semana, límpialo con agua y jabón neutro o vinagre diluido. Evita fibras metálicas y limpiadores abrasivos, porque rayan el cristal.",
    },
  ],
} as const;
