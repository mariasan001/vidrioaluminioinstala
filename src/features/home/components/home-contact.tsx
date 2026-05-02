"use client";

import { useSectionReveal } from "../hooks/use-section-reveal";
import styles from "./home-contact.module.css";
import { contactCards } from "./home-contact.data";

export function HomeContact() {
  const { isVisible, scrollDirection, sectionRef } = useSectionReveal();

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-visible={isVisible}
      data-scroll-direction={scrollDirection}
      id="cotizacion"
      aria-labelledby="home-contact-title"
    >
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          <span>contacto directo</span>
        </div>

        <div className={styles.heading}>
          <h2 id="home-contact-title" className={styles.title}>
            Cuentanos que quieres instalar
            <span className={styles.accent}>y aterrizamos el siguiente paso</span>
          </h2>
          <p className={styles.description}>
            Agenda una cotizacion para ventanas, puertas, canceles, pergolas,
            fachadas o barandales. Te atendemos en nuestra ubicacion o por
            llamada directa.
          </p>
        </div>
      </div>

      <div className={styles.infoGrid} id="ubicacion">
        {contactCards.map(({ Icon, ...card }) => (
          <a className={styles.infoCard} href={card.href} key={card.title}>
            <span className={styles.infoIcon} aria-hidden="true">
              <Icon />
            </span>
            <span className={styles.infoTitle}>{card.title}</span>
            <strong>{card.value}</strong>
            <p>{card.detail}</p>
            <span className={styles.infoAction}>{card.action}</span>
          </a>
        ))}
      </div>

      <footer className={styles.footer}>
        <div>
          <strong>Aluminio y Vidrio Instala</strong>
          <span>© 2026 · Todos los derechos reservados</span>
        </div>
        <span className={styles.credit}>Desarrollado por Aurean</span>
      </footer>
    </section>
  );
}
