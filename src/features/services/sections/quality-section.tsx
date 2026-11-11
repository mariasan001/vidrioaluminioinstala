"use client";

import { useState } from "react";
import Image from "next/image";
import {
  HiOutlineArrowsUpDown,
  HiOutlineCheckBadge,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineSwatch,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { SectionHeading } from "@/features/conversion/section-heading";
import { useSectionReveal } from "@/hooks/use-section-reveal";
import styles from "./service-page.module.css";

const qualityIcons = {
  check: HiOutlineCheckBadge,
  height: HiOutlineArrowsUpDown,
  shield: HiOutlineShieldCheck,
  sparkles: HiOutlineSparkles,
  swatch: HiOutlineSwatch,
  wrench: HiOutlineWrenchScrewdriver,
} as const;

type QualityContent = {
  quality: {
    eyebrow: string;
    title: string;
    accentTitle: string;
    description: string;
    image: {
      src: string;
      alt: string;
    };
    points: readonly {
      title: string;
      icon: keyof typeof qualityIcons;
      description: string;
    }[];
  };
};

type QualitySectionProps = {
  content: QualityContent;
  layout?: "orbit" | "columns";
  unifiedHeadings?: boolean;
};

function QualityPoint({
  point,
}: {
  point: QualityContent["quality"]["points"][number];
}) {
  const Icon = qualityIcons[point.icon];

  return (
    <article className={styles.qualityPoint}>
      <span className={styles.qualityIcon} aria-hidden="true">
        <Icon />
      </span>
      <div>
        <h3>{point.title}</h3>
        {point.description ? <p>{point.description}</p> : null}
      </div>
    </article>
  );
}

export function QualitySection({
  content,
  layout = "orbit",
  unifiedHeadings = false,
}: QualitySectionProps) {
  const { isVisible, scrollDirection, sectionRef } = useSectionReveal();
  const [activePointIndex, setActivePointIndex] = useState(0);
  const activePoint = content.quality.points[activePointIndex] ?? content.quality.points[0];
  const ActivePointIcon = activePoint ? qualityIcons[activePoint.icon] : null;
  const columns = layout === "columns";
  const leftPoints = content.quality.points.slice(0, 2);
  const rightPoints = content.quality.points.slice(2, 4);

  return (
    <section
      ref={sectionRef}
      id="calidad"
      data-section="ventajas"
      className={`${styles.qualitySection} ${columns ? styles.qualitySplit : ""}`}
      data-visible={isVisible}
      data-scroll-direction={scrollDirection}
      aria-labelledby="service-quality-title"
    >
      {unifiedHeadings ? null : (
        <p className={styles.eyebrow}>
          <span aria-hidden="true" />
          {content.quality.eyebrow}
        </p>
      )}

      <div className={styles.qualityHeader}>
        {unifiedHeadings ? (
          <SectionHeading
            accent={content.quality.accentTitle}
            description={content.quality.description}
            title={content.quality.title}
            titleId="service-quality-title"
          />
        ) : (
          <>
            <h2 id="service-quality-title">
              {content.quality.title}
              <span className={styles.sectionAccent}>{content.quality.accentTitle}</span>
            </h2>
            <p>{content.quality.description}</p>
          </>
        )}
      </div>

      <div className={styles.qualityDiagram}>
        {columns ? (
          <div className={styles.qualityColumn}>
            {leftPoints.map((point) => (
              <QualityPoint key={point.title} point={point} />
            ))}
          </div>
        ) : null}

        <div className={styles.qualityImageStage}>
          <Image
            src={content.quality.image.src}
            alt={content.quality.image.alt}
            fill
            sizes={columns ? "(max-width: 900px) 70vw, 460px" : "(max-width: 900px) 86vw, 34vw"}
            className={styles.qualityImage}
          />

          {columns ? null : (
            <div className={styles.qualityMobileMap} aria-label="Puntos de calidad">
              {content.quality.points.map((point, index) => {
                const MarkerIcon = qualityIcons[point.icon];

                return (
                  <button
                    key={point.title}
                    type="button"
                    className={styles.qualityMarker}
                    data-active={activePointIndex === index}
                    aria-label={point.title}
                    aria-pressed={activePointIndex === index}
                    onClick={() => setActivePointIndex(index)}
                  >
                    <span className={styles.qualityMarkerIcon} aria-hidden="true">
                      <MarkerIcon />
                    </span>
                    <span className={styles.qualityMarkerNumber} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {columns ? (
          <div className={styles.qualityColumn}>
            {rightPoints.map((point) => (
              <QualityPoint key={point.title} point={point} />
            ))}
          </div>
        ) : (
          <div className={styles.qualityPoints}>
            {content.quality.points.map((point) => (
              <QualityPoint key={point.title} point={point} />
            ))}
          </div>
        )}

        {columns || !activePoint || !ActivePointIcon ? null : (
          <article className={styles.qualityMobilePanel}>
            <div className={styles.qualityMobilePanelMeta}>
              <span className={styles.qualityMobilePanelIcon} aria-hidden="true">
                <ActivePointIcon />
              </span>
              <span className={styles.qualityMobilePanelNumber} aria-hidden="true">
                {String(activePointIndex + 1).padStart(2, "0")}
              </span>
            </div>
            <h3>{activePoint.title}</h3>
            <p>{activePoint.description}</p>
          </article>
        )}
      </div>
    </section>
  );
}
