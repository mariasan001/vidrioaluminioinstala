import { ServiceConversionPage } from "@/features/conversion/service-conversion-page";
import {
  ventanasFaq,
  ventanasMobileNavLinks,
  ventanasNavLinks,
  ventanasPageContent,
  ventanasScrollSpyLinks,
  ventanasSecondaryNavLinks,
} from "./ventanas-page.data";

const whatsappHref =
  "https://wa.me/527293813723?text=Hola%2C%20quiero%20cotizar%20ventanas%20de%20aluminio%20a%20la%20medida%20en%20Toluca.";

export function VentanasPage() {
  return (
    <ServiceConversionPage
      servicio="ventanas"
      quoteService="Ventanas"
      whatsappHref={whatsappHref}
      compactNav
      revealSticky
      useCasesLink
      qualityColumns
      hero={{
        eyebrow: "Ventanas a la medida",
        title: "Ventanas de aluminio en Toluca y Metepec",
        titleMain: "Ventanas de aluminio",
        titleAccent: "en Toluca y Metepec",
        description:
          "De aluminio a la medida, para recámaras, salas y áreas de trabajo. Lo medimos en tu casa y lo dejamos instalado.",
        fullScreen: true,
        chips: ["Cotización sin costo", "Línea española o nacional", "Lun a sáb · 8:00–18:00"],
        image: {
          src: "/img/ventanas/hero_web_lcp.webp",
          mobileSrc: "/img/ventanas/hero_movil_lcp.webp",
          alt: "Ventana de aluminio y cristal instalada en una casa de Toluca",
          width: 1400,
          height: 933,
        },
      }}
      content={ventanasPageContent}
      useCasesHeading={{
        title: "Instalamos la ventana",
        accent: "según tu espacio",
        description: "Recámara, sala o área de trabajo. Lo medimos en tu casa y la fabricamos a la medida.",
      }}
      faq={ventanasFaq}
      contact={{
        title: "Cotiza tus ventanas",
        accent: "sin costo",
        description: "Te respondemos de lunes a sábado, de 8:00 a 18:00.",
        whatsappNote: "Mándanos medidas o una foto del claro",
        callbackSubject: "unas ventanas de aluminio",
      }}
      gallery={{
        title: "Trabajos",
        accent: "que ya instalamos",
        description: "Fotos reales de instalaciones en Toluca y Metepec.",
        match: (category) => category.startsWith("Ventanas"),
      }}
      navLinks={ventanasNavLinks}
      secondaryNavLinks={ventanasSecondaryNavLinks}
      mobileNavLinks={ventanasMobileNavLinks}
      scrollSpyLinks={ventanasScrollSpyLinks}
    />
  );
}
