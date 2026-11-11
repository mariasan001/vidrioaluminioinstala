import { ServiceCatalogPage } from "@/features/services/service-catalog-page";
import {
  barandalesMobileNavLinks,
  barandalesNavLinks,
  barandalesPageContent,
  barandalesScrollSpyLinks,
  barandalesSecondaryNavLinks,
} from "./barandales-page.data";

export function BarandalesPage() {
  return (
    <ServiceCatalogPage
      content={barandalesPageContent}
      quoteService="Barandales"
      useCasesHeading={{
        title: "Dónde queda mejor un",
        accent: "barandal",
        description:
          "Pensamos cada solución según el recorrido, la altura, la vista y el uso real del espacio.",
      }}
      typesRailLabel="Tipos de barandal"
      navLinks={barandalesNavLinks}
      secondaryNavLinks={barandalesSecondaryNavLinks}
      mobileNavLinks={barandalesMobileNavLinks}
      scrollSpyLinks={barandalesScrollSpyLinks}
    />
  );
}
