import Image from "next/image";
import { FaFacebookF } from "react-icons/fa6";
import { HiOutlineBars3, HiOutlineMinusSmall, HiOutlinePlusSmall, HiOutlineXMark } from "react-icons/hi2";
import { phoneHref } from "@/features/conversion/contact-info";
import { PhoneIcon, WhatsAppIcon } from "@/features/conversion/contact-icons";
import type { NavItem } from "./home-nav.data";
import type { NavRenderState } from "./home-nav.types";
import { getNavItemKey } from "./home-nav.utils";
import styles from "./home-nav.module.css";

type HomeNavMobileProps = NavRenderState & {
  isOpen: boolean;
  links: readonly NavItem[];
  onClose: () => void;
  onToggle: () => void;
  compact?: boolean;
  whatsappHref?: string;
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
  compact = false,
  whatsappHref,
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

        {compact ? (
          <div className={styles.mobileActionRow}>
            <a
              className={styles.iconButton}
              href={phoneHref}
              aria-label="Llamar al 729 381 3723"
              data-ubicacion="seccion"
            >
              <PhoneIcon />
            </a>
            <button
              type="button"
              className={styles.iconButton}
              aria-expanded={isOpen}
              aria-controls="mobile-nav-panel"
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
              onClick={onToggle}
            >
              {isOpen ? <HiOutlineXMark aria-hidden="true" /> : <HiOutlineBars3 aria-hidden="true" />}
            </button>
          </div>
        ) : (
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
        )}
      </div>

      <div
        id="mobile-nav-panel"
        className={`${styles.mobileMenu} ${isOpen ? styles.mobileMenuOpen : ""}`}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className={styles.mobileMenuInner}>
          {compact ? null : (
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
              aria-label="Cerrar men\u00fa"
              onClick={onClose}
            >
              <HiOutlineMinusSmall aria-hidden="true" />
            </button>
          </div>
          )}

          <div className={styles.mobileMenuLinks}>
            {links.map((item, index) => (
              <a
                key={getNavItemKey(item, index)}
                href={item.href}
                className={`${styles.mobileMenuLink} ${
                  currentActiveHref === item.href ? styles.mobileMenuLinkActive : ""
                }`}
                aria-current={currentActiveHref === item.href ? "location" : undefined}
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

          {compact ? (
            <div className={styles.mobileMenuCtas}>
              {whatsappHref ? (
                <a
                  className={styles.mobileCtaPrimary}
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ubicacion="seccion"
                  onClick={onClose}
                >
                  <WhatsAppIcon />
                  WhatsApp
                </a>
              ) : null}
              <a
                className={styles.mobileCtaSecondary}
                href={phoneHref}
                data-ubicacion="seccion"
                onClick={onClose}
              >
                <PhoneIcon />
                Llamar
              </a>
            </div>
          ) : (
          <div className={styles.mobileMenuFooter}>
            <div className={styles.mobileInfoBlock}>
              <a
                className={styles.mobileInfoLink}
                href="tel:7293813723"
                aria-label="Llamar al 729 381 3723"
                data-ubicacion="seccion"
              >
                729 381 3723
              </a>
              <p>Contacto directo</p>
            </div>

            <div className={styles.mobileInfoBlock}>
              <p>Ubicaci\u00f3n</p>
              <p>Atenci\u00f3n residencial y comercial</p>
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
          )}
        </div>
      </div>
    </>
  );
}
