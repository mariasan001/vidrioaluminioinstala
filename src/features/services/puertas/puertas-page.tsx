import { HomeContact } from "@/features/home/components/home-contact";
import { HomeFloatingQuote } from "@/features/home/components/home-floating-quote";
import { HomeNav } from "@/features/home/components/home-nav";
import { HomeProjects } from "@/features/home/components/home-projects";
import { BarandalesQualitySection } from "@/features/services/barandales/barandales-quality-section";
import { BarandalesTypesSection } from "@/features/services/barandales/barandales-types-section";
import { BarandalesUseCasesSection } from "@/features/services/barandales/barandales-use-cases-section";
import { ServiceHero } from "@/features/services/components/service-hero";
import {
  puertasMobileNavLinks,
  puertasNavLinks,
  puertasPageContent,
  puertasScrollSpyLinks,
  puertasSecondaryNavLinks,
} from "./puertas-page.data";
import styles from "@/features/services/barandales/barandales-page.module.css";

export function PuertasPage() {
  return (
    <main className={styles.page}>
      <HomeNav
        defaultActiveHref="/#servicios"
        logoHref="/"
        mobileMenuLinks={puertasMobileNavLinks}
        primaryLinks={puertasNavLinks}
        secondaryLinks={puertasSecondaryNavLinks}
        scrollLinks={puertasScrollSpyLinks}
      />

      <ServiceHero
        actions={[
          {
            label: puertasPageContent.cta.label,
            type: "quote",
          },
          {
            href: "#tipos",
            label: "Ver sistemas",
            type: "link",
          },
        ]}
        accentTitle={puertasPageContent.accentTitle}
        description={puertasPageContent.description}
        eyebrow={puertasPageContent.eyebrow}
        image={puertasPageContent.image}
        stats={puertasPageContent.heroUseCases}
        title={puertasPageContent.title}
      />

      <BarandalesUseCasesSection
        content={puertasPageContent}
        heading={{
          title: "Dónde queda mejor una",
          accent: "puerta a medida",
          description:
            "Pensamos cada solución según el acceso, la luz, la seguridad y el flujo real del espacio.",
        }}
      />
      <BarandalesQualitySection content={puertasPageContent} />

      <BarandalesTypesSection content={puertasPageContent} railLabel="Tipos de puerta" />

      <HomeProjects />
      <HomeContact />
      <HomeFloatingQuote />
    </main>
  );
}
