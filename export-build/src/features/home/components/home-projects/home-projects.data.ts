export type ProjectHighlight = {
  title: string;
  category: string;
  description: string;
  alt: string;
  image: string;
  imagePosition: string;
  location?: string;
};

export type ProjectsSectionContent = {
  eyebrow: string;
  title: string;
  accentTitle: string;
  description: string;
  items: readonly ProjectHighlight[];
};

export const projectsContent: ProjectsSectionContent = {
  eyebrow: "Trabajos que hablan por sí solos",
  title: "Proyectos que muestran",
  accentTitle: "cómo se transforma un espacio",
  description:
    "Una selección visual de instalaciones, detalles y resultados. Aquí cada imagen funciona como prueba: materiales correctos, trazos limpios y una entrega que se nota en el uso diario.",
  items: [
    {
      title: "Ventanas de aluminio para iluminación natural",
      category: "Ventanas de aluminio",
      description:
        "Mejoran entrada de luz y ventilación con una imagen ordenada y fácil de integrar al espacio.",
      alt: "Ventanas de aluminio y vidrio instaladas en habitación residencial",
      image: "/img/trabajos/ventanas-aluminio-iluminacion-natural.webp",
      imagePosition: "center center",
      location: "Interior residencial",
    },
    {
      title: "Pérgola con cubierta de vidrio",
      category: "Pérgolas y cubiertas",
      description:
        "Protege el acceso exterior sin perder claridad, amplitud ni entrada de luz natural.",
      alt: "Pérgola con estructura metálica y cubierta de vidrio en acceso exterior",
      image: "/img/trabajos/pergola-cubierta-vidrio-acceso-exterior.webp",
      imagePosition: "center center",
      location: "Área exterior",
    },
    {
      title: "Cancel de baño corredizo en cristal templado",
      category: "Canceles de baño",
      description:
        "Divide el área de regadera con una solución limpia, sobria y fácil de mantener.",
      alt: "Cancel de baño corredizo de cristal templado instalado en baño residencial",
      image: "/img/trabajos/cancel-bano-corredizo-cristal-templado.webp",
      imagePosition: "center center",
      location: "Baño residencial",
    },
    {
      title: "Barandal de vidrio para escalera interior",
      category: "Barandales de vidrio",
      description:
        "Aporta seguridad y mantiene una lectura ligera en dobles alturas y circulaciones interiores.",
      alt: "Barandal de vidrio templado instalado en escalera interior",
      image: "/img/trabajos/barandal-vidrio-escalera-interior.webp",
      imagePosition: "center center",
      location: "Escalera residencial",
    },
    {
      title: "Puertas corredizas para terraza o patio",
      category: "Puertas de aluminio y vidrio",
      description:
        "Conectan interior y exterior con perfiles limpios, apertura amplia y presencia moderna.",
      alt: "Puertas corredizas de aluminio y vidrio instaladas en acceso exterior",
      image: "/img/trabajos/puertas-corredizas-terraza-patio.webp",
      imagePosition: "center center",
      location: "Acceso residencial",
    },
    {
      title: "Fachada de cristal para doble altura",
      category: "Fachadas de cristal",
      description:
        "Da presencia al frente del proyecto y aprovecha mejor la luz en interiores amplios.",
      alt: "Fachada de cristal y aluminio en volumen residencial de doble altura",
      image: "/img/trabajos/fachada-cristal-doble-altura.webp",
      imagePosition: "center center",
      location: "Fachada residencial",
    },
    {
      title: "Puerta principal con presencia contemporánea",
      category: "Puertas de acceso",
      description:
        "Resuelve el acceso con una imagen sólida, cuidada y acorde al carácter de la fachada.",
      alt: "Puerta principal instalada en acceso residencial contemporáneo",
      image: "/img/trabajos/puerta-principal-contemporanea.webp",
      imagePosition: "center center",
      location: "Acceso principal",
    },
    {
      title: "Ventanal de aluminio y vidrio para corredor",
      category: "Ventanas de aluminio",
      description:
        "Aprovecha recorridos largos con luz natural continua y vistas más limpias hacia el exterior.",
      alt: "Ventanal de aluminio y vidrio instalado a lo largo de un corredor",
      image: "/img/trabajos/ventanal-aluminio-vidrio-corredor.webp",
      imagePosition: "center center",
      location: "Corredor exterior",
    },
    {
      title: "Cancel de baño con herrajes negros",
      category: "Canceles de baño",
      description:
        "Ordena el espacio de regadera con una solución moderna que se integra bien a acabados claros.",
      alt: "Cancel de baño de cristal templado con herrajes negros en baño moderno",
      image: "/img/trabajos/cancel-bano-herrajes-negros.webp",
      imagePosition: "center center",
      location: "Baño contemporáneo",
    },
    {
      title: "Barandal de vidrio para vista abierta",
      category: "Barandales de vidrio",
      description:
        "Protege el perímetro sin bloquear la luz ni la relación visual entre niveles.",
      alt: "Barandal de vidrio instalado en borde interior con vista abierta",
      image: "/img/trabajos/barandal-vidrio-vista-abierta.webp",
      imagePosition: "center center",
      location: "Interior de doble altura",
    },
    {
      title: "Fachada con ventanales de gran formato",
      category: "Fachadas de cristal",
      description:
        "Refuerza una imagen arquitectónica limpia y deja pasar más luz hacia las áreas interiores.",
      alt: "Fachada con ventanales de gran formato en proyecto residencial",
      image: "/img/trabajos/fachada-ventanales-gran-formato.webp",
      imagePosition: "center center",
      location: "Volumen residencial",
    },
    {
      title: "Escalera con barandal de vidrio y madera",
      category: "Barandales de vidrio",
      description:
        "Combina seguridad y ligereza visual en recorridos interiores con acabados cálidos.",
      alt: "Escalera interior con barandal de vidrio y peldaños de madera",
      image: "/img/trabajos/escalera-barandal-vidrio-madera.webp",
      imagePosition: "center center",
      location: "Escalera interior",
    },
    {
      title: "Puerta de acceso residencial",
      category: "Puertas de acceso",
      description:
        "Aporta control de acceso y una imagen cuidada desde el primer contacto con la vivienda.",
      alt: "Puerta de acceso instalada en fachada residencial",
      image: "/img/trabajos/puerta-acceso-residencial.webp",
      imagePosition: "center center",
      location: "Entrada residencial",
    },
    {
      title: "Ventanales para espacio a doble altura",
      category: "Ventanas de aluminio",
      description:
        "Amplían la entrada de luz y ayudan a que los interiores se sientan más abiertos.",
      alt: "Ventanales de aluminio y vidrio en espacio interior de doble altura",
      image: "/img/trabajos/ventanales-espacio-doble-altura.webp",
      imagePosition: "center center",
      location: "Interior residencial",
    },
    {
      title: "Balcón con barandal de vidrio",
      category: "Barandales de vidrio",
      description:
        "Define el borde del balcón con una presencia ligera que acompaña la fachada.",
      alt: "Balcón con barandal de vidrio instalado en fachada residencial",
      image: "/img/trabajos/balcon-barandal-vidrio.webp",
      imagePosition: "center center",
      location: "Balcón residencial",
    },
    {
      title: "Frente con cancelería oscura",
      category: "Fachadas de cristal",
      description:
        "Integra perfiles oscuros y paños amplios para una fachada sobria y contemporánea.",
      alt: "Fachada residencial con cancelería oscura y paños amplios de vidrio",
      image: "/img/trabajos/frente-canceleria-oscura.webp",
      imagePosition: "center center",
      location: "Frente residencial",
    },
    {
      title: "Cancel de baño con apertura limpia",
      category: "Canceles de baño",
      description:
        "Mantiene el baño ordenado con un cierre preciso y una lectura visual ligera.",
      alt: "Cancel de baño de cristal templado con apertura limpia en baño claro",
      image: "/img/trabajos/cancel-bano-apertura-limpia.webp",
      imagePosition: "center center",
      location: "Baño residencial",
    },
  ],
} as const;
