import { ServiceConversionPage } from "@/features/conversion/service-conversion-page";
import {
  cancelesFaq,
  cancelesMobileNavLinks,
  cancelesNavLinks,
  cancelesPageContent,
  cancelesScrollSpyLinks,
  cancelesSecondaryNavLinks,
} from "./canceles-page.data";

const whatsappHref =
  "https://wa.me/527293813723?text=Hola%2C%20quiero%20cotizar%20un%20cancel%20de%20ba%C3%B1o%20a%20la%20medida%20en%20Toluca.";

export function CancelesPage() {
  return (
    <ServiceConversionPage
      servicio="canceles"
      quoteService="Canceles de baño"
      whatsappHref={whatsappHref}
      compactNav
      revealSticky
      useCasesLink
      qualityColumns
      hero={{
        eyebrow: "Cancelería a la medida",
        title: "Canceles de baño en Toluca y Metepec",
        titleMain: "Canceles de baño",
        titleAccent: "en Toluca y Metepec",
        description:
          "Cristal templado a la medida de tu baño.\nLo medimos en tu casa y lo dejamos instalado.",
        fullScreen: true,
        chips: ["Cotización sin costo", "Corredizo, abatible o en escuadra", "Lun a sáb · 8:00–18:00"],
        image: {
          src: "/img/cancel_bano/hero_web_lcp.webp",
          mobileSrc: "/img/cancel_bano/hero_movil_lcp.webp",
          alt: "Cancel de baño de cristal templado instalado en un baño residencial",
          width: 1600,
          height: 640,
        },
      }}
      content={cancelesPageContent}
      useCasesHeading={{
        title: "Instalamos el cancel",
        accent: "según tu baño",
        description:
          "Regadera, baño chico o baño principal. Lo medimos en tu casa y lo fabricamos a la medida.",
      }}
      faq={cancelesFaq}
      contact={{
        title: "Cotiza tu cancel",
        accent: "sin costo",
        description: "Te respondemos de lunes a sábado, de 8:00 a 18:00.",
      }}
      gallery={{
        title: "Trabajos",
        accent: "que ya instalamos",
        description: "Fotos reales de instalaciones en Toluca y Metepec.",
        match: (category) => category.startsWith("Canceles"),
      }}
      navLinks={cancelesNavLinks}
      secondaryNavLinks={cancelesSecondaryNavLinks}
      mobileNavLinks={cancelesMobileNavLinks}
      scrollSpyLinks={cancelesScrollSpyLinks}
    />
  );
}
