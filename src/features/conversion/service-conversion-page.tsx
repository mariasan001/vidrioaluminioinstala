import { HomeNav } from "@/features/home/components/home-nav";
import { HomeProjects } from "@/features/home/components/home-projects";
import { projectsContent } from "@/features/home/components/home-projects/home-projects.data";
import type { NavItem } from "@/features/home/components/home-nav/home-nav.data";
import { BarandalesQualitySection } from "@/features/services/barandales/barandales-quality-section";
import { BarandalesTypesSection } from "@/features/services/barandales/barandales-types-section";
import { CancelesTypesSection } from "@/features/services/canceles/canceles-types-section";
import { BarandalesUseCasesSection } from "@/features/services/barandales/barandales-use-cases-section";
import styles from "@/features/services/barandales/barandales-page.module.css";
import { ContactBar } from "./contact-bar";
import conversionStyles from "./conversion.module.css";
import { ConversionHero } from "./conversion-hero";
import type { Servicio } from "./contact-info";
import { ServiceContact } from "./service-contact";
import { ServiceFaq, type FaqItem } from "./service-faq";
import { ServiceGallery } from "./service-gallery";
import { TrustBlock } from "./trust-block";

type ServiceConversionPageProps = {
  servicio: Servicio;
  quoteService: string;
  whatsappHref: string;
  hero: {
    eyebrow: string;
    title: string;
    titleMain?: string;
    titleAccent?: string;
    description: string;
    fullScreen?: boolean;
    chips?: readonly string[];
    image: {
      src: string;
      mobileSrc: string;
      alt: string;
      width: number;
      height: number;
    };
  };
  content: {
    details: readonly {
      title: string;
      icon: "stairs" | "balcony" | "deck" | "shower" | "sliding" | "gem";
      description: string;
    }[];
    quality: {
      eyebrow: string;
      title: string;
      accentTitle: string;
      description: string;
      image: { src: string; alt: string };
      points: readonly {
        title: string;
        icon: "shield" | "height" | "sparkles" | "wrench" | "swatch" | "check";
        description: string;
        pending?: string;
      }[];
    };
    types: {
      eyebrow: string;
      title: string;
      accentTitle: string;
      description: string;
      photoMessage?: string;
      trackLabel?: string;
      titleId?: string;
      items: readonly {
        id: string;
        label: string;
        title: string;
        icon: "profile" | "post" | "button" | "steel" | "curve" | "mesh";
        image: { src: string; alt: string };
        description: string;
        features: readonly string[];
        benefits: readonly string[];
        useCase: string;
        recommendation: string;
        vibe: string;
        ideal?: string;
        detail?: string;
        message?: string;
        pendingNote?: string;
        focus?: string;
        metrics: { openness: number; structure: number; privacy: number };
      }[];
    };
  };
  useCasesHeading: {
    title: string;
    accent: string;
    description: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    accent?: string;
    description: string;
    items: readonly FaqItem[];
    pending?: string;
  };
  contact: {
    title: string;
    accent?: string;
    description: string;
    whatsappNote?: string;
    callbackSubject?: string;
  };
  gallery: {
    title: string;
    accent?: string;
    description: string;
    match: (category: string) => boolean;
  };
  navLinks: readonly NavItem[];
  secondaryNavLinks: readonly NavItem[];
  mobileNavLinks: readonly NavItem[];
  scrollSpyLinks: readonly NavItem[];
  compactNav?: boolean;
  revealSticky?: boolean;
  useCasesLink?: boolean;
  qualityColumns?: boolean;
};

export function ServiceConversionPage({
  servicio,
  quoteService,
  whatsappHref,
  hero,
  content,
  useCasesHeading,
  faq,
  contact,
  gallery,
  navLinks,
  secondaryNavLinks,
  mobileNavLinks,
  scrollSpyLinks,
  compactNav = false,
  revealSticky = false,
  useCasesLink = false,
  qualityColumns = false,
}: ServiceConversionPageProps) {
  return (
    <main
      className={`${styles.page} ${hero.fullScreen ? conversionStyles.pageScreen : ""} ${qualityColumns ? conversionStyles.tonePage : ""}`}
      data-tone={qualityColumns ? "conversion" : undefined}
      data-servicio={servicio}
    >
      <HomeNav
        compact={compactNav}
        defaultActiveHref="/#servicios"
        logoHref="/"
        mobileMenuLinks={mobileNavLinks}
        primaryLinks={navLinks}
        quoteHref="#contacto"
        quoteLabel="Cotizar"
        quoteService={quoteService}
        quoteWhatsappHref={whatsappHref}
        secondaryLinks={secondaryNavLinks}
        scrollLinks={scrollSpyLinks}
      />
      <ConversionHero
        chips={hero.chips}
        description={hero.description}
        eyebrow={hero.eyebrow}
        fullScreen={hero.fullScreen}
        image={hero.image}
        servicio={servicio}
        title={hero.title}
        titleAccent={hero.titleAccent}
        titleMain={hero.titleMain}
        whatsappHref={whatsappHref}
      />
      <BarandalesUseCasesSection
        content={content}
        heading={useCasesHeading}
        unifiedHeadings={qualityColumns}
        whatsappHref={useCasesLink ? whatsappHref : undefined}
      />
      <BarandalesQualitySection
        content={content}
        layout={qualityColumns ? "columns" : "orbit"}
        unifiedHeadings={qualityColumns}
      />
      {qualityColumns ? (
        <CancelesTypesSection
          accent={content.types.accentTitle}
          description={content.types.description}
          items={content.types.items}
          photoMessage={content.types.photoMessage}
          title={content.types.title}
          titleId={content.types.titleId}
          trackLabel={content.types.trackLabel}
          whatsappHref={whatsappHref}
        />
      ) : (
        <BarandalesTypesSection
          content={content}
          ctaMode="whatsapp"
          quoteService={quoteService}
          quoteWhatsappHref={whatsappHref}
          railLabel={servicio === "ventanas" ? "Tipos de ventana" : "Tipos de cancel"}
        />
      )}
      <TrustBlock servicio={servicio} unifiedHeadings={qualityColumns} />
      {qualityColumns ? (
        <HomeProjects
          moreHref="/#proyectos"
          prioridad={servicio}
          sectionId="proyectos"
          content={{
            eyebrow: "",
            title: gallery.title,
            accentTitle: gallery.accent ?? "",
            description: gallery.description,
            items: projectsContent.items,
          }}
        />
      ) : (
        <ServiceGallery
          accent={gallery.accent}
          description={gallery.description}
          match={gallery.match}
          servicio={servicio}
          title={gallery.title}
          unifiedHeadings={qualityColumns}
        />
      )}
      <ServiceFaq
        accent={faq.accent}
        description={faq.description}
        eyebrow={faq.eyebrow}
        items={faq.items}
        pending={faq.pending}
        servicio={servicio}
        title={faq.title}
        unifiedHeadings={qualityColumns}
      />
      <ServiceContact
        accent={contact.accent}
        description={contact.description}
        servicio={servicio}
        title={contact.title}
        unifiedHeadings={qualityColumns}
        callbackSubject={contact.callbackSubject}
        whatsappHref={whatsappHref}
        whatsappNote={contact.whatsappNote}
      />
      <ContactBar
        revealOnScroll={revealSticky}
        servicio={servicio}
        whatsappHref={whatsappHref}
      />
    </main>
  );
}
