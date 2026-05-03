"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HiArrowUpRight,
  HiCheck,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import { HomeFloatingQuote } from "@/features/home/components/home-floating-quote";
import { HomeNav } from "@/features/home/components/home-nav";
import {
  barandalesMobileNavLinks,
  barandalesNavLinks,
  barandalesPageContent,
  barandalesScrollSpyLinks,
  barandalesSecondaryNavLinks,
} from "./barandales-page.data";
import styles from "./barandales-page.module.css";

export function BarandalesPage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <main className={styles.page}>
      <HomeNav
        logoHref="/"
        mobileMenuLinks={barandalesMobileNavLinks}
        onQuoteOpen={() => setIsQuoteOpen(true)}
        primaryLinks={barandalesNavLinks}
        secondaryLinks={barandalesSecondaryNavLinks}
        scrollLinks={barandalesScrollSpyLinks}
      />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            {barandalesPageContent.eyebrow}
          </p>
          <h1 className={styles.title}>
            {barandalesPageContent.title}
            <span>{barandalesPageContent.accentTitle}</span>
          </h1>
          <p className={styles.description}>{barandalesPageContent.description}</p>

          <div className={styles.actions}>
            <a className={styles.primaryAction} href={barandalesPageContent.cta.href}>
              {barandalesPageContent.cta.label}
              <HiArrowUpRight aria-hidden="true" />
            </a>
            <Link className={styles.secondaryAction} href="/#proyectos">
              Ver trabajos
            </Link>
          </div>
        </div>

        <div className={styles.heroImageCard}>
          <Image
            src={barandalesPageContent.image.src}
            alt={barandalesPageContent.image.alt}
            fill
            sizes="(max-width: 900px) 100vw, 44vw"
            className={styles.heroImage}
            priority
          />
          <div className={styles.imageBadge}>
            <HiOutlineShieldCheck aria-hidden="true" />
            Protección clara para espacios abiertos
          </div>
        </div>
      </section>

      <section id="calidad" className={styles.highlights} aria-label="Puntos clave">
        {barandalesPageContent.highlights.map((highlight) => (
          <article className={styles.highlightCard} key={highlight}>
            <span className={styles.checkIcon} aria-hidden="true">
              <HiCheck />
            </span>
            <p>{highlight}</p>
          </article>
        ))}
      </section>

      <section
        id="proyectos"
        className={styles.detailGrid}
        aria-label="Opciones de barandales"
      >
        {barandalesPageContent.details.map((detail) => (
          <article className={styles.detailCard} key={detail.title}>
            <span className={styles.detailNumber} aria-hidden="true">
              0{barandalesPageContent.details.indexOf(detail) + 1}
            </span>
            <h2>{detail.title}</h2>
            <p>{detail.description}</p>
          </article>
        ))}
      </section>

      <section className={styles.process}>
        <div>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            Proceso claro
          </p>
          <h2>De la medida al resultado final</h2>
        </div>

        <ol className={styles.processList}>
          {barandalesPageContent.process.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section id="ubicacion" className={styles.contactSection}>
        <div>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            Contacto directo
          </p>
          <h2>Listos para revisar tu barandal</h2>
        </div>

        <div className={styles.contactGrid}>
          {barandalesPageContent.contact.map((item) => (
            <article className={styles.contactCard} key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <HomeFloatingQuote
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        onOpen={() => setIsQuoteOpen(true)}
      />
    </main>
  );
}
