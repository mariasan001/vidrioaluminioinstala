import type { NavItem } from "./home-nav.data";

export type HomeNavProps = {
  onQuoteOpen: () => void;
  activeHrefOverride?: string;
  logoHref?: string;
  mobileMenuLinks?: readonly NavItem[];
  primaryLinks?: readonly NavItem[];
  secondaryLinks?: readonly NavItem[];
  scrollLinks?: readonly NavItem[];
};

export type NavRenderState = {
  currentActiveHref: string;
  logoHref: string;
  onNavClick: (href: string) => void;
  onQuoteOpen: () => void;
};

