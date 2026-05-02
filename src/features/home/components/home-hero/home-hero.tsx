"use client";

import Image from "next/image";
import { FaLocationDot } from "react-icons/fa6";
import styles from "./home-hero.module.css";
import { heroContent } from "./home-hero.data";
import { useHeroReveal } from "./use-hero-reveal";

type HomeHeroProps = {
  onQuoteOpen: () => void;
};

export function HomeHero({ onQuoteOpen }: HomeHeroProps) {
  const { hasRevealed, introDone, isInView, sectionRef } = useHeroReveal();

  return (
    <section
      ref={sectionRef}
      className={`${styles.hero} ${hasRevealed ? styles.heroVisible : ""} ${introDone ? styles.heroReady : ""} ${isInView ? styles.heroInView : styles.heroOutView}`}
      id="inicio"
    >
      <Image
        src={heroContent.image.src}
        alt={heroContent.image.alt}
        fill
        priority
        className={`${styles.backgroundImage} ${styles.desktopImage}`}
        sizes="100vw"
      />

      <Image
        src={heroContent.image.mobileSrc}
        alt={heroContent.image.alt}
        fill
        priority
        className={`${styles.backgroundImage} ${styles.mobileImage}`}
        sizes="100vw"
      />

      <div className={styles.heroShade} />

      <p className={styles.eyebrow}>
        <FaLocationDot aria-hidden="true" className={styles.eyebrowIcon} />
        <span>{heroContent.eyebrow}</span>
      </p>

      <div className={styles.heroLead}>
        <h1 className={styles.title}>
          {heroContent.title}
          <span className={styles.accent}>{heroContent.accentTitle}</span>
        </h1>

        <div className={styles.content}>
          <p className={styles.description}>{heroContent.description}</p>

          <div className={styles.actions}>
            {heroContent.actions.map((action) => (
              action.action === "quote" ? (
                <button
                  className={styles.primaryAction}
                  key={action.label}
                  type="button"
                  onClick={onQuoteOpen}
                >
                  {action.label}
                </button>
              ) : (
                <a
                  className={styles.secondaryAction}
                  href={action.href}
                  key={action.label}
                >
                  {action.label}
                </a>
              )
            ))}
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        {heroContent.stats.map((stat) => (
          <div key={stat} className={styles.stat}>
            <p className={styles.statLabel}>
              <span className={styles.statDot} aria-hidden="true" />
              <span>{stat}</span>
            </p>
            <span className={styles.statLine} />
          </div>
        ))}
      </div>
    </section>
  );
}
