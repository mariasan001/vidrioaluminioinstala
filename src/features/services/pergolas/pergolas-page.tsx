import { ServiceCatalogPage } from "@/features/services/service-catalog-page";
import {
  pergolasMobileNavLinks,
  pergolasNavLinks,
  pergolasPageContent,
  pergolasScrollSpyLinks,
  pergolasSecondaryNavLinks,
} from "./pergolas-page.data";

export function PergolasPage() {
  return (
    <ServiceCatalogPage
      content={pergolasPageContent}
      quoteService="Pérgolas"
      useCasesHeading={{
        title: "Dónde queda mejor una",
        accent: "pérgola",
        description:
          "Pensamos cada solución según la sombra, la luz, la orientación y el uso real del espacio exterior.",
      }}
      typesRailLabel="Tipos de pérgola"
      navLinks={pergolasNavLinks}
      secondaryNavLinks={pergolasSecondaryNavLinks}
      mobileNavLinks={pergolasMobileNavLinks}
      scrollSpyLinks={pergolasScrollSpyLinks}
    />
  );
}
