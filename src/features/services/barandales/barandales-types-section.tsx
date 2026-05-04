"use client";

import { type CSSProperties, useState } from "react";
import Image from "next/image";
import {
  HiOutlineArrowsUpDown,
  HiOutlineCheckBadge,
  HiOutlineCog6Tooth,
  HiOutlineCubeTransparent,
  HiOutlineRectangleGroup,
  HiOutlineSparkles,
  HiOutlineSwatch,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { openQuoteDialog } from "@/features/home/components/home-floating-quote/quote-dialog";
import { barandalesPageContent } from "./barandales-page.data";
import styles from "./barandales-page.module.css";

const typeIcons = {
  button: HiOutlineCog6Tooth,
  curve: HiOutlineArrowsUpDown,
  fence: HiOutlineRectangleGroup,
  mesh: HiOutlineCubeTransparent,
  post: HiOutlineWrenchScrewdriver,
  profile: HiOutlineSwatch,
  steel: HiOutlineSparkles,
} as const;

type BarandalTypeId = (typeof barandalesPageContent.types.items)[number]["id"];

function renderRating(value: number) {
  return `${value}/5`;
}

export function BarandalesTypesSection() {
  const [activeTypeId, setActiveTypeId] = useState<BarandalTypeId>(
    barandalesPageContent.types.items[0].id,
  );
  const activeTypeIndex = barandalesPageContent.types.items.findIndex(
    (item) => item.id === activeTypeId,
  );
  const activeType =
    barandalesPageContent.types.items[activeTypeIndex] ??
    barandalesPageContent.types.items[0];
  const ActiveTypeIcon = typeIcons[activeType.icon];
  const typeMetrics = [
    {
      label: "Vista abierta",
      value: activeType.metrics.openness,
    },
    {
      label: "Presencia estructural",
      value: activeType.metrics.structure,
    },
    {
      label: "Privacidad",
      value: activeType.metrics.privacy,
    },
  ];

  return (
    <section
      id="tipos"
      className={styles.typesSection}
      aria-labelledby="barandales-types-title"
    >
      <p className={styles.eyebrow}>
        <span aria-hidden="true" />
        {barandalesPageContent.types.eyebrow}
      </p>

      <div className={styles.typesHeader}>
        <h2 id="barandales-types-title">
          {barandalesPageContent.types.title}
          <span className={styles.sectionAccent}>
            {barandalesPageContent.types.accentTitle}
          </span>
        </h2>
        <p>{barandalesPageContent.types.description}</p>
      </div>

      <div className={styles.typePicker}>
        <p>Elige un tipo</p>
        <div className={styles.typeRail} aria-label="Tipos de barandal">
          {barandalesPageContent.types.items.map((item) => (
            <button
              className={`${styles.typeRailButton} ${
                item.id === activeType.id ? styles.typeRailButtonActive : ""
              }`}
              key={item.id}
              type="button"
              onClick={() => setActiveTypeId(item.id)}
            >
              <span aria-hidden="true">
                0{barandalesPageContent.types.items.indexOf(item) + 1}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <article className={styles.typePanel}>
        <div className={styles.typeMedia}>
          <Image
            src={activeType.image.src}
            alt={activeType.image.alt}
            fill
            sizes="(max-width: 900px) 100vw, 46vw"
            className={styles.typeImage}
          />
        </div>

        <div className={styles.typeContent}>
          <div className={styles.typeIntro}>
            <span className={styles.typeIntroIcon} aria-hidden="true">
              <ActiveTypeIcon />
            </span>
            <div>
              <h3>{activeType.title}</h3>
              <p>{activeType.description}</p>
            </div>
          </div>

          <div className={styles.typeMeta}>
            <div className={styles.typeCallout}>
              <span className={styles.typeCalloutLabel}>Mejor para</span>
              <p>{activeType.useCase}</p>
            </div>

            <div className={styles.typeRatings} aria-label="Comparativa del sistema">
              {typeMetrics.map((metric) => (
                <div key={metric.label} className={styles.typeRating}>
                  <div>
                    <span>{metric.label}</span>
                    <strong>{renderRating(metric.value)}</strong>
                  </div>
                  <i
                    aria-hidden="true"
                    style={
                      {
                        "--rating-fill": `${(metric.value / 5) * 100}%`,
                      } as CSSProperties
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.typeChips} aria-label="Caracter\u00edsticas principales">
            {[...activeType.features, ...activeType.benefits].slice(0, 4).map((item) => (
              <span key={item}>
                <HiOutlineCheckBadge aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>

          <div className={styles.typeRecommendation}>
            <p>{activeType.recommendation}</p>
            <strong>{activeType.vibe}</strong>
          </div>

          <button
            className={styles.typeCta}
            type="button"
            onClick={openQuoteDialog}
          >
            Quiero este para mi proyecto
          </button>
        </div>
      </article>
    </section>
  );
}
