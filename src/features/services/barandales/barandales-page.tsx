"use client";

import { useState } from "react";
import Image from "next/image";
import { MdBalcony, MdDeck, MdStairs } from "react-icons/md";
import {
  HiOutlineArrowsUpDown,
  HiOutlineCubeTransparent,
  HiOutlineCheckBadge,
  HiOutlineCog6Tooth,
  HiOutlineRectangleGroup,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineSwatch,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { HomeFloatingQuote } from "@/features/home/components/home-floating-quote";
import { HomeNav } from "@/features/home/components/home-nav";
import { ServiceHero } from "@/features/services/components/service-hero";
import {
  barandalesMobileNavLinks,
  barandalesNavLinks,
  barandalesPageContent,
  barandalesScrollSpyLinks,
  barandalesSecondaryNavLinks,
} from "./barandales-page.data";
import styles from "./barandales-page.module.css";

const detailIcons = {
  balcony: MdBalcony,
  deck: MdDeck,
  stairs: MdStairs,
} as const;

const qualityIcons = {
  check: HiOutlineCheckBadge,
  height: HiOutlineArrowsUpDown,
  shield: HiOutlineShieldCheck,
  sparkles: HiOutlineSparkles,
  swatch: HiOutlineSwatch,
  wrench: HiOutlineWrenchScrewdriver,
} as const;

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

export function BarandalesPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
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

  return (
    <main className={styles.page}>
      <HomeNav
        defaultActiveHref="/#servicios"
        logoHref="/"
        mobileMenuLinks={barandalesMobileNavLinks}
        onQuoteOpen={() => setIsQuoteOpen(true)}
        primaryLinks={barandalesNavLinks}
        secondaryLinks={barandalesSecondaryNavLinks}
        scrollLinks={barandalesScrollSpyLinks}
      />

      <ServiceHero
        actions={[
          {
            label: barandalesPageContent.cta.label,
            onClick: () => setIsQuoteOpen(true),
            type: "button",
          },
          {
            href: "#proyectos",
            label: "Ver opciones",
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

      <section
        id="proyectos"
        className={styles.useCasesSection}
        aria-labelledby="barandales-use-cases-title"
      >
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            Usos principales
          </p>
          <h2 id="barandales-use-cases-title">
            Dónde queda mejor un{" "}
            <span className={styles.sectionAccent}>barandal</span>
          </h2>
          <p>
            Pensamos cada solución según el recorrido, la altura, la vista y el
            uso real del espacio.
          </p>
        </div>

        <div className={styles.detailGrid}>
          {barandalesPageContent.details.map((detail) => (
            <article className={styles.detailCard} key={detail.title}>
              <div className={styles.detailMeta}>
                <span className={styles.detailIcon} aria-hidden="true">
                  {(() => {
                    const Icon = detailIcons[detail.icon];
                    return <Icon />;
                  })()}
                </span>
                <span className={styles.detailNumber} aria-hidden="true">
                  0{barandalesPageContent.details.indexOf(detail) + 1}
                </span>
              </div>
              <h3>{detail.title}</h3>
              <p>{detail.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="calidad"
        className={styles.qualitySection}
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

            <div className={styles.typeChips} aria-label="Características principales">
              {[...activeType.features, ...activeType.benefits]
                .slice(0, 3)
                .map((item) => (
                <span key={item}>
                  <HiOutlineCheckBadge aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>

            <button
              className={styles.typeCta}
              type="button"
              onClick={() => setIsQuoteOpen(true)}
            >
              Cotizar este tipo
            </button>

          </div>
        </article>
      </section>

      <HomeFloatingQuote
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        onOpen={() => setIsQuoteOpen(true)}
      />
    </main>
  );
}
