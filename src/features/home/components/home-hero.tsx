"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaLocationDot } from "react-icons/fa6";
import styles from "./home-hero.module.css";
import { heroStats } from "./home-hero.data";

export function HomeHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.28,
      },
    );

    const revealOnRestore = () => {
      setIsVisible(true);
    };

    observer.observe(section);
    window.addEventListener("pageshow", revealOnRestore);

    return () => {
      observer.disconnect();
      window.removeEventListener("pageshow", revealOnRestore);
    };
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        className={`${styles.hero} ${styles.scrollDown} ${isVisible ? styles.heroVisible : ""}`}
        id="inicio"
      >
        <Image
          src="/img/hero_img.png"
          alt="Proyecto destacado de aluminio y vidrio"
          fill
          priority
          className={styles.backgroundImage}
        />

        <div className={styles.heroShade} />

        <p className={styles.eyebrow}>
          <FaLocationDot aria-hidden="true" className={styles.eyebrowIcon} />
          <span>instalacion y fabricacion a medida en Toluca y alrededores</span>
        </p>

        <div className={styles.heroLead}>
          <h1 className={styles.title}>
            Haz que tu espacio
            <span className={styles.accent}>se vea como siempre lo imaginaste</span>
          </h1>

          <div className={styles.content}>
            <p className={styles.description}>
              Disenamos, fabricamos e instalamos canceleria, fachadas, puertas,
              ventanas y soluciones especiales que combinan estetica, seguridad
              y durabilidad para hogar y negocio.
            </p>

            <div className={styles.actions}>
              <a className={styles.primaryAction} href="#cotizacion">
                Solicitar proyecto y cotizacion
              </a>
              <a className={styles.secondaryAction} href="#proyectos">
                Ver proyectos destacados
              </a>
            </div>
          </div>
        </div>

        <div className={styles.stats}>
          {heroStats.map((stat) => (
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
    </>
  );
}
