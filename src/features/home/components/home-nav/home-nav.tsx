"use client";

import { useEffect, useState } from "react";
import { openQuoteDialog } from "../home-floating-quote/quote-dialog";
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
  activeHrefOverride,
  defaultActiveHref,
  logoHref = "#inicio",
  mobileMenuLinks = mobileLinks,
  primaryLinks = desktopPrimaryLinks,
  quoteHref,
  quoteLabel = "Crear cotización",
  quoteService,
  quoteWhatsappHref,
  secondaryLinks = desktopSecondaryLinks,
  scrollLinks = scrollSpyLinks,
  wide = false,
  compact = false,
}: HomeNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { activeHref, setActiveSection } = useActiveSection(
    scrollLinks,
    defaultActiveHref,
  );
  useLockBodyScroll(isMobileMenuOpen);
  const currentActiveHref = activeHrefOverride ?? activeHref;

  useEffect(() => {
    if (!compact) {
      return;
    }

    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [compact]);

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
    openQuoteDialog({
      origin: "navigation_quote_cta",
      service: quoteService,
      whatsappHref: quoteWhatsappHref,
    });
  };

  return (
    <header
      className={`${styles.navShell} ${wide ? styles.navShellWide : ""} ${
        compact ? styles.navShellCompact : ""
      } ${compact && isScrolled ? styles.navScrolled : ""}`}
    >
      <nav className={styles.navbar} aria-label="Principal">
        <HomeNavDesktop
          currentActiveHref={currentActiveHref}
          logoHref={logoHref}
          onNavClick={handleNavClick}
          onQuoteOpen={openQuoteForm}
          primaryLinks={primaryLinks}
          quoteHref={quoteHref}
          quoteLabel={quoteLabel}
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
          compact={compact}
          whatsappHref={quoteWhatsappHref}
        />
      </nav>
    </header>
  );
}
