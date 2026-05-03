export const projectsContent = {
  eyebrow: "Trabajos que hablan por sí solos",
  title: "Proyectos que muestran",
  accentTitle: "cómo se transforma un espacio",
  description:
    "Una selección visual de instalaciones, detalles y resultados. Aquí cada imagen funciona como prueba: materiales correctos, trazos limpios y una entrega que se nota en el uso diario.",
  items: [
    {
      title: "Fachada residencial",
      category: "Resultado",
      description: "Cancelaría negra, vidrio amplio y remates limpios",
      format: "video",
      testimonial:
        "Nos explicaron opciones, cuidaron medidas y dejaron una instalación limpia. El cambio se notó desde el primer día.",
      customer: "Cliente residencial",
      location: "Toluca y alrededores",
      image: "/img/hero_img.png",
      imagePosition: "center center",
    },
    {
      title: "Pérgola exterior",
      category: "Trabajo exterior",
      description: "Estructura ligera para terraza y convivencia",
      format: "image",
      testimonial:
        "La pérgola quedó firme, bien alineada y con un acabado que cambió toda la terraza.",
      customer: "Proyecto familiar",
      location: "Zona residencial",
      image: "/img/img_pergola.png",
      imagePosition: "center 28%",
    },
    {
      title: "Cancel de baño",
      category: "Detalle",
      description: "Vidrio claro, herrajes sobrios y apertura suave",
      format: "video",
      testimonial:
        "El cancel se siente ligero, abre suave y el baño se ve mucho más amplio y ordenado.",
      customer: "Remodelación de baño",
      location: "Instalación a medida",
      image: "/img/img_bano.png",
      imagePosition: "24% center",
    },
    {
      title: "Ventanal panorámico",
      category: "Resultado",
      description: "Mejor entrada de luz con perfiles discretos",
      format: "image",
      testimonial:
        "Las ventanas dejaron entrar más luz y el espacio se siente más moderno sin perder calidez.",
      customer: "Proyecto residencial",
      location: "Ventanas a medida",
      image: "/img/img_ventana.png",
      imagePosition: "center center",
    },
    {
      title: "Aluminio y vidrio",
      category: "Proceso",
      description: "Fabricación, ajuste e instalación en sitio",
      format: "video",
      testimonial:
        "Se notó el cuidado en los cortes, los ajustes y la forma de dejar todo listo para usarse.",
      customer: "Seguimiento de obra",
      location: "Proceso de instalación",
      image: "/img/img_servios_3.png",
      imagePosition: "center 42%",
    },
  ],
} as const;

export type ProjectHighlight = (typeof projectsContent.items)[number];
