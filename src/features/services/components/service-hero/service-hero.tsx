import Image from "next/image";
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
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        className={`${styles.backgroundImage} ${styles.desktopImage}`}
        sizes="100vw"
      />

      <Image
        src={mobileImageSrc}
        alt={image.alt}
        fill
        priority
        className={`${styles.backgroundImage} ${styles.mobileImage}`}
        sizes="100vw"
      />

      <div className={styles.heroShade} />

      <p className={styles.eyebrow}>
        <FaLocationDot aria-hidden="true" className={styles.eyebrowIcon} />
        <span>{eyebrow}</span>
      </p>

      <div className={styles.heroLead}>
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

      <div className={styles.stats}>
        {stats.map((stat) => (
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
