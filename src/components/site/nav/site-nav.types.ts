import type { NavItem } from "./site-nav.data";

export type SiteNavProps = {
  activeHrefOverride?: string;
  defaultActiveHref?: string;
  logoHref?: string;
  mobileMenuLinks?: readonly NavItem[];
  primaryLinks?: readonly NavItem[];
  quoteHref?: string;
  quoteLabel?: string;
  quoteService?: string;
  quoteWhatsappHref?: string;
  secondaryLinks?: readonly NavItem[];
  scrollLinks?: readonly NavItem[];
  wide?: boolean;
  compact?: boolean;
};

export type NavRenderState = {
  currentActiveHref: string;
  logoHref: string;
  onNavClick: (href: string) => void;
  onQuoteOpen: () => void;
  quoteHref?: string;
};
