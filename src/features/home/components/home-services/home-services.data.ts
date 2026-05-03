export const servicesContent = {
  eyebrow: "Catálogo de soluciones",
  title: "Soluciones para transformar",
  accentTitle: "tu espacio en aluminio y vidrio",
  description:
    "Explora cada servicio y acércate a una solución pensada para tu proyecto: medidas claras, instalación precisa y acabados que se sienten limpios desde el primer vistazo.",
  sharedImage: {
    src: "/img/img_servios_3.webp",
    alt: "Servicios de aluminio y vidrio",
    position: "center 42%",
  },
  items: [
    {
      title: "barandales",
      description:
        "Protección ligera y resistente para escaleras, balcones y terrazas con una lectura visual limpia.",
      ctaLabel: "Explorar opciones de barandales",
      href: "/servicios/barandales",
      image: "/img/img_barandal.webp",
      imagePosition: "center center",
    },
    {
      title: "canceles de baño",
      description:
        "Soluciones a medida que ordenan el baño, aprovechan el espacio y elevan el acabado final.",
      ctaLabel: "Explorar opciones de canceles de baño",
      href: "#ubicacion",
      image: "/img/img_bano.webp",
      imagePosition: "center center",
    },
    {
      title: "fachadas",
      description:
        "Frentes de vidrio y aluminio pensados para ganar presencia, entrada de luz y durabilidad.",
      ctaLabel: "Explorar opciones de fachadas",
      href: "#ubicacion",
      image: "/img/img_fachada.webp",
      imagePosition: "center center",
    },
    {
      title: "pérgolas",
      description:
        "Estructuras que dan sombra, protegen el espacio exterior y conservan una estética sobria.",
      ctaLabel: "Explorar opciones de pérgolas",
      href: "#ubicacion",
      image: "/img/img_pergola.webp",
      imagePosition: "center 28%",
    },
    {
      title: "puertas",
      description:
        "Accesos en aluminio y vidrio que combinan seguridad, apertura suave y presencia moderna.",
      ctaLabel: "Explorar opciones de puertas",
      href: "#ubicacion",
      image: "/img/img_puerta.webp",
      imagePosition: "center center",
    },
    {
      title: "ventanas",
      description:
        "Propuestas para mejorar luz, ventilación y aislamiento sin perder elegancia visual.",
      ctaLabel: "Explorar opciones de ventanas",
      href: "#ubicacion",
      image: "/img/img_ventana.webp",
      imagePosition: "center center",
    },
  ],
} as const;

export type ServiceItem = (typeof servicesContent.items)[number];
export type ServiceTitle = ServiceItem["title"];
