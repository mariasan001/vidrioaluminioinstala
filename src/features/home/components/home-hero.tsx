"use client";

import Image from "next/image";
import { FaLocationDot } from "react-icons/fa6";
import styles from "./home-hero.module.css";
import { heroStats } from "./home-hero.data";

export function HomeHero() {
  return (
    <>
      <section className={styles.hero} id="somos">
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
        <section id="servicios" />
        <section id="ofertas" />
        <section id="proyectos" />
        <section id="ubicacion" />
        <section id="cotizacion" />
      </div>
    </>
  );
}
