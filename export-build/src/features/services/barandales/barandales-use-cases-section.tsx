"use client";

import {
  HiOutlineArrowsUpDown,
  HiOutlineHomeModern,
  HiOutlineSun,
} from "react-icons/hi2";
import { useSectionReveal } from "@/features/home/hooks/use-section-reveal";
import { barandalesPageContent } from "./barandales-page.data";
import styles from "./barandales-page.module.css";

const detailIcons = {
  balcony: HiOutlineHomeModern,
  deck: HiOutlineSun,
  stairs: HiOutlineArrowsUpDown,
} as const;

type UseCasesContent = {
  details: readonly {
    title: string;
    icon: keyof typeof detailIcons;
    description: string;
  }[];
};

type BarandalesUseCasesSectionProps = {
  content?: UseCasesContent;
  heading?: {
    title: string;
    accent: string;
    description: string;
  };
};

export function BarandalesUseCasesSection({
  content = barandalesPageContent,
  heading = {
    title: "Dónde queda mejor un",
    accent: "barandal",
    description:
      "Pensamos cada solución según el recorrido, la altura, la vista y el uso real del espacio.",
  },
}: BarandalesUseCasesSectionProps = {}) {
  const { isVisible, scrollDirection, sectionRef } = useSectionReveal();

  return (
    <section
      ref={sectionRef}
      id="aplicaciones"
      className={styles.useCasesSection}
      data-visible={isVisible}
      data-scroll-direction={scrollDirection}
      aria-labelledby="barandales-use-cases-title"
    >
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>
          <span aria-hidden="true" />
          Usos principales
        </p>
        <h2 id="barandales-use-cases-title">
          {heading.title} <span className={styles.sectionAccent}>{heading.accent}</span>
        </h2>
        <p>{heading.description}</p>
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
