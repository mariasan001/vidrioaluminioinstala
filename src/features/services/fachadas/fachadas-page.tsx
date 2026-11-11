import { ServiceCatalogPage } from "@/features/services/service-catalog-page";
import {
  fachadasMobileNavLinks,
  fachadasNavLinks,
  fachadasPageContent,
  fachadasScrollSpyLinks,
  fachadasSecondaryNavLinks,
} from "./fachadas-page.data";

export function FachadasPage() {
  return (
    <ServiceCatalogPage
      content={fachadasPageContent}
      quoteService="Fachadas"
      heroLinkLabel="Ver sistema"
      useCasesHeading={{
        title: "Dónde queda mejor una",
        accent: "fachada de cristal",
        description:
          "Pensamos cada solución según la luz, la vista, la escala del frente y el uso real del proyecto.",
      }}
      typesRailLabel="Tipos de fachada"
      navLinks={fachadasNavLinks}
      secondaryNavLinks={fachadasSecondaryNavLinks}
      mobileNavLinks={fachadasMobileNavLinks}
      scrollSpyLinks={fachadasScrollSpyLinks}
    />
  );
}
