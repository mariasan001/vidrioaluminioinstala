import { FaLocationDot } from "react-icons/fa6";
import { ServiceHeroQuoteButton } from "./service-hero-quote-button";
import styles from "./service-hero.module.css";

export type ServiceHeroAction =
  | {
      label: string;
      type: "quote";
    }
  | {
      href: string;
      label: string;
      type: "link";
    };

export type ServiceHeroProps = {
  actions: readonly ServiceHeroAction[];
  accentTitle: string;
  description: string;
  eyebrow: string;
  image: {
    alt: string;
    mobileSrc?: string;
    src: string;
  };
  stats: readonly string[];
  title: string;
};

export function ServiceHero({
  actions,
  accentTitle,
  description,
  eyebrow,
  image,
  stats,
  title,
}: ServiceHeroProps) {
  const mobileImageSrc = image.mobileSrc ?? image.src;

  return (
    <section className={styles.hero}>
      <picture>
        <source media="(max-width: 720px)" srcSet={mobileImageSrc} />
        <img
          src={image.src}
          alt={image.alt}
          className={styles.backgroundImage}
          decoding="async"
          fetchPriority="high"
        />
      </picture>

      <div className={styles.heroShade} />

      <p className={styles.eyebrow}>
        <FaLocationDot aria-hidden="true" className={styles.eyebrowIcon} />
        <span>{eyebrow}</span>
      </p>

      <div className={styles.heroLead}>
        <div className={styles.contentPanel}>
          <span className={styles.panelKicker}>Solución a medida</span>

          <h1 className={styles.title}>
            {title}
            <span className={styles.accent}>{accentTitle}</span>
          </h1>

          <div className={styles.content}>
            <p className={styles.description}>{description}</p>

            <div className={styles.actions}>
              {actions.map((action) =>
                action.type === "quote" ? (
                  <ServiceHeroQuoteButton
                    key={action.label}
                    label={action.label}
                  />
                ) : (
                  <a
                    className={styles.secondaryAction}
                    href={action.href}
                    key={action.label}
                  >
                    {action.label}
                  </a>
                ),
              )}
            </div>
          </div>
        </div>

        <aside className={styles.statsPanel} aria-label="Aplicaciones principales">
          <div className={styles.statsHeader}>
            <span>Aplicaciones clave</span>
            <strong>{String(stats.length).padStart(2, "0")}</strong>
          </div>

          <div className={styles.stats}>
            {stats.map((stat, index) => (
              <div key={stat} className={styles.stat}>
                <span className={styles.statIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className={styles.statLabel}>
                  <span className={styles.statDot} aria-hidden="true" />
                  <span>{stat}</span>
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
