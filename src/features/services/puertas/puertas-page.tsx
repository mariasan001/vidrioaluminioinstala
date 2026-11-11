import { ServiceCatalogPage } from "@/features/services/service-catalog-page";
import {
  puertasMobileNavLinks,
  puertasNavLinks,
  puertasPageContent,
  puertasScrollSpyLinks,
  puertasSecondaryNavLinks,
} from "./puertas-page.data";

export function PuertasPage() {
  return (
    <ServiceCatalogPage
      content={puertasPageContent}
      quoteService="Puertas"
      useCasesHeading={{
        title: "Dónde queda mejor una",
        accent: "puerta a medida",
        description:
          "Pensamos cada solución según el acceso, la luz, la seguridad y el flujo real del espacio.",
      }}
      typesRailLabel="Tipos de puerta"
      navLinks={puertasNavLinks}
      secondaryNavLinks={puertasSecondaryNavLinks}
      mobileNavLinks={puertasMobileNavLinks}
      scrollSpyLinks={puertasScrollSpyLinks}
    />
  );
}
