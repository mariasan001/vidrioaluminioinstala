import Image from "next/image";
import { FaFacebookF } from "react-icons/fa6";
import { HiOutlineMinusSmall, HiOutlinePlusSmall } from "react-icons/hi2";
import type { NavItem } from "./home-nav.data";
import type { NavRenderState } from "./home-nav.types";
import { getNavItemKey } from "./home-nav.utils";
import styles from "./home-nav.module.css";

type HomeNavMobileProps = NavRenderState & {
  isOpen: boolean;
  links: readonly NavItem[];
  onClose: () => void;
  onToggle: () => void;
};

export function HomeNavMobile({
  currentActiveHref,
  isOpen,
  links,
  logoHref,
  onClose,
  onNavClick,
  onQuoteOpen,
  onToggle,
}: HomeNavMobileProps) {
  return (
    <>
      <div className={styles.mobileBar}>
        <a
          className={styles.mobileLogo}
          href={logoHref}
          aria-label="Aluminio y Vidrio Instala"
          onClick={() => onNavClick(logoHref)}
        >
          <Image
            src="/img/logo-nav.webp"
            alt="Aluminio y Vidrio Instala"
            width={188}
            height={62}
            className={styles.mobileLogoImage}
            priority
          />
        </a>

        <button
          type="button"
          className={styles.mobileMenuButton}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-panel"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={onToggle}
        >
          {isOpen ? (
            <HiOutlineMinusSmall aria-hidden="true" />
          ) : (
            <HiOutlinePlusSmall aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        id="mobile-nav-panel"
        className={`${styles.mobileMenu} ${isOpen ? styles.mobileMenuOpen : ""}`}
      >
        <div className={styles.mobileMenuInner}>
          <div className={styles.mobileMenuHeader}>
            <a
              href={logoHref}
              className={styles.mobileBrand}
              aria-label="Aluminio y Vidrio Instala"
              onClick={() => onNavClick(logoHref)}
            >
              <Image
                src="/img/logo-nav.webp"
                alt="Aluminio y Vidrio Instala"
                width={188}
                height={62}
                className={styles.mobileBrandImage}
                priority
              />
            </a>
            <button
              type="button"
              className={styles.mobileMenuButton}
              aria-label="Cerrar menú"
              onClick={onClose}
            >
              <HiOutlineMinusSmall aria-hidden="true" />
            </button>
          </div>

          <div className={styles.mobileMenuLinks}>
            {links.map((item) => (
              <a
                key={getNavItemKey(item)}
                href={item.href}
                className={`${styles.mobileMenuLink} ${
                  currentActiveHref === item.href ? styles.mobileMenuLinkActive : ""
                }`}
                aria-current={currentActiveHref === item.href ? "page" : undefined}
                onClick={(event) => {
                  if (item.href === "#cotizacion") {
                    event.preventDefault();
                    onQuoteOpen();
                    return;
                  }

                  onNavClick(item.href);
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className={styles.mobileMenuFooter}>
            <div className={styles.mobileInfoBlock}>
              <p>729 381 3723</p>
              <p>Contacto directo</p>
            </div>

            <div className={styles.mobileInfoBlock}>
              <p>Ubicación</p>
              <p>Atención residencial y comercial</p>
            </div>

            <div className={styles.mobileSocials}>
              <a
                className={styles.mobileSocialLink}
                href="https://www.facebook.com/VentanasdeAluminioOmega/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <FaFacebookF aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

