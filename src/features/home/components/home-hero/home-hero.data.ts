export const heroContent = {
  image: {
    src: "/img/hero_img.webp",
    mobileSrc: "/img/hero_movil.webp",
    alt: "Proyecto destacado de aluminio y vidrio",
  },
  eyebrow: "Instalación y fabricación a medida en Toluca y alrededores",
  title: "Haz que tu espacio",
  accentTitle: "se vea como siempre lo imaginaste",
  description:
    "Diseñamos, fabricamos e instalamos cancelería, fachadas, puertas, ventanas y soluciones especiales que combinan estética, seguridad y durabilidad para hogar y negocio.",
  actions: [
    {
      label: "Solicitar proyecto y cotización",
      variant: "primary",
      action: "quote",
    },
    {
      href: "#proyectos",
      label: "Ver proyectos destacados",
      variant: "secondary",
      action: "link",
    },
  ],
  stats: [
    "Ventanas, puertas y canceles",
    "Barandales, fachadas y pérgolas",
    "Cobertura residencial y comercial",
  ],
} as const;
