import Image from "next/image";
import { FaFacebookF, FaLocationDot, FaPhoneVolume } from "react-icons/fa6";
import type { NavItem } from "./home-nav.data";
import type { NavRenderState } from "./home-nav.types";
import { getNavItemKey } from "./home-nav.utils";
import styles from "./home-nav.module.css";

type HomeNavDesktopProps = NavRenderState & {
  primaryLinks: readonly NavItem[];
  secondaryLinks: readonly NavItem[];
};

export function HomeNavDesktop({
  currentActiveHref,
  logoHref,
  onNavClick,
  onQuoteOpen,
  primaryLinks,
  secondaryLinks,
}: HomeNavDesktopProps) {
  return (
    <>
      <div className={styles.navGroup}>
        {primaryLinks.map((item, index) => (
          <a
            key={getNavItemKey(item, index)}
            className={`${styles.navLink} ${
              currentActiveHref === item.href ? styles.navLinkActive : ""
            }`}
            href={item.href}
            aria-current={currentActiveHref === item.href ? "page" : undefined}
            onClick={() => onNavClick(item.href)}
          >
            {item.label}
          </a>
        ))}
      </div>

      <a
        className={styles.logoWrap}
        href={logoHref}
        aria-label="Aluminio y Vidrio Instala"
        onClick={() => onNavClick(logoHref)}
      >
        <Image
          src="/img/logo-nav.webp"
          alt="Aluminio y Vidrio Instala"
          width={188}
          height={62}
          className={styles.logoImage}
          priority
        />
      </a>

      <div className={`${styles.navGroup} ${styles.navGroupRight}`}>
        <a className={styles.contactInline} href="tel:7293813723">
          <FaPhoneVolume className={styles.inlineIcon} aria-hidden="true" />
          <span className={styles.contactLabel}>Llámanos:</span>
          <strong>729 381 3723</strong>
        </a>

        {secondaryLinks.map((item, index) => (
          <a
            key={getNavItemKey(item, index)}
            className={`${styles.navLink} ${
              currentActiveHref === item.href ? styles.navLinkActive : ""
            }`}
            href={item.href}
            aria-current={currentActiveHref === item.href ? "page" : undefined}
            onClick={() => onNavClick(item.href)}
          >
            <FaLocationDot className={styles.navIcon} aria-hidden="true" />
            {item.label}
          </a>
        ))}

        <a
          className={styles.socialLink}
          href="https://www.facebook.com/VentanasdeAluminioOmega/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <FaFacebookF aria-hidden="true" />
        </a>

        <button className={styles.primaryAction} type="button" onClick={onQuoteOpen}>
          Crear cotización
        </button>
      </div>
    </>
  );
}
