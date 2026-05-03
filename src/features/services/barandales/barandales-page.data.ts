export const barandalesPageContent = {
  slug: "barandales",
  eyebrow: "Barandales en aluminio y vidrio",
  title: "Seguridad ligera",
  accentTitle: "sin cerrar la vista",
  description:
    "Diseñamos e instalamos barandales para escaleras, balcones y terrazas con medidas claras, perfiles limpios y una presencia visual que acompaña el espacio.",
  image: {
    src: "/img/img_barandal.webp",
    alt: "Barandal de vidrio y aluminio instalado en terraza residencial",
  },
  highlights: [
    "Vidrio templado o laminado según el uso del espacio",
    "Perfiles y sujeciones en aluminio con acabado sobrio",
    "Instalación alineada, segura y pensada para durar",
  ],
  details: [
    {
      title: "Para escaleras",
      description:
        "Soluciones que dan apoyo y seguridad sin hacer pesado el recorrido visual.",
    },
    {
      title: "Para balcones",
      description:
        "Barandales que protegen el perímetro y conservan luz, amplitud y vista.",
    },
    {
      title: "Para terrazas",
      description:
        "Acabados resistentes para exterior, pensados para convivencia y uso diario.",
    },
  ],
  process: [
    "Revisamos medidas, altura, uso y puntos de anclaje.",
    "Proponemos material, tono y tipo de sujeción adecuado.",
    "Instalamos con orden y revisamos firmeza, alineación y limpieza final.",
  ],
  contact: [
    {
      title: "Ubicación",
      value: "Lago Winnipeg 101, El Seminario Primera Secc, 50170 Toluca de Lerdo, Méx.",
    },
    {
      title: "Llámanos",
      value: "729 381 3723",
    },
    {
      title: "Horarios",
      value: "Lunes a sábado: 8:00am - 6:00pm. Domingo: no abrimos.",
    },
  ],
  cta: {
    label: "Cotizar barandal",
    href: "https://wa.me/527293813723?text=Hola%2C%20quiero%20cotizar%20un%20barandal%20de%20aluminio%20y%20vidrio.",
  },
} as const;

export const barandalesNavLinks = [
  { href: "/", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "#proyectos", label: "Proyectos", sectionId: "proyectos" },
  { href: "#calidad", label: "Calidad", sectionId: "calidad" },
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
