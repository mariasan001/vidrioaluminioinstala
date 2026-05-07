import type { NavItem } from "./home-nav.data";

export type HomeNavProps = {
  activeHrefOverride?: string;
  defaultActiveHref?: string;
  logoHref?: string;
  mobileMenuLinks?: readonly NavItem[];
  primaryLinks?: readonly NavItem[];
  quoteService?: string;
  quoteWhatsappHref?: string;
  secondaryLinks?: readonly NavItem[];
  scrollLinks?: readonly NavItem[];
};

export type NavRenderState = {
  currentActiveHref: string;
  logoHref: string;
  onNavClick: (href: string) => void;
  onQuoteOpen: () => void;
};
