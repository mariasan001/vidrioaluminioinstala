"use client";

import Image from "next/image";
import { useSectionReveal } from "../../hooks/use-section-reveal";
import styles from "./home-materials.module.css";
import { materialsContent } from "./home-materials.data";

export function HomeMaterials() {
  const { isVisible, scrollDirection, sectionRef } = useSectionReveal();

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-visible={isVisible}
      data-scroll-direction={scrollDirection}
      id="calidad"
      aria-labelledby="home-materials-title"
    >
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          <span>{materialsContent.eyebrow}</span>
        </div>

        <div className={styles.heading}>
          <h2 id="home-materials-title" className={styles.title}>
            {materialsContent.title}
            <span className={styles.accent}>{materialsContent.accentTitle}</span>
          </h2>
          <p className={styles.description}>{materialsContent.description}</p>
        </div>
      </div>

      <div className={styles.diagram}>
        <div className={styles.imageStage}>
          <div className={`${styles.materialImageCard} ${styles.materialImagePrimary}`}>
            <Image
              src={materialsContent.images.primary.src}
              alt={materialsContent.images.primary.alt}
              fill
              loading="eager"
              sizes="(max-width: 820px) 72vw, 28vw"
              className={styles.image}
            />
          </div>
          <div className={`${styles.materialImageCard} ${styles.materialImageTop}`}>
            <Image
              src={materialsContent.images.top.src}
              alt={materialsContent.images.top.alt}
              fill
              loading="eager"
              sizes="(max-width: 820px) 38vw, 16vw"
              className={styles.image}
            />
          </div>
          <div className={`${styles.materialImageCard} ${styles.materialImageBottom}`}>
            <Image
              src={materialsContent.images.bottom.src}
              alt={materialsContent.images.bottom.alt}
              fill
              loading="eager"
              sizes="(max-width: 820px) 42vw, 18vw"
              className={styles.image}
            />
          </div>
          <div className={styles.materialBadge}>
            <strong>{materialsContent.badge.title}</strong>
            <span>{materialsContent.badge.description}</span>
          </div>
          <span className={`${styles.pin} ${styles.pinTop}`} aria-hidden="true" />
          <span className={`${styles.pin} ${styles.pinRight}`} aria-hidden="true" />
          <span className={`${styles.pin} ${styles.pinBottom}`} aria-hidden="true" />
        </div>

        {materialsContent.points.map((point) => (
          <article
            className={`${styles.point} ${styles[point.position]}`}
            key={point.title}
          >
            <span className={styles.pointLine} aria-hidden="true" />
            <div>
              <h3>{point.title}</h3>
              <p>{point.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
