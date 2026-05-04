import { HomeContact } from "@/features/home/components/home-contact";
import { HomeFloatingQuote } from "@/features/home/components/home-floating-quote";
import { HomeNav } from "@/features/home/components/home-nav";
import { HomeProjects } from "@/features/home/components/home-projects";
import { ServiceHero } from "@/features/services/components/service-hero";
import {
  barandalesMobileNavLinks,
  barandalesNavLinks,
  barandalesPageContent,
  barandalesScrollSpyLinks,
  barandalesSecondaryNavLinks,
} from "./barandales-page.data";
import { BarandalesQualitySection } from "./barandales-quality-section";
import { BarandalesTypesSection } from "./barandales-types-section";
import { BarandalesUseCasesSection } from "./barandales-use-cases-section";
import styles from "./barandales-page.module.css";

export function BarandalesPage() {
  return (
    <main className={styles.page}>
      <HomeNav
        defaultActiveHref="/#servicios"
        logoHref="/"
        mobileMenuLinks={barandalesMobileNavLinks}
        primaryLinks={barandalesNavLinks}
        secondaryLinks={barandalesSecondaryNavLinks}
        scrollLinks={barandalesScrollSpyLinks}
      />

      <ServiceHero
        actions={[
          {
            label: barandalesPageContent.cta.label,
            type: "quote",
          },
          {
            href: "#tipos",
            label: "Ver sistemas",
            type: "link",
          },
        ]}
        accentTitle={barandalesPageContent.accentTitle}
        description={barandalesPageContent.description}
        eyebrow={barandalesPageContent.eyebrow}
        image={barandalesPageContent.image}
        stats={barandalesPageContent.heroUseCases}
        title={barandalesPageContent.title}
      />

      <BarandalesUseCasesSection />
      <BarandalesQualitySection />

      <BarandalesTypesSection />

      <HomeProjects />
      <HomeContact />
      <HomeFloatingQuote />
    </main>
  );
}
