export const servicesContent = {
  eyebrow: "Cat\u00e1logo de soluciones",
  title: "Soluciones para transformar",
  accentTitle: "tu espacio en aluminio y vidrio",
  description:
    "Explora cada servicio y ac\u00e9rcate a una soluci\u00f3n pensada para tu proyecto: medidas claras, instalaci\u00f3n precisa y acabados que se sienten limpios desde el primer vistazo.",
  sharedImage: {
    src: "/img/img_servios_3.webp",
    alt: "Servicios de aluminio y vidrio",
    position: "center 42%",
  },
  items: [
    {
      title: "barandales",
      description:
        "Protecci\u00f3n ligera y resistente para escaleras, balcones y terrazas con una lectura visual limpia.",
      ctaLabel: "Explorar opciones de barandales",
      href: "/servicios/barandales",
      image: "/img/img_barandal.webp",
      imagePosition: "center center",
    },
    {
      title: "canceles de ba\u00f1o",
      description:
        "Soluciones a medida que ordenan el ba\u00f1o, aprovechan el espacio y elevan el acabado final.",
      ctaLabel: "Ver contacto para canceles de ba\u00f1o",
      href: "#ubicacion",
      image: "/img/img_bano.webp",
      imagePosition: "center center",
    },
    {
      title: "fachadas",
      description:
        "Frentes de vidrio y aluminio pensados para ganar presencia, entrada de luz y durabilidad.",
      ctaLabel: "Ver contacto para fachadas",
      href: "#ubicacion",
      image: "/img/img_fachada.webp",
      imagePosition: "center center",
    },
    {
      title: "p\u00e9rgolas",
      description:
        "Estructuras que dan sombra, protegen el espacio exterior y conservan una est\u00e9tica sobria.",
      ctaLabel: "Ver contacto para p\u00e9rgolas",
      href: "#ubicacion",
      image: "/img/img_pergola.webp",
      imagePosition: "center 28%",
    },
    {
      title: "puertas",
      description:
        "Accesos en aluminio y vidrio que combinan seguridad, apertura suave y presencia moderna.",
      ctaLabel: "Ver contacto para puertas",
      href: "#ubicacion",
      image: "/img/img_puerta.webp",
      imagePosition: "center center",
    },
    {
      title: "ventanas",
      description:
        "Propuestas para mejorar luz, ventilaci\u00f3n y aislamiento sin perder elegancia visual.",
      ctaLabel: "Ver contacto para ventanas",
      href: "#ubicacion",
      image: "/img/img_ventana.webp",
      imagePosition: "center center",
    },
  ],
} as const;

export type ServiceItem = (typeof servicesContent.items)[number];
export type ServiceTitle = ServiceItem["title"];
