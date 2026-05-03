"use client";

import styles from "./home-contact.module.css";
import { contactContent } from "./home-contact.data";
import { contactIcons } from "./home-contact.icons";
import { useContactReveal } from "./use-contact-reveal";

export function HomeContact() {
  const {
    isInView,
    isReady,
    isVisible,
    scrollDirection,
    sectionRef,
  } = useContactReveal();

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-in-view={isInView}
      data-ready={isReady}
      data-visible={isVisible}
      data-scroll-direction={scrollDirection}
      id="ubicacion"
      aria-labelledby="home-contact-title"
    >
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          <span>{contactContent.eyebrow}</span>
        </div>

        <div className={styles.heading}>
          <h2 id="home-contact-title" className={styles.title}>
            {contactContent.title}
            <span className={styles.accent}>{contactContent.accentTitle}</span>
          </h2>
          <p className={styles.description}>{contactContent.description}</p>
        </div>
      </div>

      <div className={styles.infoGrid}>
        {contactContent.cards.map((card) => {
          const Icon = contactIcons[card.icon];
          const href = "href" in card ? card.href : undefined;
          const isExternal = href?.startsWith("http") ?? false;
          const isFeatured = "featured" in card && card.featured;
          const cardContent = (
            <>
              <span className={styles.infoIcon} aria-hidden="true">
                <Icon />
              </span>
              <span className={styles.infoTitle}>{card.title}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
              <span className={styles.infoAction}>{card.action}</span>
            </>
          );

          return href ? (
            <a
              className={styles.infoCard}
              data-featured={isFeatured ? "true" : undefined}
              href={href}
              key={card.title}
              rel={isExternal ? "noreferrer" : undefined}
              target={isExternal ? "_blank" : undefined}
            >
              {cardContent}
            </a>
          ) : (
            <article
              className={styles.infoCard}
              data-featured={isFeatured ? "true" : undefined}
              key={card.title}
            >
              {cardContent}
            </article>
          );
        })}
      </div>

      <footer className={styles.footer}>
        <div>
          <strong>{contactContent.footer.company}</strong>
          <span>{contactContent.footer.rights}</span>
        </div>
        <span className={styles.credit}>{contactContent.footer.credit}</span>
      </footer>
    </section>
  );
}
