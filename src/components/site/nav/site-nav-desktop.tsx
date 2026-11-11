import Image from "next/image";
import { FaFacebookF, FaLocationDot, FaPhoneVolume } from "react-icons/fa6";
import { phoneDisplay, phoneHref } from "@/content/site";
import type { NavItem } from "./site-nav.data";
import type { NavRenderState } from "./site-nav.types";
import { getNavItemKey } from "./site-nav.utils";
import styles from "./site-nav.module.css";

type SiteNavDesktopProps = NavRenderState & {
  primaryLinks: readonly NavItem[];
  quoteHref?: string;
  quoteLabel: string;
  secondaryLinks: readonly NavItem[];
};

export function SiteNavDesktop({
  currentActiveHref,
  logoHref,
  onNavClick,
  onQuoteOpen,
  primaryLinks,
  quoteHref,
  quoteLabel,
  secondaryLinks,
}: SiteNavDesktopProps) {
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
        <a className={styles.contactInline} href={phoneHref} data-ubicacion="seccion">
          <FaPhoneVolume className={styles.inlineIcon} aria-hidden="true" />
          <span className={styles.contactLabel}>Llámanos:</span>
          <strong>{phoneDisplay}</strong>
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

        {quoteHref ? (
          <a className={styles.primaryAction} href={quoteHref}>
            {quoteLabel}
          </a>
        ) : (
          <button className={styles.primaryAction} type="button" onClick={onQuoteOpen}>
            {quoteLabel}
          </button>
        )}
      </div>
    </>
  );
}
