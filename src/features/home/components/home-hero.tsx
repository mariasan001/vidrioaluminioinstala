"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaLocationDot } from "react-icons/fa6";
import styles from "./home-hero.module.css";
import { heroStats } from "./home-hero.data";

export function HomeHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lastScrollY = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrollDirection(currentY > lastScrollY.current ? "down" : "up");
      lastScrollY.current = currentY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.28,
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        className={`${styles.hero} ${isVisible ? styles.heroVisible : ""} ${
          scrollDirection === "up" ? styles.scrollUp : styles.scrollDown
        }`}
        id="somos"
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
            <span className={styles.titleLine}>Haz que tu espacio se vea</span>
            <span className={styles.titleLine}>
              <span className={styles.accent}>como siempre lo imaginaste</span>
            </span>
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

      <div className={styles.heroAnchors} aria-hidden="true">
        <section id="ofertas" />
        <section id="proyectos" />
        <section id="ubicacion" />
        <section id="cotizacion" />
      </div>
    </>
  );
}
