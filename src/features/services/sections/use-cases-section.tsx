"use client";

import {
  HiOutlineArrowsUpDown,
  HiOutlineHomeModern,
  HiOutlineSun,
} from "react-icons/hi2";
import { WhatsAppIcon } from "@/features/conversion/contact-icons";
import { SectionHeading } from "@/features/conversion/section-heading";
import { useSectionReveal } from "@/hooks/use-section-reveal";
import styles from "./service-page.module.css";

function ShowerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2.5v4" />
      <path d="M4 6.5h16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3z" />
      <path d="M7 14.5v2.2" />
      <path d="M12 15.2v3" />
      <path d="M17 14.5v2.2" />
    </svg>
  );
}

function SlidingDoorIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      <path d="M7 12h10" />
      <path d="M9.2 9.2 6.4 12l2.8 2.8" />
      <path d="M14.8 9.2 17.6 12l-2.8 2.8" />
    </svg>
  );
}

function GemIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.5 20 12 12 20.5 4 12 12 3.5z" />
    </svg>
  );
}

const detailIcons = {
  balcony: HiOutlineHomeModern,
  deck: HiOutlineSun,
  stairs: HiOutlineArrowsUpDown,
  shower: ShowerIcon,
  sliding: SlidingDoorIcon,
  gem: GemIcon,
} as const;

type UseCasesContent = {
  details: readonly {
    title: string;
    icon: keyof typeof detailIcons;
    description: string;
  }[];
};

type UseCasesSectionProps = {
  content: UseCasesContent;
  heading: {
    title: string;
    accent: string;
    description: string;
  };
  whatsappHref?: string;
  unifiedHeadings?: boolean;
};

export function UseCasesSection({
  content,
  heading,
  whatsappHref,
  unifiedHeadings = false,
}: UseCasesSectionProps) {
  const { isVisible, scrollDirection, sectionRef } = useSectionReveal();

  return (
    <section
      ref={sectionRef}
      id="aplicaciones"
      data-section="usos"
      className={`${styles.useCasesSection} ${whatsappHref ? styles.useCasesPlain : ""}`}
      data-visible={isVisible}
      data-scroll-direction={scrollDirection}
      aria-labelledby="service-use-cases-title"
    >
      <div className={styles.sectionHeader}>
        {unifiedHeadings ? (
          <SectionHeading
            accent={heading.accent}
            align="start"
            description={heading.description}
            title={heading.title}
            titleId="service-use-cases-title"
          />
        ) : (
          <>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" />
              Usos principales
            </p>
            <h2 id="service-use-cases-title">
              {heading.title} <span className={styles.sectionAccent}>{heading.accent}</span>
            </h2>
            <p>{heading.description}</p>
          </>
        )}
        {whatsappHref ? (
          <a
            className={styles.useCaseLink}
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            data-ubicacion="seccion"
          >
            <WhatsAppIcon />
            Cotiza el tuyo por WhatsApp →
          </a>
        ) : null}
      </div>

      <div className={styles.detailGrid}>
        {content.details.map((detail, index) => (
          <article
            className={styles.detailCard}
            key={detail.title}
            data-card-index={index + 1}
          >
            <div className={styles.detailMeta}>
              <span className={styles.detailIcon} aria-hidden="true">
                {(() => {
                  const Icon = detailIcons[detail.icon];
                  return <Icon />;
                })()}
              </span>
              <span className={styles.detailNumber} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3>{detail.title}</h3>
            <p>{detail.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
