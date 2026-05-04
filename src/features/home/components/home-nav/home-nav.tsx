"use client";

import { useEffect, useState } from "react";
import { useLockBodyScroll } from "../../hooks/use-lock-body-scroll";
import {
  desktopPrimaryLinks,
  desktopSecondaryLinks,
  mobileLinks,
  scrollSpyLinks,
} from "./home-nav.data";
import { HomeNavDesktop } from "./home-nav-desktop";
import { HomeNavMobile } from "./home-nav-mobile";
import styles from "./home-nav.module.css";
import type { HomeNavProps } from "./home-nav.types";
import { useActiveSection } from "./use-active-section";

export function HomeNav({
  onQuoteOpen,
  activeHrefOverride,
  defaultActiveHref,
  logoHref = "#inicio",
  mobileMenuLinks = mobileLinks,
  primaryLinks = desktopPrimaryLinks,
  secondaryLinks = desktopSecondaryLinks,
  scrollLinks = scrollSpyLinks,
}: HomeNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { activeHref, setActiveSection } = useActiveSection(
    scrollLinks,
    defaultActiveHref,
  );
  useLockBodyScroll(isMobileMenuOpen);
  const currentActiveHref = activeHrefOverride ?? activeHref;

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
        <HomeNavDesktop
          currentActiveHref={currentActiveHref}
          logoHref={logoHref}
          onNavClick={handleNavClick}
          onQuoteOpen={openQuoteForm}
          primaryLinks={primaryLinks}
          secondaryLinks={secondaryLinks}
        />

        <HomeNavMobile
          currentActiveHref={currentActiveHref}
          isOpen={isMobileMenuOpen}
          links={mobileMenuLinks}
          logoHref={logoHref}
          onClose={() => setIsMobileMenuOpen(false)}
          onNavClick={handleNavClick}
          onQuoteOpen={openQuoteForm}
          onToggle={() => setIsMobileMenuOpen((value) => !value)}
        />
      </nav>
    </header>
  );
}
