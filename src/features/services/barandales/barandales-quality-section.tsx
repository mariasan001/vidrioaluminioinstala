"use client";

import Image from "next/image";
import {
  HiOutlineArrowsUpDown,
  HiOutlineCheckBadge,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineSwatch,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { useSectionReveal } from "@/features/home/hooks/use-section-reveal";
import { barandalesPageContent } from "./barandales-page.data";
import styles from "./barandales-page.module.css";

const qualityIcons = {
  check: HiOutlineCheckBadge,
  height: HiOutlineArrowsUpDown,
  shield: HiOutlineShieldCheck,
  sparkles: HiOutlineSparkles,
  swatch: HiOutlineSwatch,
  wrench: HiOutlineWrenchScrewdriver,
} as const;

export function BarandalesQualitySection() {
  const { isVisible, scrollDirection, sectionRef } = useSectionReveal();

  return (
    <section
      ref={sectionRef}
      id="calidad"
      className={styles.qualitySection}
      data-visible={isVisible}
      data-scroll-direction={scrollDirection}
      aria-labelledby="barandales-quality-title"
    >
      <p className={styles.eyebrow}>
        <span aria-hidden="true" />
        {barandalesPageContent.quality.eyebrow}
      </p>

      <div className={styles.qualityHeader}>
        <h2 id="barandales-quality-title">
          {barandalesPageContent.quality.title}
          <span className={styles.sectionAccent}>
            {barandalesPageContent.quality.accentTitle}
          </span>
        </h2>
        <p>{barandalesPageContent.quality.description}</p>
      </div>

      <div className={styles.qualityDiagram}>
        <div className={styles.qualityImageStage}>
          <Image
            src={barandalesPageContent.quality.image.src}
            alt={barandalesPageContent.quality.image.alt}
            fill
            sizes="(max-width: 900px) 86vw, 34vw"
            className={styles.qualityImage}
          />
        </div>

        <div className={styles.qualityPoints}>
          {barandalesPageContent.quality.points.map((point) => {
            const Icon = qualityIcons[point.icon];

            return (
              <article className={styles.qualityPoint} key={point.title}>
                <span className={styles.qualityIcon} aria-hidden="true">
                  <Icon />
                </span>
                <div>
                  <h3>{point.title}</h3>
                  <p>{point.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
