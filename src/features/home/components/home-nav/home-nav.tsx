"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FaFacebookF, FaLocationDot, FaPhoneVolume } from "react-icons/fa6";
import { HiOutlineMinusSmall, HiOutlinePlusSmall } from "react-icons/hi2";
import { useLockBodyScroll } from "../../hooks/use-lock-body-scroll";
import styles from "./home-nav.module.css";
import {
  desktopPrimaryLinks,
  desktopSecondaryLinks,
  mobileLinks,
  scrollSpyLinks,
} from "./home-nav.data";
import { useActiveSection } from "./use-active-section";

type HomeNavProps = {
  onQuoteOpen: () => void;
};

export function HomeNav({ onQuoteOpen }: HomeNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { activeHref, setActiveSection } = useActiveSection(scrollSpyLinks);
  useLockBodyScroll(isMobileMenuOpen);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleNavClick = (href: string) => {
    setActiveSection(href);
    setIsMobileMenuOpen(false);
  };

  const openQuoteForm = () => {
    setIsMobileMenuOpen(false);
    onQuoteOpen();
  };

  return (
    <header className={styles.navShell}>
      <nav className={styles.navbar} aria-label="Principal">
        <div className={styles.navGroup}>
          {desktopPrimaryLinks.map((item) => (
            <a
              key={item.href}
              className={`${styles.navLink} ${activeHref === item.href ? styles.navLinkActive : ""}`}
              href={item.href}
              aria-current={activeHref === item.href ? "page" : undefined}
              onClick={() => handleNavClick(item.href)}
            >
              {item.label}
            </a>
          ))}
        </div>

        <a
          className={styles.logoWrap}
          href="#inicio"
          aria-label="Aluminio y Vidrio Instala"
          onClick={() => handleNavClick("#inicio")}
        >
          <Image
            src="/img/logo.png"
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

          {desktopSecondaryLinks.map((item) => (
            <a
              key={item.href}
              className={`${styles.navLink} ${activeHref === item.href ? styles.navLinkActive : ""}`}
              href={item.href}
              aria-current={activeHref === item.href ? "page" : undefined}
              onClick={() => handleNavClick(item.href)}
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

          <button
            className={styles.primaryAction}
            type="button"
            onClick={openQuoteForm}
          >
            Crear cotización
          </button>
        </div>

        <div className={styles.mobileBar}>
          <a
            className={styles.mobileLogo}
            href="#inicio"
            aria-label="Aluminio y Vidrio Instala"
            onClick={() => handleNavClick("#inicio")}
          >
            <Image
              src="/img/logo.png"
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
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-panel"
            aria-label={isMobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
            onClick={() => setIsMobileMenuOpen((value) => !value)}
          >
            {isMobileMenuOpen ? (
              <HiOutlineMinusSmall aria-hidden="true" />
            ) : (
              <HiOutlinePlusSmall aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      <div
        id="mobile-nav-panel"
        className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ""}`}
      >
        <div className={styles.mobileMenuInner}>
          <div className={styles.mobileMenuHeader}>
            <a
              href="#inicio"
              className={styles.mobileBrand}
              aria-label="Aluminio y Vidrio Instala"
              onClick={() => handleNavClick("#inicio")}
            >
              <Image
                src="/img/logo.png"
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
              aria-label="Cerrar menu"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <HiOutlineMinusSmall aria-hidden="true" />
            </button>
          </div>

          <div className={styles.mobileMenuLinks}>
            {mobileLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`${styles.mobileMenuLink} ${
                  activeHref === item.href ? styles.mobileMenuLinkActive : ""
                }`}
                aria-current={activeHref === item.href ? "page" : undefined}
                onClick={(event) => {
                  if (item.href === "#cotizacion") {
                    event.preventDefault();
                    openQuoteForm();
                    return;
                  }

                  handleNavClick(item.href);
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
    </header>
  );
}
