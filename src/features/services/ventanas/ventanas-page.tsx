import { HomeContact } from "@/features/home/components/home-contact";
import { HomeFloatingQuote } from "@/features/home/components/home-floating-quote";
import { HomeNav } from "@/features/home/components/home-nav";
import { HomeProjects } from "@/features/home/components/home-projects";
import { BarandalesQualitySection } from "@/features/services/barandales/barandales-quality-section";
import { BarandalesTypesSection } from "@/features/services/barandales/barandales-types-section";
import { BarandalesUseCasesSection } from "@/features/services/barandales/barandales-use-cases-section";
import { ServiceHero } from "@/features/services/components/service-hero";
import {
  ventanasMobileNavLinks,
  ventanasNavLinks,
  ventanasPageContent,
  ventanasScrollSpyLinks,
  ventanasSecondaryNavLinks,
} from "./ventanas-page.data";
import styles from "@/features/services/barandales/barandales-page.module.css";

export function VentanasPage() {
  return (
    <main className={styles.page}>
      <HomeNav
        defaultActiveHref="/#servicios"
        logoHref="/"
        mobileMenuLinks={ventanasMobileNavLinks}
        primaryLinks={ventanasNavLinks}
        secondaryLinks={ventanasSecondaryNavLinks}
        scrollLinks={ventanasScrollSpyLinks}
      />

      <ServiceHero
        actions={[
          {
            label: ventanasPageContent.cta.label,
            type: "quote",
          },
          {
            href: "#tipos",
            label: "Ver sistemas",
            type: "link",
          },
        ]}
        accentTitle={ventanasPageContent.accentTitle}
        description={ventanasPageContent.description}
        eyebrow={ventanasPageContent.eyebrow}
        image={ventanasPageContent.image}
        stats={ventanasPageContent.heroUseCases}
        title={ventanasPageContent.title}
      />

      <BarandalesUseCasesSection
        content={ventanasPageContent}
        heading={{
          title: "Dónde queda mejor una",
          accent: "ventana a medida",
          description:
            "Pensamos cada solución según la luz, la ventilación, el aislamiento y el uso real del espacio.",
        }}
      />
      <BarandalesQualitySection content={ventanasPageContent} />

      <BarandalesTypesSection content={ventanasPageContent} railLabel="Tipos de ventana" />

      <HomeProjects />
      <HomeContact />
      <HomeFloatingQuote />
    </main>
  );
}
