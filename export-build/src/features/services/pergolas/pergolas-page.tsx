import { HomeContact } from "@/features/home/components/home-contact";
import { HomeFloatingQuote } from "@/features/home/components/home-floating-quote";
import { HomeNav } from "@/features/home/components/home-nav";
import { HomeProjects } from "@/features/home/components/home-projects";
import { BarandalesQualitySection } from "@/features/services/barandales/barandales-quality-section";
import { BarandalesTypesSection } from "@/features/services/barandales/barandales-types-section";
import { BarandalesUseCasesSection } from "@/features/services/barandales/barandales-use-cases-section";
import { ServiceHero } from "@/features/services/components/service-hero";
import {
  pergolasMobileNavLinks,
  pergolasNavLinks,
  pergolasPageContent,
  pergolasScrollSpyLinks,
  pergolasSecondaryNavLinks,
} from "./pergolas-page.data";
import styles from "@/features/services/barandales/barandales-page.module.css";

export function PergolasPage() {
  return (
    <main className={styles.page}>
      <HomeNav
        defaultActiveHref="/#servicios"
        logoHref="/"
        mobileMenuLinks={pergolasMobileNavLinks}
        primaryLinks={pergolasNavLinks}
        quoteService="Pérgolas"
        quoteWhatsappHref={pergolasPageContent.cta.href}
        secondaryLinks={pergolasSecondaryNavLinks}
        scrollLinks={pergolasScrollSpyLinks}
      />

      <ServiceHero
        actions={[
          {
            label: pergolasPageContent.cta.label,
            service: "Pérgolas",
            whatsappHref: pergolasPageContent.cta.href,
            type: "quote",
          },
          {
            href: "#tipos",
            label: "Ver sistemas",
            type: "link",
          },
        ]}
        accentTitle={pergolasPageContent.accentTitle}
        description={pergolasPageContent.description}
        eyebrow={pergolasPageContent.eyebrow}
        image={pergolasPageContent.image}
        stats={pergolasPageContent.heroUseCases}
        title={pergolasPageContent.title}
      />

      <BarandalesUseCasesSection
        content={pergolasPageContent}
        heading={{
          title: "Dónde queda mejor una",
          accent: "pérgola",
          description:
            "Pensamos cada solución según la sombra, la luz, la orientación y el uso real del espacio exterior.",
        }}
      />
      <BarandalesQualitySection content={pergolasPageContent} />

      <BarandalesTypesSection
        content={pergolasPageContent}
        quoteService="Pérgolas"
        quoteWhatsappHref={pergolasPageContent.cta.href}
        railLabel="Tipos de pérgola"
      />

      <HomeProjects />
      <HomeContact />
      <HomeFloatingQuote
        defaultService="Pérgolas"
        whatsappHref={pergolasPageContent.cta.href}
      />
    </main>
  );
}
