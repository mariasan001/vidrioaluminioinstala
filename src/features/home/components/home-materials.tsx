"use client";

import Image from "next/image";
import { useSectionReveal } from "../hooks/use-section-reveal";
import styles from "./home-materials.module.css";
import { materialPoints } from "./home-materials.data";

export function HomeMaterials() {
  const { isVisible, scrollDirection, sectionRef } = useSectionReveal();

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-visible={isVisible}
      data-scroll-direction={scrollDirection}
      aria-labelledby="home-materials-title"
    >
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          <span>soluciones pensadas para durar</span>
        </div>

        <div className={styles.heading}>
          <h2 id="home-materials-title" className={styles.title}>
            Hecho para verse bien
            <span className={styles.accent}>y durar en el uso diario</span>
          </h2>
          <p className={styles.description}>
            Cada trabajo se fabrica e instala segun el uso real del espacio:
            acceso, luz, proteccion, privacidad y presencia visual. La meta es
            que se vea bien al entregarse y siga funcionando con el paso del
            tiempo.
          </p>
        </div>
      </div>

      <div className={styles.diagram}>
        <div className={styles.imageStage}>
          <div className={`${styles.materialImageCard} ${styles.materialImagePrimary}`}>
            <Image
              src="/img/img_ventana.png"
              alt="Ventanas de aluminio y vidrio"
              fill
              sizes="(max-width: 820px) 72vw, 28vw"
              className={styles.image}
            />
          </div>
          <div className={`${styles.materialImageCard} ${styles.materialImageTop}`}>
            <Image
              src="/img/img_bano.png"
              alt="Cancel de bano en vidrio"
              fill
              sizes="(max-width: 820px) 38vw, 16vw"
              className={styles.image}
            />
          </div>
          <div className={`${styles.materialImageCard} ${styles.materialImageBottom}`}>
            <Image
              src="/img/img_pergola.png"
              alt="Pergola de aluminio para exterior"
              fill
              sizes="(max-width: 820px) 42vw, 18vw"
              className={styles.image}
            />
          </div>
          <div className={styles.materialBadge}>
            <strong>base comun</strong>
            <span>ventanas, puertas, canceles y exteriores</span>
          </div>
          <span className={`${styles.pin} ${styles.pinTop}`} aria-hidden="true" />
          <span className={`${styles.pin} ${styles.pinRight}`} aria-hidden="true" />
          <span className={`${styles.pin} ${styles.pinBottom}`} aria-hidden="true" />
        </div>

        {materialPoints.map((point) => (
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
