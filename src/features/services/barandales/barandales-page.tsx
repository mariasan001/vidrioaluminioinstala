import Image from "next/image";
import { MdBalcony, MdDeck, MdStairs } from "react-icons/md";
import {
  HiOutlineArrowsUpDown,
  HiOutlineCheckBadge,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineSwatch,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { HomeContact } from "@/features/home/components/home-contact";
import { HomeFloatingQuote } from "@/features/home/components/home-floating-quote";
import { HomeNav } from "@/features/home/components/home-nav";
import { HomeProjects } from "@/features/home/components/home-projects";
import { ServiceHero } from "@/features/services/components/service-hero";
import {
  barandalesMobileNavLinks,
  barandalesNavLinks,
  barandalesPageContent,
  barandalesScrollSpyLinks,
  barandalesSecondaryNavLinks,
} from "./barandales-page.data";
import { BarandalesTypesSection } from "./barandales-types-section";
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

export function BarandalesPage() {
  return (
    <main className={styles.page}>
      <HomeNav
        defaultActiveHref="/#servicios"
        logoHref="/"
        mobileMenuLinks={barandalesMobileNavLinks}
        primaryLinks={barandalesNavLinks}
        secondaryLinks={barandalesSecondaryNavLinks}
        scrollLinks={barandalesScrollSpyLinks}
      />

      <ServiceHero
        actions={[
          {
            label: barandalesPageContent.cta.label,
            type: "quote",
          },
          {
            href: "#tipos",
            label: "Ver sistemas",
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
        id="aplicaciones"
        className={styles.useCasesSection}
        aria-labelledby="barandales-use-cases-title"
      >
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            Usos principales
          </p>
          <h2 id="barandales-use-cases-title">
            D\u00f3nde queda mejor un{" "}
            <span className={styles.sectionAccent}>barandal</span>
          </h2>
          <p>
            Pensamos cada soluci\u00f3n seg\u00fan el recorrido, la altura, la vista y el
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

      <BarandalesTypesSection />

      <HomeProjects />
      <HomeContact />
      <HomeFloatingQuote />
    </main>
  );
}
