import { hoursLabel, phoneHref, type Servicio } from "./contact-info";
import { PhoneIcon, WhatsAppIcon } from "./contact-icons";
import styles from "./conversion.module.css";

type ConversionHeroProps = {
  servicio: Servicio;
  eyebrow: string;
  title: string;
  titleMain?: string;
  titleAccent?: string;
  description: string;
  whatsappHref: string;
  fullScreen?: boolean;
  chips?: readonly string[];
  image: {
    src: string;
    mobileSrc: string;
    alt: string;
    width: number;
    height: number;
  };
};

const chipIcons = [
  <svg key="quote" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M5 12.5 9.2 17 19 7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
  <svg key="types" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 6h10v12H4zM14 9h6v9h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>,
  <svg key="hours" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 8v4.5L15 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>,
];

export function ConversionHero({
  servicio,
  eyebrow,
  title,
  titleMain,
  titleAccent,
  description,
  whatsappHref,
  fullScreen = false,
  chips,
  image,
}: ConversionHeroProps) {
  return (
    <section
      className={`${styles.hero} ${fullScreen ? styles.heroScreen : ""}`}
      data-servicio={servicio}
      data-ubicacion="hero"
    >
      <link
        rel="preload"
        as="image"
        href={image.mobileSrc}
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={image.src}
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      <picture className={styles.media}>
        <source media="(max-width: 767px)" srcSet={image.mobileSrc} />
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className={styles.shade} />
      <div className={styles.copy}>
        <p className={styles.kicker}>{eyebrow}</p>
        <h1 className={styles.title}>
          {titleMain && titleAccent ? (
            <>
              <span className={styles.titleMain}>{titleMain}</span>
              <span className={styles.titleAccent}>{titleAccent}</span>
            </>
          ) : (
            title
          )}
        </h1>
        <p className={styles.lead}>
          {description.split("\n").map((line, index) => (
            <span key={line}>
              {index > 0 ? <br /> : null}
              {line}
            </span>
          ))}
        </p>
        <div className={styles.actionRow}>
          <div className={styles.actions} data-hero-actions={fullScreen ? "" : undefined}>
            <a
              className={styles.primary}
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-ubicacion="hero"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
            <a className={styles.secondary} href={phoneHref} data-ubicacion="hero">
              <PhoneIcon />
              Llamar
            </a>
          </div>
          {chips && chips.length > 0 ? null : <p className={styles.hours}>{hoursLabel}</p>}
        </div>
        {chips && chips.length > 0 ? (
          <ul className={styles.chips}>
            {chips.map((chip, index) => (
              <li key={chip}>
                {chipIcons[index] ?? chipIcons[2]}
                {chip}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
