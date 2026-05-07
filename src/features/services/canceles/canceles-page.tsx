import { HomeContact } from "@/features/home/components/home-contact";
import { HomeFloatingQuote } from "@/features/home/components/home-floating-quote";
import { HomeNav } from "@/features/home/components/home-nav";
import { HomeProjects } from "@/features/home/components/home-projects";
import { BarandalesQualitySection } from "@/features/services/barandales/barandales-quality-section";
import { BarandalesTypesSection } from "@/features/services/barandales/barandales-types-section";
import { BarandalesUseCasesSection } from "@/features/services/barandales/barandales-use-cases-section";
import { ServiceHero } from "@/features/services/components/service-hero";
import {
  cancelesMobileNavLinks,
  cancelesNavLinks,
  cancelesPageContent,
  cancelesScrollSpyLinks,
  cancelesSecondaryNavLinks,
} from "./canceles-page.data";
import styles from "@/features/services/barandales/barandales-page.module.css";

export function CancelesPage() {
  return (
    <main className={styles.page}>
      <HomeNav
        defaultActiveHref="/#servicios"
        logoHref="/"
        mobileMenuLinks={cancelesMobileNavLinks}
        primaryLinks={cancelesNavLinks}
        quoteService="Canceles de baño"
        quoteWhatsappHref={cancelesPageContent.cta.href}
        secondaryLinks={cancelesSecondaryNavLinks}
        scrollLinks={cancelesScrollSpyLinks}
      />

      <ServiceHero
        actions={[
          {
            label: cancelesPageContent.cta.label,
            service: "Canceles de baño",
            whatsappHref: cancelesPageContent.cta.href,
            type: "quote",
          },
          {
            href: "#tipos",
            label: "Ver tipos",
            type: "link",
          },
        ]}
        accentTitle={cancelesPageContent.accentTitle}
        description={cancelesPageContent.description}
        eyebrow={cancelesPageContent.eyebrow}
        image={cancelesPageContent.image}
        stats={cancelesPageContent.heroUseCases}
        title={cancelesPageContent.title}
      />

      <BarandalesUseCasesSection
        content={cancelesPageContent}
        heading={{
          title: "Dónde funciona mejor un",
          accent: "cancel de baño",
          description:
            "Pensamos cada solución según las medidas del baño, la forma de apertura, la zona de regadera y el uso real del espacio.",
        }}
      />
      <BarandalesQualitySection content={cancelesPageContent} />

      <BarandalesTypesSection
        content={cancelesPageContent}
        quoteService="Canceles de baño"
        quoteWhatsappHref={cancelesPageContent.cta.href}
        railLabel="Tipos de cancel de baño"
      />

      <HomeProjects />
      <HomeContact />
      <HomeFloatingQuote
        defaultService="Canceles de baño"
        whatsappHref={cancelesPageContent.cta.href}
      />
    </main>
  );
}
