/**
 * Contenido de barandales compartido entre la landing de conversión (`/barandales`)
 * y el catálogo (`/servicios/barandales`).
 */

/** Tipos de barandal que aparecen en ambas páginas (identidad + imagen). */
export const barandalesSharedTypes = {
  botones: {
    id: "botones",
    title: "Barandal con botones",
    model: "con botones",
    image: {
      src: "/img/barandales/botones.webp",
      alt: "Barandal de vidrio con sujeciones tipo botón",
    },
  },
  miniposte: {
    id: "miniposte",
    title: "Barandal con miniposte",
    model: "con miniposte",
    image: {
      src: "/img/barandales/miniposte.webp",
      alt: "Barandal con cristal y minipostes metálicos",
    },
  },
  poste: {
    id: "poste",
    title: "Barandal con poste",
    model: "con poste",
    image: {
      src: "/img/barandales/poste.webp",
      alt: "Barandal exterior con cristal y estructura metálica",
    },
  },
} as const;

export const barandalesFaq = {
  eyebrow: "Preguntas frecuentes",
  title: "Antes de cotizar",
  accent: "tu barandal",
  description: "Si tu duda no está aquí, mándanos una foto por WhatsApp.",
  items: [
    {
      question: "¿Qué tan seguro es un barandal de vidrio?",
      answer:
        "Usamos cristal templado de 10 mm, sujeto con herrajes de acero inoxidable. Es firme, y si llegara a romperse se hace pedacitos sin filo.",
    },
    {
      question: "¿Se le puede poner pasamanos?",
      answer: "Sí, el modelo con poste puede llevar pasamanos de acero inoxidable arriba.",
    },
    {
      question: "¿Sirve para exteriores?",
      answer:
        "Sí. El cristal templado y los herrajes de acero inoxidable están pensados para uso en balcones, terrazas y escaleras exteriores.",
    },
    {
      question: "¿A qué altura se instala?",
      answer:
        "Depende del modelo y del espacio. El de poste mide 1 m y el de miniposte llega hasta 120 cm. En la visita te recomendamos la altura adecuada.",
    },
    {
      question: "¿Cómo se limpia?",
      answer:
        "Con agua y jabón neutro o limpiavidrios, con un paño suave. Evita fibras metálicas y abrasivos.",
    },
  ],
} as const;
