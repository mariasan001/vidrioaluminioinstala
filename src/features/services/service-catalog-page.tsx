import type { ComponentProps } from "react";
import { SiteContact } from "@/components/site/contact";
import { SiteFloatingQuote } from "@/components/site/floating-quote";
import { SiteNav } from "@/components/site/nav";
import type { NavItem } from "@/components/site/nav/site-nav.data";
import { SiteProjects } from "@/components/site/projects";
import { ServiceHero } from "@/features/services/components/service-hero";
import { QualitySection, TypesSection, UseCasesSection } from "./sections";
import styles from "./sections/service-page.module.css";

type CatalogContent = ComponentProps<typeof UseCasesSection>["content"] &
  ComponentProps<typeof QualitySection>["content"] &
  ComponentProps<typeof TypesSection>["content"] & {
    accentTitle: string;
    cta: { label: string; href: string };
    description: string;
    eyebrow: string;
    heroUseCases: readonly string[];
    image: { alt: string; mobileSrc?: string; src: string };
    title: string;
  };

export type ServiceCatalogPageProps = {
  content: CatalogContent;
  /** Nombre del servicio usado en cotizaciones (nav, hero, formulario flotante). */
  quoteService: string;
  /** Texto del enlace secundario del hero hacia #tipos. */
  heroLinkLabel?: string;
  /** Encabezado de la sección de usos. */
  useCasesHeading: ComponentProps<typeof UseCasesSection>["heading"];
  /** Etiqueta accesible del selector de tipos. */
  typesRailLabel: string;
  navLinks: readonly NavItem[];
  secondaryNavLinks: readonly NavItem[];
  mobileNavLinks: readonly NavItem[];
  scrollSpyLinks: readonly NavItem[];
};

export function ServiceCatalogPage({
  content,
  quoteService,
  heroLinkLabel = "Ver sistemas",
  useCasesHeading,
  typesRailLabel,
  navLinks,
  secondaryNavLinks,
  mobileNavLinks,
  scrollSpyLinks,
}: ServiceCatalogPageProps) {
  return (
    <main className={styles.page}>
      <SiteNav
        defaultActiveHref="/#servicios"
        logoHref="/"
        mobileMenuLinks={mobileNavLinks}
        primaryLinks={navLinks}
        quoteService={quoteService}
        quoteWhatsappHref={content.cta.href}
        secondaryLinks={secondaryNavLinks}
        scrollLinks={scrollSpyLinks}
      />

      <ServiceHero
        actions={[
          {
            label: content.cta.label,
            service: quoteService,
            whatsappHref: content.cta.href,
            type: "quote",
          },
          {
            href: "#tipos",
            label: heroLinkLabel,
            type: "link",
          },
        ]}
        accentTitle={content.accentTitle}
        description={content.description}
        eyebrow={content.eyebrow}
        image={content.image}
        stats={content.heroUseCases}
        title={content.title}
      />

      <UseCasesSection content={content} heading={useCasesHeading} />
      <QualitySection content={content} />

      <TypesSection
        content={content}
        quoteService={quoteService}
        quoteWhatsappHref={content.cta.href}
        railLabel={typesRailLabel}
      />

      <SiteProjects />
      <SiteContact />
      <SiteFloatingQuote
        defaultService={quoteService}
        whatsappHref={content.cta.href}
      />
    </main>
  );
}
