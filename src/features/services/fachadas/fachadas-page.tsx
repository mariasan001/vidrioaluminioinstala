import { HomeContact } from "@/features/home/components/home-contact";
import { HomeFloatingQuote } from "@/features/home/components/home-floating-quote";
import { HomeNav } from "@/features/home/components/home-nav";
import { HomeProjects } from "@/features/home/components/home-projects";
import { BarandalesQualitySection } from "@/features/services/barandales/barandales-quality-section";
import { BarandalesTypesSection } from "@/features/services/barandales/barandales-types-section";
import { BarandalesUseCasesSection } from "@/features/services/barandales/barandales-use-cases-section";
import { ServiceHero } from "@/features/services/components/service-hero";
import {
  fachadasMobileNavLinks,
  fachadasNavLinks,
  fachadasPageContent,
  fachadasScrollSpyLinks,
  fachadasSecondaryNavLinks,
} from "./fachadas-page.data";
import styles from "@/features/services/barandales/barandales-page.module.css";

export function FachadasPage() {
  return (
    <main className={styles.page}>
      <HomeNav
        defaultActiveHref="/#servicios"
        logoHref="/"
        mobileMenuLinks={fachadasMobileNavLinks}
        primaryLinks={fachadasNavLinks}
        secondaryLinks={fachadasSecondaryNavLinks}
        scrollLinks={fachadasScrollSpyLinks}
      />

      <ServiceHero
        actions={[
          {
            label: fachadasPageContent.cta.label,
            type: "quote",
          },
          {
            href: "#tipos",
            label: "Ver sistema",
            type: "link",
          },
        ]}
        accentTitle={fachadasPageContent.accentTitle}
        description={fachadasPageContent.description}
        eyebrow={fachadasPageContent.eyebrow}
        image={fachadasPageContent.image}
        stats={fachadasPageContent.heroUseCases}
        title={fachadasPageContent.title}
      />

      <BarandalesUseCasesSection
        content={fachadasPageContent}
        heading={{
          title: "Dónde queda mejor una",
          accent: "fachada de cristal",
          description:
            "Pensamos cada solución según la luz, la vista, la escala del frente y el uso real del proyecto.",
        }}
      />
      <BarandalesQualitySection content={fachadasPageContent} />

      <BarandalesTypesSection content={fachadasPageContent} railLabel="Tipos de fachada" />

      <HomeProjects />
      <HomeContact />
      <HomeFloatingQuote />
    </main>
  );
}
